const FEMA_FLOOD_LAYER_URL = 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query'
const FLOOD_CACHE_TTL_MS = 1000 * 60 * 60 * 6
const TIGER_TRANSPORTATION_SERVICE_URL = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation_LargeScale/MapServer'
const TIGER_CACHE_TTL_MS = 1000 * 60 * 60 * 6

const floodCache = new Map()
const tigerCache = new Map()

function toRadians(value) {
  return (value * Math.PI) / 180
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function haversineMeters([lng1, lat1], [lng2, lat2]) {
  const earthRadiusMeters = 6371008.8
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(a))
}

function buildCumulativeDistances(coordinates) {
  const cumulative = [0]
  for (let i = 1; i < coordinates.length; i += 1) {
    cumulative.push(cumulative[i - 1] + haversineMeters(coordinates[i - 1], coordinates[i]))
  }
  return cumulative
}

function interpolateCoordinate(start, end, fraction) {
  return [
    start[0] + (end[0] - start[0]) * fraction,
    start[1] + (end[1] - start[1]) * fraction,
  ]
}

function pointAtDistance(coordinates, cumulative, distanceMeters) {
  if (distanceMeters <= 0) return coordinates[0]
  const total = cumulative[cumulative.length - 1] || 0
  if (distanceMeters >= total) return coordinates[coordinates.length - 1]

  for (let i = 0; i < cumulative.length - 1; i += 1) {
    const startDistance = cumulative[i]
    const endDistance = cumulative[i + 1]
    if (distanceMeters >= startDistance && distanceMeters <= endDistance) {
      const segmentLength = Math.max(endDistance - startDistance, 1e-9)
      const fraction = (distanceMeters - startDistance) / segmentLength
      return interpolateCoordinate(coordinates[i], coordinates[i + 1], fraction)
    }
  }

  return coordinates[coordinates.length - 1]
}

function dedupeCoordinates(coordinates) {
  return coordinates.filter((coord, index) => {
    if (index === 0) return true
    const prev = coordinates[index - 1]
    return coord[0] !== prev[0] || coord[1] !== prev[1]
  })
}

function sliceLineCoordinates(coordinates, cumulative, startMeters, endMeters) {
  const total = cumulative[cumulative.length - 1] || 0
  if (coordinates.length < 2 || total <= 0) return null

  const clampedStart = Math.max(0, Math.min(startMeters, total))
  const clampedEnd = Math.max(clampedStart, Math.min(endMeters, total))
  const sliced = [pointAtDistance(coordinates, cumulative, clampedStart)]

  for (let i = 1; i < cumulative.length - 1; i += 1) {
    if (cumulative[i] > clampedStart && cumulative[i] < clampedEnd) {
      sliced.push(coordinates[i])
    }
  }

  sliced.push(pointAtDistance(coordinates, cumulative, clampedEnd))
  const deduped = dedupeCoordinates(sliced)
  return deduped.length >= 2 ? deduped : null
}

function buildSegmentLineGeometries(corridorGeometry, segments) {
  if (corridorGeometry?.type !== 'LineString' || !Array.isArray(corridorGeometry.coordinates)) {
    return segments.map(() => null)
  }

  const coordinates = corridorGeometry.coordinates
  if (coordinates.length < 2) return segments.map(() => null)

  const totalDeclaredLength = segments.reduce((sum, segment) => sum + (segment.lengthFt || 0), 0)
  if (totalDeclaredLength <= 0) return segments.map(() => null)

  const cumulative = buildCumulativeDistances(coordinates)
  const totalLineMeters = cumulative[cumulative.length - 1] || 0
  if (totalLineMeters <= 0) return segments.map(() => null)

  let runningLengthFt = 0
  return segments.map((segment) => {
    const startMeters = (runningLengthFt / totalDeclaredLength) * totalLineMeters
    runningLengthFt += segment.lengthFt || 0
    const endMeters = (runningLengthFt / totalDeclaredLength) * totalLineMeters
    const segmentCoordinates = sliceLineCoordinates(coordinates, cumulative, startMeters, endMeters)

    if (!segmentCoordinates) return null
    return {
      type: 'LineString',
      coordinates: segmentCoordinates,
    }
  })
}

