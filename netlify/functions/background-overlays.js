import * as XLSX from 'xlsx'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] }
const CACHE_TTL_MS = 1000 * 60 * 60 * 6
const PAGE_SIZE = 1000

const CITY_CONFIG = {
  phoenix: {
    bbox: [-112.35, 33.28, -111.8, 33.65],
    censusWhere: "STATE = '04' AND COUNTY = '013'",
  },
}

const cache = new Map()

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

function normalizeUrl(href) {
  if (!href) return null
  if (href.startsWith('http')) return href
  if (href.startsWith('/')) return `https://azdot.gov${href}`
  return `https://azdot.gov/${href.replace(/^\.?\//, '')}`
}

function pickFirstWorkbookUrl(html) {
  const matches = [...html.matchAll(/href="([^"]*AADT-PUBLICATION_[^"]+\.xlsx)"/gi)]
  if (!matches.length) return null
  return normalizeUrl(matches[0][1])
}

function getRowValue(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key]
  }
  return null
}

async function getLatestAadtWorkbookUrl() {
  const res = await fetch('https://azdot.gov/planning/data-and-information/traffic-monitoring')
  if (!res.ok) throw new Error(`ADOT traffic page failed: ${res.status}`)
  const html = await res.text()
  const workbookUrl = pickFirstWorkbookUrl(html)
  if (!workbookUrl) throw new Error('Could not find the latest ADOT AADT workbook link')
  return workbookUrl
}

async function loadAadtWorkbookMap(workbookUrl) {
  const res = await fetch(workbookUrl)
  if (!res.ok) throw new Error(`ADOT workbook download failed: ${res.status}`)
  const workbook = XLSX.read(Buffer.from(await res.arrayBuffer()), { type: 'buffer' })
  const sheetName = workbook.SheetNames.find((name) => /all adot sections/i.test(name)) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rowsAsArrays = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false })
  const headerIndex = rowsAsArrays.findIndex((row) => Array.isArray(row) && row.includes('Section JoinID'))
  if (headerIndex < 0) throw new Error('Could not find the ADOT workbook header row')

  const headers = rowsAsArrays[headerIndex]
  const rows = rowsAsArrays
    .slice(headerIndex + 1)
    .filter((row) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== ''))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header || `__EMPTY_${index}`, row[index] ?? null])),
    )

  const bySectionJoinId = new Map()
  for (const row of rows) {
    const sectionJoinId = String(getRowValue(row, ['Section JoinID', 'SectionJoinID']) || '').trim()
    const aadt = Number(getRowValue(row, ['AADT 2024']))
    if (!sectionJoinId || !Number.isFinite(aadt) || aadt <= 0) continue

    bySectionJoinId.set(sectionJoinId, {
      sectionJoinId,
      reference: String(getRowValue(row, ['Reference']) || '').trim(),
      road: String(getRowValue(row, ['Road']) || '').trim(),
      aadt,
    })
  }

  return { bySectionJoinId, sheetName, rowCount: bySectionJoinId.size }
}

async function fetchPagedAdotTrafficSections(bbox) {
  const features = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const params = new URLSearchParams({
      where: "VolCountStatus = 'Current'",
      geometry: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`,
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'SectionJoinId,ReferenceEquation,Road,County,VolCountStatus',
      returnGeometry: 'true',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
      outSR: '4326',
      f: 'geojson',
    })

    const res = await fetch(`https://azgeo.az.gov/arcgis/rest/services/adot/TrafficSections/MapServer/1/query?${params}`)
    if (!res.ok) throw new Error(`ADOT traffic sections query failed: ${res.status}`)
    const json = await res.json()
    const page = json.features || []
    features.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return features
}

function sampleCoordinates(coords, sampleCount = 5) {
  if (!Array.isArray(coords) || coords.length === 0) return []
  if (coords.length <= sampleCount) return coords

  const picks = []
  for (let i = 0; i < sampleCount; i += 1) {
    const idx = Math.round((i * (coords.length - 1)) / (sampleCount - 1))
    picks.push(coords[idx])
  }
  return picks
}

function geometryToSamplePoints(geometry) {
  if (!geometry) return []
  if (geometry.type === 'LineString') return sampleCoordinates(geometry.coordinates)
  if (geometry.type === 'MultiLineString') {
    return geometry.coordinates.flatMap((part) => sampleCoordinates(part, 4))
  }
  return []
}

function buildAadtOverlay(geometryFeatures, workbookMap) {
  const joined = geometryFeatures
    .map((feature) => {
      const joinId = String(feature.properties?.SectionJoinId || '').trim()
      const workbookRow = workbookMap.get(joinId)
      if (!workbookRow) return null
      return { feature, workbookRow }
    })
    .filter(Boolean)

  const maxAadt = Math.max(...joined.map(({ workbookRow }) => workbookRow.aadt), 1)

  return {
    type: 'FeatureCollection',
    features: joined.flatMap(({ feature, workbookRow }) =>
      geometryToSamplePoints(feature.geometry).map((coord) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [coord[0], coord[1]] },
        properties: {
          sectionJoinId: workbookRow.sectionJoinId,
          road: workbookRow.road || feature.properties?.Road || 'ADOT corridor',
          reference: workbookRow.reference,
          aadt: workbookRow.aadt,
          intensityNorm: workbookRow.aadt / maxAadt,
        },
      })),
    ),
  }
}

