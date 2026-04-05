import * as XLSX from 'xlsx'
import { gunzipSync } from 'node:zlib'
import { buildModeShiftOpportunityLayer } from '../../src/shared/fixedGuidewayAnchors.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] }
const CACHE_TTL_MS = 1000 * 60 * 60 * 6
const PAGE_SIZE = 1000
const TIGER_TRANSPORTATION_SERVICE_URL = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation_LargeScale/MapServer'
const TIGER_DELAY_CACHE_TTL_MS = 1000 * 60 * 60 * 6
const DELAY_GRID_SIZE_DEGREES = 0.03
const TIGER_DELAY_WEIGHTS = {
  primary: 1.6,
  secondary: 1.1,
  local: 0.45,
}

const CITY_CONFIG = {
  phoenix: {
    bbox: [-112.35, 33.28, -111.8, 33.65],
    censusWhere: "STATE = '04' AND COUNTY = '013'",
  },
}

const cache = new Map()
const tigerDelayCellCache = new Map()

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

function pickLatestArizonaLodesWacUrl(html) {
  const matches = [...html.matchAll(/href="(az_wac_S000_JT00_(\d{4})\.csv\.gz)"/gi)]
  if (!matches.length) return null

  const latest = matches
    .map((match) => ({ href: match[1], year: Number(match[2]) }))
    .filter((item) => Number.isFinite(item.year))
    .sort((a, b) => b.year - a.year)[0]

  return latest ? `https://lehd.ces.census.gov/data/lodes/LODES8/az/wac/${latest.href}` : null
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

async function getLatestArizonaJobsUrl() {
  const res = await fetch('https://lehd.ces.census.gov/data/lodes/LODES8/az/wac/')
  if (!res.ok) throw new Error(`LODES directory listing failed: ${res.status}`)
  const html = await res.text()
  const jobsUrl = pickLatestArizonaLodesWacUrl(html)
  if (!jobsUrl) throw new Error('Could not find the latest Arizona LODES WAC file')
  return jobsUrl
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

async function queryTigerLayerCountForEnvelope(layerId, envelope) {
  const params = new URLSearchParams({
    where: '1=1',
    geometry: `${envelope[0]},${envelope[1]},${envelope[2]},${envelope[3]}`,
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    returnCountOnly: 'true',
    f: 'json',
  })

  const res = await fetch(`${TIGER_TRANSPORTATION_SERVICE_URL}/${layerId}/query?${params}`)
  if (!res.ok) throw new Error(`TIGER transportation query failed for layer ${layerId}: ${res.status}`)
  const json = await res.json()
  if (json.error) {
    throw new Error(json.error.message || `TIGER transportation query failed for layer ${layerId}`)
  }

  return Number(json.count || 0)
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

function round(value, decimals = 1) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function cellKeyForCoordinate([lng, lat], cellSize = DELAY_GRID_SIZE_DEGREES) {
  const lngIndex = Math.floor(lng / cellSize)
  const latIndex = Math.floor(lat / cellSize)
  return `${lngIndex}:${latIndex}`
}

function cellCenterFromKey(key, cellSize = DELAY_GRID_SIZE_DEGREES) {
  const [lngIndexText, latIndexText] = key.split(':')
  const lngIndex = Number(lngIndexText)
  const latIndex = Number(latIndexText)
  return [
    (lngIndex + 0.5) * cellSize,
    (latIndex + 0.5) * cellSize,
  ]
}

function cellEnvelopeFromKey(key, cellSize = DELAY_GRID_SIZE_DEGREES) {
  const [lngIndexText, latIndexText] = key.split(':')
  const lngIndex = Number(lngIndexText)
  const latIndex = Number(latIndexText)
  const minLng = lngIndex * cellSize
  const minLat = latIndex * cellSize

  return [minLng, minLat, minLng + cellSize, minLat + cellSize]
}

function getOrCreateDelayGridCell(grid, key) {
  if (!grid.has(key)) {
    grid.set(key, {
      aadtMax: 0,
      aadtMeanAccumulator: 0,
      aadtSampleCount: 0,
      tigerWeightedDensity: 0,
      tigerPrimaryTouches: 0,
      tigerSecondaryTouches: 0,
      tigerLocalTouches: 0,
    })
  }
  return grid.get(key)
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

async function queryTigerDelayCountsByCell(cellKeys) {
  const uniqueKeys = [...new Set(cellKeys)]

  const entries = await Promise.all(
    uniqueKeys.map(async (key) => {
      const cached = tigerDelayCellCache.get(key)
      if (cached && cached.expiresAt > Date.now()) {
        return [key, cached.value]
      }

      const envelope = cellEnvelopeFromKey(key)
      const [primary, secondary, local] = await Promise.all([
        queryTigerLayerCountForEnvelope(0, envelope),
        queryTigerLayerCountForEnvelope(1, envelope),
        queryTigerLayerCountForEnvelope(2, envelope),
      ])

      const value = { primary, secondary, local }
      tigerDelayCellCache.set(key, { value, expiresAt: Date.now() + TIGER_DELAY_CACHE_TTL_MS })
      return [key, value]
    }),
  )

  return Object.fromEntries(entries)
}

async function buildDelayEmissionsOverlay(roadCo2Pressure) {
  const grid = new Map()
  const roadFeatures = roadCo2Pressure?.features || []

  roadFeatures.forEach((feature) => {
    const coordinates = feature?.geometry?.coordinates
    if (!Array.isArray(coordinates) || coordinates.length !== 2) return

    const key = cellKeyForCoordinate(coordinates)
    const cell = getOrCreateDelayGridCell(grid, key)
    const aadt = Number(feature?.properties?.aadt) || 0
    cell.aadtMax = Math.max(cell.aadtMax, aadt)
    cell.aadtMeanAccumulator += aadt
    cell.aadtSampleCount += 1
  })

  const cellsWithTraffic = [...grid.entries()].filter(([, cell]) => cell.aadtSampleCount > 0)
  const tigerCountsByCell = await queryTigerDelayCountsByCell(cellsWithTraffic.map(([key]) => key))

  cellsWithTraffic.forEach(([key, cell]) => {
    const tigerCounts = tigerCountsByCell[key] || { primary: 0, secondary: 0, local: 0 }
    cell.tigerPrimaryTouches = tigerCounts.primary
    cell.tigerSecondaryTouches = tigerCounts.secondary
    cell.tigerLocalTouches = tigerCounts.local
    cell.tigerWeightedDensity =
      (tigerCounts.primary * TIGER_DELAY_WEIGHTS.primary)
      + (tigerCounts.secondary * TIGER_DELAY_WEIGHTS.secondary)
      + (tigerCounts.local * TIGER_DELAY_WEIGHTS.local)
  })

  const maxAadt = Math.max(...cellsWithTraffic.map(([, cell]) => cell.aadtMax), 1)
  const maxAadtSampleCount = Math.max(...cellsWithTraffic.map(([, cell]) => cell.aadtSampleCount), 1)
  const maxTigerWeightedDensity = Math.max(...cellsWithTraffic.map(([, cell]) => cell.tigerWeightedDensity), 1)

  const features = cellsWithTraffic.map(([key, cell]) => {
      const aadtNorm = cell.aadtMax / maxAadt
      const trafficClusterNorm = cell.aadtSampleCount / maxAadtSampleCount
      const roadComplexityNorm = cell.tigerWeightedDensity / maxTigerWeightedDensity
      const delayScore =
        (0.6 * aadtNorm)
        + (0.25 * roadComplexityNorm)
        + (0.15 * trafficClusterNorm)
      const [lng, lat] = cellCenterFromKey(key)

      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          delayEmissionsHotspots: Math.round(delayScore * 100),
          delayProxyAadt: Math.round(cell.aadtMax),
          delayProxyMeanAadt: Math.round(cell.aadtMeanAccumulator / Math.max(cell.aadtSampleCount, 1)),
          tigerWeightedDensity: round(cell.tigerWeightedDensity, 1),
          tigerPrimaryTouches: cell.tigerPrimaryTouches,
          tigerSecondaryTouches: cell.tigerSecondaryTouches,
          tigerLocalTouches: cell.tigerLocalTouches,
          intensityNorm: delayScore,
        },
      }
    })

  return {
    layer: {
      type: 'FeatureCollection',
      features,
    },
    meta: {
      cellsQueried: cellsWithTraffic.length,
      tigerPrimaryTouches: cellsWithTraffic.reduce((sum, [, cell]) => sum + cell.tigerPrimaryTouches, 0),
      tigerSecondaryTouches: cellsWithTraffic.reduce((sum, [, cell]) => sum + cell.tigerSecondaryTouches, 0),
      tigerLocalTouches: cellsWithTraffic.reduce((sum, [, cell]) => sum + cell.tigerLocalTouches, 0),
    },
  }
}

async function loadArizonaJobsByBlockGroup(blockGroupIds) {
  const jobsUrl = await getLatestArizonaJobsUrl()
  const res = await fetch(jobsUrl)
  if (!res.ok) throw new Error(`Arizona LODES jobs download failed: ${res.status}`)

  const csvText = gunzipSync(Buffer.from(await res.arrayBuffer())).toString('utf8')
  const lines = csvText.split(/\r?\n/)
  const headers = (lines[0] || '').split(',')
  const geocodeIndex = headers.indexOf('w_geocode')
  const jobsIndex = headers.indexOf('C000')

  if (geocodeIndex < 0 || jobsIndex < 0) {
    throw new Error('Arizona LODES jobs file is missing expected columns')
  }

  const byBlockGroup = Object.create(null)
  const blockGroupIdSet = new Set(blockGroupIds)
  let matchedRows = 0

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line) continue

    const columns = line.split(',')
    const workBlock = columns[geocodeIndex]
    if (!workBlock || workBlock.length < 12) continue

    const blockGroupId = workBlock.slice(0, 12)
    if (!blockGroupIdSet.has(blockGroupId)) continue

    const jobs = Number(columns[jobsIndex])
    if (!Number.isFinite(jobs) || jobs <= 0) continue

    byBlockGroup[blockGroupId] = (byBlockGroup[blockGroupId] || 0) + jobs
    matchedRows += 1
  }

  const yearMatch = jobsUrl.match(/_(\d{4})\.csv\.gz$/)

  return {
    byBlockGroup,
    jobsUrl,
    jobsYear: yearMatch ? Number(yearMatch[1]) : null,
    matchedRows,
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

function withLegacyLayerAliases(layers) {
  return {
    ...layers,
    aadt: layers.roadCo2Pressure || EMPTY_FEATURE_COLLECTION,
    population: layers.modeShiftOpportunity || EMPTY_FEATURE_COLLECTION,
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
        overlayVersion: 'carbon-v1',
        sourceSummary: 'No live overlay connector is configured for this city yet.',
      },
      layers: withLegacyLayerAliases({
        roadCo2Pressure: EMPTY_FEATURE_COLLECTION,
        modeShiftOpportunity: EMPTY_FEATURE_COLLECTION,
      }),
    }
  }

  const workbookUrl = await getLatestAadtWorkbookUrl()
  const workbook = await loadAadtWorkbookMap(workbookUrl)
  const adotGeometry = await fetchPagedAdotTrafficSections(cityConfig.bbox)
  const censusFeatures = await fetchPopulationFeatures(cityConfig)
  const blockGroupIds = censusFeatures
    .map((feature) => String(feature?.attributes?.GEOID || '').trim())
    .filter(Boolean)
  let jobsMeta = null
  let jobsByGeoid = {}
  let modeShiftModel = 'population+gtfs-derived-service-gap'

  try {
    jobsMeta = await loadArizonaJobsByBlockGroup(blockGroupIds)
    jobsByGeoid = jobsMeta.byBlockGroup
    modeShiftModel = 'population+jobs+gtfs-derived-service-gap'
  } catch (error) {
    jobsMeta = { jobsWarning: error.message }
  }

  const roadCo2Pressure = buildAadtOverlay(adotGeometry, workbook.bySectionJoinId)
  const delayOverlay = await buildDelayEmissionsOverlay(roadCo2Pressure)
  const delayEmissionsHotspots = delayOverlay.layer
  const modeShiftOpportunity = buildModeShiftOpportunityLayer(
    buildPopulationOverlay(censusFeatures),
    cityId,
    { jobsByGeoid },
  )
  const sourceParts = [
    'Live ADOT traffic workbook',
    'ADOT traffic-section geometry',
    'Census 2020 block-group centroids',
  ]

  if (modeShiftModel === 'population+jobs+gtfs-derived-service-gap') {
    sourceParts.push('LEHD / LODES workplace jobs')
  }
  sourceParts.push('GTFS-derived fixed-guideway stop and route context')
  sourceParts.push('U.S. Census Bureau TIGERweb Transportation delay proxy')

  return {
    cityId,
    meta: {
      mode: 'live',
      fetchedAt: new Date().toISOString(),
      overlayVersion: 'carbon-v2',
      sourceSummary: `${sourceParts.join(' + ')}.`,
      aadtWorkbookUrl: workbookUrl,
      aadtSheetName: workbook.sheetName,
      aadtWorkbookRows: workbook.rowCount,
      aadtSectionFeatures: adotGeometry.length,
      tigerDelayCellsQueried: delayOverlay.meta.cellsQueried,
      tigerPrimaryTouches: delayOverlay.meta.tigerPrimaryTouches,
      tigerSecondaryTouches: delayOverlay.meta.tigerSecondaryTouches,
      tigerLocalTouches: delayOverlay.meta.tigerLocalTouches,
      censusBlockGroups: censusFeatures.length,
      lodesJobsUrl: jobsMeta?.jobsUrl || null,
      lodesJobsYear: jobsMeta?.jobsYear || null,
      lodesMatchedRows: jobsMeta?.matchedRows || 0,
      modeShiftModel,
      jobsWarning: jobsMeta?.jobsWarning || null,
      gtfsDerivedContext: true,
      delayProxyModel: 'adot-aadt-plus-tiger-road-network-complexity',
      legend: {
        roadCo2Pressure: { unit: 'vehicles / day' },
        modeShiftOpportunity: { unit: 'index 0-100' },
        delayEmissionsHotspots: { unit: 'index 0-100' },
      },
    },
    layers: withLegacyLayerAliases({
      roadCo2Pressure,
      modeShiftOpportunity,
      delayEmissionsHotspots,
    }),
  }
}

async function getOverlayPayload(cityId, forceRefresh = false) {
  const cached = cache.get(cityId)
  if (forceRefresh) {
    cache.delete(cityId)
  }
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const value = await buildCityOverlays(cityId)
  const roadCount = value?.layers?.roadCo2Pressure?.features?.length || value?.layers?.aadt?.features?.length || 0
  const modeShiftCount = value?.layers?.modeShiftOpportunity?.features?.length || value?.layers?.population?.features?.length || 0
  const delayCount = value?.layers?.delayEmissionsHotspots?.features?.length || 0
  if (roadCount > 0 || modeShiftCount > 0 || delayCount > 0) {
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