function buildFemaCacheKey(lineGeometry) {
  return JSON.stringify(lineGeometry.coordinates)
}

function buildTigerCacheKey(lineGeometry) {
  return JSON.stringify(lineGeometry.coordinates)
}

async function queryFemaFloodFeatures(lineGeometry) {
  if (!lineGeometry?.coordinates?.length || lineGeometry.coordinates.length < 2) return []

  const cacheKey = buildFemaCacheKey(lineGeometry)
  const cached = floodCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const esriPolyline = JSON.stringify({
    paths: [lineGeometry.coordinates],
    spatialReference: { wkid: 4326 },
  })

  const params = new URLSearchParams({
    where: '1=1',
    geometry: esriPolyline,
    geometryType: 'esriGeometryPolyline',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'FLD_ZONE,ZONE_SUBTY,SFHA_TF,DEPTH,VELOCITY',
    returnGeometry: 'false',
    f: 'json',
  })

  const response = await fetch(`${FEMA_FLOOD_LAYER_URL}?${params}`)
  const json = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json?.error?.message || `FEMA NFHL query failed: ${response.status}`)
  }

  const value = (json.features || []).map((feature) => feature.attributes || {})
  floodCache.set(cacheKey, { value, expiresAt: Date.now() + FLOOD_CACHE_TTL_MS })
  return value
}

async function queryTigerLayerCount(layerId, lineGeometry) {
  const esriPolyline = JSON.stringify({
    paths: [lineGeometry.coordinates],
    spatialReference: { wkid: 4326 },
  })

  const params = new URLSearchParams({
    where: '1=1',
    geometry: esriPolyline,
    geometryType: 'esriGeometryPolyline',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    returnCountOnly: 'true',
    f: 'json',
  })

  const response = await fetch(`${TIGER_TRANSPORTATION_SERVICE_URL}/${layerId}/query?${params}`)
  const json = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json?.error?.message || `TIGER road query failed: ${response.status}`)
  }

  return Number(json.count || 0)
}

async function queryTigerRoadCounts(lineGeometry) {
  if (!lineGeometry?.coordinates?.length || lineGeometry.coordinates.length < 2) {
    return {
      primary: 0,
      secondary: 0,
      local: 0,
    }
  }

  const cacheKey = buildTigerCacheKey(lineGeometry)
  const cached = tigerCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const [primary, secondary, local] = await Promise.all([
    queryTigerLayerCount(0, lineGeometry),
    queryTigerLayerCount(1, lineGeometry),
    queryTigerLayerCount(2, lineGeometry),
  ])

  const value = { primary, secondary, local }
  tigerCache.set(cacheKey, { value, expiresAt: Date.now() + TIGER_CACHE_TTL_MS })
  return value
}

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeUpper(value) {
  return normalizeText(value).toUpperCase()
}

function classifyFloodRisk(attributes) {
  const zones = [...new Set(attributes.map((item) => normalizeUpper(item.FLD_ZONE)).filter(Boolean))]
  const subtypes = [...new Set(attributes.map((item) => normalizeText(item.ZONE_SUBTY)).filter(Boolean))]

  const hasFloodway = subtypes.some((subtype) => normalizeUpper(subtype).includes('FLOODWAY'))
  const hasSpecialFloodHazard = attributes.some((item) => normalizeUpper(item.SFHA_TF) === 'T')
  const hasOnePercentZone = zones.some((zone) => ['A', 'AE', 'AH', 'AO', 'AR', 'A99', 'V', 'VE'].includes(zone))
  const hasModerateZone = attributes.some((item) => {
    const zone = normalizeUpper(item.FLD_ZONE)
    const subtype = normalizeUpper(item.ZONE_SUBTY)
    return zone === 'D' || (zone === 'X' && subtype.includes('0.2'))
  })

  let risk = 'low'
  let summary = 'FEMA NFHL shows no mapped flood hazard intersecting this segment.'

  if (hasFloodway) {
    risk = 'high'
    summary = 'FEMA NFHL indicates floodway or equivalent special flood hazard along this segment.'
  } else if (hasSpecialFloodHazard || hasOnePercentZone) {
    risk = 'high'
    summary = 'FEMA NFHL indicates 1% annual chance flood hazard along this segment.'
  } else if (hasModerateZone) {
    risk = 'moderate'
    summary = 'FEMA NFHL indicates 0.2% annual chance or undetermined flood hazard along this segment.'
  } else if (attributes.length > 0) {
    summary = 'FEMA NFHL returned mapped flood context, but outside the primary hazard classes used in this score.'
  }

  return {
    risk,
    summary,
    featureCount: attributes.length,
    primaryZone: zones[0] || null,
    primarySubtype: subtypes[0] || null,
    zones,
    subtypes,
  }
}