async function fetchPopulationFeatures(cityConfig) {
  const params = new URLSearchParams({
    where: cityConfig.censusWhere,
    geometry: `${cityConfig.bbox[0]},${cityConfig.bbox[1]},${cityConfig.bbox[2]},${cityConfig.bbox[3]}`,
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'GEOID,POP100,CENTLAT,CENTLON',
    returnGeometry: 'false',
    outSR: '4326',
    f: 'json',
  })

  const res = await fetch(`https://tigerweb.geo.census.gov/arcgis/rest/services/Census2020/Tracts_Blocks/MapServer/1/query?${params}`)
  if (!res.ok) throw new Error(`Census block group query failed: ${res.status}`)
  const json = await res.json()
  return json.features || []
}

function buildPopulationOverlay(features) {
  const valid = features
    .map((feature) => {
      const attr = feature.attributes || {}
      const lat = Number(attr.CENTLAT)
      const lon = Number(attr.CENTLON)
      const population = Number(attr.POP100)
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(population) || population <= 0) return null
      return {
        geoid: attr.GEOID,
        lat,
        lon,
        population,
      }
    })
    .filter(Boolean)

  const maxPopulation = Math.max(...valid.map((item) => item.population), 1)

  return {
    type: 'FeatureCollection',
    features: valid.map((item) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [item.lon, item.lat] },
      properties: {
        geoid: item.geoid,
        population: item.population,
        intensityNorm: item.population / maxPopulation,
      },
    })),
  }
}

async function buildCityOverlays(cityId) {
  const cityConfig = CITY_CONFIG[cityId]
  if (!cityConfig) {
    return {
      cityId,
      meta: {
        mode: 'live',
        fetchedAt: new Date().toISOString(),
        sourceSummary: 'No live overlay connector is configured for this city yet.',
      },
      layers: {
        aadt: EMPTY_FEATURE_COLLECTION,
        population: EMPTY_FEATURE_COLLECTION,
      },
    }
  }

  const workbookUrl = await getLatestAadtWorkbookUrl()
  const workbook = await loadAadtWorkbookMap(workbookUrl)
  const adotGeometry = await fetchPagedAdotTrafficSections(cityConfig.bbox)
  const censusFeatures = await fetchPopulationFeatures(cityConfig)

  return {
    cityId,
    meta: {
      mode: 'live',
      fetchedAt: new Date().toISOString(),
      sourceSummary: 'Live ADOT traffic workbook + ADOT traffic-section geometry + Census 2020 block-group centroids.',
      aadtWorkbookUrl: workbookUrl,
      aadtSheetName: workbook.sheetName,
      aadtWorkbookRows: workbook.rowCount,
      aadtSectionFeatures: adotGeometry.length,
      censusBlockGroups: censusFeatures.length,
    },
    layers: {
      aadt: buildAadtOverlay(adotGeometry, workbook.bySectionJoinId),
      population: buildPopulationOverlay(censusFeatures),
    },
  }
}

async function getOverlayPayload(cityId, forceRefresh = false) {
  const cached = cache.get(cityId)
  if (forceRefresh) {
    cache.delete(cityId)
  }
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const value = await buildCityOverlays(cityId)
  const aadtCount = value?.layers?.aadt?.features?.length || 0
  const populationCount = value?.layers?.population?.features?.length || 0
  if (aadtCount > 0 || populationCount > 0) {
    cache.set(cityId, { value, expiresAt: Date.now() + CACHE_TTL_MS })
  }
  return value
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed. Use GET.' })
  }

  try {
    const cityId = event.queryStringParameters?.city || 'phoenix'
    const forceRefresh = event.queryStringParameters?.refresh === '1'
    const payload = await getOverlayPayload(cityId, forceRefresh)
    return jsonResponse(200, payload)
  } catch (error) {
    return jsonResponse(500, {
      error: 'Failed to load live background overlays',
      message: error.message,
    })
  }
}