function buildFloodFallback(segment, reason) {
  return {
    live: false,
    source: 'Scenario fallback',
    risk: segment?.factors?.floodRisk || 'low',
    summary: reason,
    featureCount: 0,
    primaryZone: null,
    primarySubtype: null,
    zones: [],
    subtypes: [],
  }
}

function classifyConstructabilityContext(segment, lineGeometry, roadCounts) {
  const totalMeters = buildCumulativeDistances(lineGeometry.coordinates).slice(-1)[0] || 0
  const miles = Math.max(totalMeters / 1609.344, 0.1)
  const primaryPerMi = roadCounts.primary / miles
  const secondaryPerMi = roadCounts.secondary / miles
  const localPerMi = roadCounts.local / miles
  const roadFeatureDensityPerMi = (roadCounts.primary + roadCounts.secondary + roadCounts.local) / miles
  const weightedRoadDensityPerMi = (roadCounts.primary * 1.6 + roadCounts.secondary * 1.1 + roadCounts.local * 0.6) / miles

  const currentTrafficAadt = segment?.factors?.trafficAadt || 0
  const currentSegmentType = segment?.segmentType || 'at_grade_median'
  const intersectionDensityPerMi = Math.max(1, Math.min(18, round(roadFeatureDensityPerMi, 1)))
  const urbanCore =
    weightedRoadDensityPerMi >= 12 ||
    roadFeatureDensityPerMi >= 16 ||
    (localPerMi >= 10 && (currentSegmentType === 'embedded_urban_street' || currentSegmentType === 'station_zone')) ||
    (localPerMi >= 11 && currentTrafficAadt >= 22000)
  const constrainedRow =
    weightedRoadDensityPerMi >= 12 ||
    roadFeatureDensityPerMi >= 16 ||
    (urbanCore && currentTrafficAadt >= 18000) ||
    ((currentSegmentType === 'embedded_urban_street' || currentSegmentType === 'station_zone') && urbanCore)
  const utilityDensityHigh =
    weightedRoadDensityPerMi >= 11 ||
    (urbanCore && roadFeatureDensityPerMi >= 10) ||
    (urbanCore && secondaryPerMi >= 2)
  const trafficSensitivityHigh =
    currentTrafficAadt >= 30000 ||
    (urbanCore && currentTrafficAadt >= 22000) ||
    roadFeatureDensityPerMi >= 14

  return {
    derivedFactors: {
      intersectionDensityPerMi,
      urbanCore,
      constrainedRow,
      utilityDensityHigh,
      trafficSensitivityHigh,
    },
    summary:
      weightedRoadDensityPerMi >= 14
        ? 'Dense urban road network suggests tighter staging and higher utility conflict risk.'
        : 'Road-network density suggests a lower constructability constraint profile.',
    source: 'U.S. Census Bureau TIGERweb Transportation',
    roadCounts,
    metrics: {
      miles: round(miles, 2),
      primaryPerMi: round(primaryPerMi, 1),
      secondaryPerMi: round(secondaryPerMi, 1),
      localPerMi: round(localPerMi, 1),
      roadFeatureDensityPerMi: round(roadFeatureDensityPerMi, 1),
      weightedRoadDensityPerMi: round(weightedRoadDensityPerMi, 1),
    },
  }
}

export async function enrichScenarioWithLiveContext(scenario) {
  const warnings = []
  let enrichedSegments = 0
  let fallbackSegments = 0

  const corridors = await Promise.all(
    (scenario.corridors || []).map(async (corridor) => {
      const segmentGeometries = buildSegmentLineGeometries(corridor.geometry, corridor.segments || [])

      const segments = await Promise.all(
        (corridor.segments || []).map(async (segment, index) => {
          const segmentGeometry = segmentGeometries[index]

          if (!segmentGeometry) {
            fallbackSegments += 1
            return {
              ...segment,
              liveContext: {
                ...(segment.liveContext || {}),
                flood: buildFloodFallback(segment, 'No corridor geometry was available for a live FEMA flood query.'),
                constructability: {
                  live: false,
                  source: 'Scenario fallback',
                  summary: 'No corridor geometry was available for a live road-network constructability query.',
                  roadCounts: { primary: 0, secondary: 0, local: 0 },
                  metrics: null,
                },
              },
            }
          }

          const [floodResult, roadResult] = await Promise.allSettled([
            queryFemaFloodFeatures(segmentGeometry),
            queryTigerRoadCounts(segmentGeometry),
          ])

          const nextFactors = {
            ...(segment.factors || {}),
          }
          const nextLiveContext = {
            ...(segment.liveContext || {}),
          }

          if (floodResult.status === 'fulfilled') {
            const flood = classifyFloodRisk(floodResult.value)
            nextFactors.floodRisk = flood.risk
            nextLiveContext.flood = {
              ...flood,
              live: true,
              source: 'FEMA NFHL Flood Hazard Zones',
            }
          } else {
            warnings.push(`${corridor.name} / ${segment.label} / FEMA: ${floodResult.reason?.message || floodResult.reason}`)
            nextLiveContext.flood = buildFloodFallback(
              segment,
              'Live FEMA flood query failed, so the scenario flood setting was retained.',
            )
          }

          if (roadResult.status === 'fulfilled') {
            const constructability = classifyConstructabilityContext(segment, segmentGeometry, roadResult.value)
            nextFactors.intersectionDensityPerMi = constructability.derivedFactors.intersectionDensityPerMi
            nextFactors.urbanCore = constructability.derivedFactors.urbanCore
            nextFactors.constrainedRow = constructability.derivedFactors.constrainedRow
            nextFactors.utilityDensityHigh = constructability.derivedFactors.utilityDensityHigh
            nextFactors.trafficSensitivityHigh = constructability.derivedFactors.trafficSensitivityHigh
            nextLiveContext.constructability = {
              ...constructability,
              live: true,
            }
          } else {
            warnings.push(`${corridor.name} / ${segment.label} / TIGER: ${roadResult.reason?.message || roadResult.reason}`)
            nextLiveContext.constructability = {
              live: false,
              source: 'Scenario fallback',
              summary: 'Live TIGER road-network enrichment failed, so constructability factors were retained from the scenario.',
              roadCounts: { primary: 0, secondary: 0, local: 0 },
              metrics: null,
            }
          }

          if (floodResult.status === 'fulfilled' || roadResult.status === 'fulfilled') {
            enrichedSegments += 1
          } else {
            fallbackSegments += 1
          }

          return {
            ...segment,
            factors: nextFactors,
            liveContext: nextLiveContext,
          }
        }),
      )

      return {
        ...corridor,
        segments,
      }
    }),
  )

  return {
    scenario: {
      ...scenario,
      corridors,
    },
    meta: {
      floodRiskSource: 'FEMA NFHL Flood Hazard Zones',
      constructabilitySource: 'U.S. Census Bureau TIGERweb Transportation',
      enrichedSegments,
      fallbackSegments,
      warnings,
    },
  }
}
