import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import Header from './components/Header'
import CorridorPanel from './components/CorridorPanel'
import AnalyzeActions from './components/AnalyzeActions'
import FloatingAnalyzeButton from './components/FloatingAnalyzeButton'
import { getEmptyBackgroundOverlayData, mergeBackgroundOverlayData } from './components/backgroundOverlayData'
import { createDefaultScenario, corridorGeojson, hasPresetGeometry } from './components/defaultScenario'
import { analyzeScenario, getAiCorridorAdvisor, getBackgroundOverlays } from './api'
import { buildLensRecommendation } from './recommendationUtils'

const CorridorMap = lazy(() => import('./components/CorridorMap'))
const SegmentEditor = lazy(() => import('./components/SegmentEditor'))
const MapStatsOverlay = lazy(() => import('./components/MapStatsOverlay'))
const StakeholderLensToggle = lazy(() => import('./components/StakeholderLensToggle'))
const RecommendationPanel = lazy(() => import('./components/RecommendationPanel'))
const ResultsSummaryCards = lazy(() => import('./components/ResultsSummaryCards'))
const CorridorComparisonChart = lazy(() => import('./components/CorridorComparisonChart'))
const SegmentBreakdownTable = lazy(() => import('./components/SegmentBreakdownTable'))
const SectionTradeoffCard = lazy(() => import('./components/SectionTradeoffCard'))

let nextId = 100
const MIN_MAP_PANEL_HEIGHT = 280
const MIN_RESULTS_PANEL_HEIGHT = 260
const FEET_PER_METER = 3.280839895

function toRadians(value) {
  return (value * Math.PI) / 180
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

function measureFeatureCollectionFeet(featureCollection) {
  const geometry = featureCollection?.features?.[0]?.geometry
  if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
    return null
  }

  let totalMeters = 0
  for (let i = 1; i < geometry.coordinates.length; i += 1) {
    totalMeters += haversineMeters(geometry.coordinates[i - 1], geometry.coordinates[i])
  }
  const feet = Math.round(totalMeters * FEET_PER_METER)
  return feet > 0 ? feet : null
}

function getLineGeometryFromFeatureCollection(featureCollection) {
  const geometry = featureCollection?.features?.[0]?.geometry
  if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
    return null
  }
  return geometry
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

function buildSegmentMidpoints(corridorGeometry, segments) {
  if (corridorGeometry?.type !== 'LineString' || !Array.isArray(corridorGeometry.coordinates) || corridorGeometry.coordinates.length < 2) {
    return []
  }

  const totalDeclaredLength = segments.reduce((sum, segment) => sum + (segment.lengthFt || 0), 0)
  if (totalDeclaredLength <= 0) return []

  const coordinates = corridorGeometry.coordinates
  const cumulative = buildCumulativeDistances(coordinates)
  const totalLineMeters = cumulative[cumulative.length - 1] || 0
  if (totalLineMeters <= 0) return []

  let runningLengthFt = 0
  return segments.map((segment) => {
    const midpointFt = runningLengthFt + ((segment.lengthFt || 0) / 2)
    const midpointMeters = (midpointFt / totalDeclaredLength) * totalLineMeters
    runningLengthFt += segment.lengthFt || 0
    return {
      segmentId: segment.id,
      coordinates: pointAtDistance(coordinates, cumulative, midpointMeters),
    }
  })
}

function findNearestPointFeature(coordinates, featureCollection) {
  const features = featureCollection?.features || []
  if (!Array.isArray(coordinates) || coordinates.length !== 2 || features.length === 0) return null

  let nearestFeature = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const feature of features) {
    const point = feature?.geometry?.coordinates
    if (!Array.isArray(point) || point.length !== 2) continue
    const distance = haversineMeters(coordinates, point)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestFeature = feature
    }
  }

  return nearestFeature
}

function toScore(value) {
  const normalized = Math.max(0, Math.min(1, Number(value) || 0))
  return Math.max(1, Math.min(10, Math.round(1 + (normalized * 9))))
}

function buildSegmentPreviewMap(corridor, featureCollection, backgroundData) {
  const corridorGeometry = getLineGeometryFromFeatureCollection(featureCollection) || corridor.geometry || null
  if (!corridorGeometry) return new Map()

  const midpointEntries = buildSegmentMidpoints(corridorGeometry, corridor.segments || [])
  if (!midpointEntries.length) return new Map()

  const roadCo2Pressure = backgroundData?.layers?.roadCo2Pressure || backgroundData?.layers?.aadt
  const modeShiftOpportunity = backgroundData?.layers?.modeShiftOpportunity || backgroundData?.layers?.population
  const previewMap = new Map()

  midpointEntries.forEach(({ segmentId, coordinates }) => {
    const preview = {
      factors: {},
      community: {},
      previewContext: {},
    }

    const nearestRoad = findNearestPointFeature(coordinates, roadCo2Pressure)
    const roadAadt = Number(nearestRoad?.properties?.aadt)
    if (Number.isFinite(roadAadt) && roadAadt > 0) {
      preview.factors.trafficAadt = Math.round(roadAadt)
      preview.previewContext.trafficAadt = {
        source: 'Live ADOT traffic workbook + ADOT section geometry',
      }
    }

    const nearestCommunity = findNearestPointFeature(coordinates, modeShiftOpportunity)
    const props = nearestCommunity?.properties || {}
    const populationNorm = Number(props.populationNorm)
    const jobsNorm = Number(props.jobsNorm)
    const serviceStrengthNorm = Number(props.serviceStrengthNorm)
    const routeDiversityNorm = Number(props.routeDiversityNorm)
    const zeroCarHouseholdsPct = Number(props.zeroCarHouseholdsPct)
    const transferNodeCount = Number(props.transferNodeCount) || 0
    const uniqueRoutesWithinOneMile = Number(props.uniqueRoutesWithinOneMile) || 0

    if (Number.isFinite(populationNorm)) {
      preview.community.populationCatchment = toScore(populationNorm)
      preview.previewContext.populationCatchment = {
        source: 'Live Census block-group population context',
      }
    }

    if (Number.isFinite(jobsNorm) && jobsNorm > 0) {
      preview.community.jobCatchment = toScore(jobsNorm)
      preview.previewContext.jobCatchment = {
        source: 'Live LEHD / LODES workplace jobs context',
      }
    }

    if (Number.isFinite(zeroCarHouseholdsPct) && zeroCarHouseholdsPct >= 0) {
      preview.community.zeroCarHouseholdsPct = Math.round(zeroCarHouseholdsPct)
      preview.previewContext.zeroCarHouseholdsPct = {
        source: 'Live Census ACS zero-vehicle household share',
      }
    }

    if (Number.isFinite(serviceStrengthNorm)) {
      preview.community.transferConnectivity = toScore(serviceStrengthNorm)
      preview.previewContext.transferConnectivity = {
        source: 'Live GTFS-derived stop and route connectivity context',
      }
    }

    const activityNorm = Number.isFinite(jobsNorm)
      ? ((jobsNorm * 0.65) + ((Number.isFinite(routeDiversityNorm) ? routeDiversityNorm : 0) * 0.35))
      : (((Number.isFinite(serviceStrengthNorm) ? serviceStrengthNorm : 0) * 0.6) + ((Number.isFinite(routeDiversityNorm) ? routeDiversityNorm : 0) * 0.4))
    if (Number.isFinite(activityNorm) && activityNorm > 0) {
      preview.community.activityNodeImportance = toScore(activityNorm)
      preview.previewContext.activityNodeImportance = {
        source: 'Live jobs plus GTFS route-diversity context',
      }
    }

    preview.community.stationTransferStrong = transferNodeCount > 0 || uniqueRoutesWithinOneMile >= 2
    preview.previewContext.stationTransferStrong = {
      source: 'Live GTFS-derived transfer-node context',
    }

    if (Object.keys(preview.factors).length > 0 || Object.keys(preview.community).length > 0) {
      previewMap.set(segmentId, preview)
    }
  })

  return previewMap
}

function applySegmentPreview(segment, preview) {
  if (!preview) return segment
  return {
    ...segment,
    factors: {
      ...(segment.factors || {}),
      ...(preview.factors || {}),
    },
    community: {
      ...(segment.community || {}),
      ...(preview.community || {}),
    },
    previewContext: {
      ...(segment.previewContext || {}),
      ...(preview.previewContext || {}),
    },
  }
}

function distributeSegmentLengths(segments, totalLengthFt) {
  if (!Array.isArray(segments) || segments.length === 0 || !Number.isFinite(totalLengthFt) || totalLengthFt <= 0) {
    return segments
  }

  if (segments.length === 1) {
    return [{ ...segments[0], lengthFt: totalLengthFt }]
  }

  const existingTotal = segments.reduce((sum, segment) => sum + Math.max(0, Number(segment.lengthFt) || 0), 0)
  const weights = existingTotal > 0
    ? segments.map((segment) => (Math.max(0, Number(segment.lengthFt) || 0) / existingTotal))
    : segments.map(() => 1 / segments.length)

  const rawLengths = weights.map((weight) => weight * totalLengthFt)
  const floorLengths = rawLengths.map((value) => Math.max(1, Math.floor(value)))
  let assignedTotal = floorLengths.reduce((sum, value) => sum + value, 0)

  if (assignedTotal < totalLengthFt) {
    const fractionalOrder = rawLengths
      .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
      .sort((a, b) => b.fraction - a.fraction)

    let cursor = 0
    while (assignedTotal < totalLengthFt) {
      const target = fractionalOrder[cursor % fractionalOrder.length]?.index ?? 0
      floorLengths[target] += 1
      assignedTotal += 1
      cursor += 1
    }
  } else if (assignedTotal > totalLengthFt) {
    const removableOrder = floorLengths
      .map((value, index) => ({ index, value }))
      .sort((a, b) => b.value - a.value)

    let cursor = 0
    while (assignedTotal > totalLengthFt && removableOrder.length > 0) {
      const target = removableOrder[cursor % removableOrder.length]?.index ?? 0
      if (floorLengths[target] > 1) {
        floorLengths[target] -= 1
        assignedTotal -= 1
      }
      cursor += 1
      if (cursor > 5000) break
    }
  }

  return segments.map((segment, index) => ({
    ...segment,
    lengthFt: floorLengths[index],
  }))
}

function rebalanceCorridorSegments(corridor, featureCollection) {
  const measuredLengthFt = measureFeatureCollectionFeet(featureCollection)
  if (!measuredLengthFt) return corridor
  return {
    ...corridor,
    geometry: featureCollection?.features?.[0]?.geometry || corridor.geometry || null,
    segments: distributeSegmentLengths(corridor.segments, measuredLengthFt),
  }
}

function clampMapPanelHeight(nextHeight, totalHeight) {
  const safeTotal = Math.max(totalHeight || 0, MIN_MAP_PANEL_HEIGHT + MIN_RESULTS_PANEL_HEIGHT)
  const maxHeight = Math.max(MIN_MAP_PANEL_HEIGHT, safeTotal - MIN_RESULTS_PANEL_HEIGHT)
  return Math.min(Math.max(nextHeight, MIN_MAP_PANEL_HEIGHT), maxHeight)
}

function PanelFallback({ message, minHeight = 120 }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 px-4 py-6 text-sm text-gray-500 shadow-sm"
      style={{ minHeight }}
    >
      {message}
    </div>
  )
}

function featureCollectionFromGeometry(geometry, corridorId) {
  if (!geometry || geometry.type !== 'LineString' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
    return null
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry,
        properties: corridorId ? { id: corridorId } : {},
      },
    ],
  }
}

function getCorridorFeatureCollection(corridor, cityId, customLines) {
  if (!corridor) return null
  return (
    customLines[corridor.id]
    || featureCollectionFromGeometry(corridor.geometry, corridor.id)
    || corridorGeojson(corridor.id, cityId)
  )
}

function App() {
  const [scenario, setScenario] = useState(() => createDefaultScenario('phoenix'))
  const [activeCorridorId, setActiveCorridorId] = useState('')
  const [results, setResults] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [lastAnalyzedScenario, setLastAnalyzedScenario] = useState(null)
  const [aiAdvisorByLens, setAiAdvisorByLens] = useState({})
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lens, setLens] = useState('planner')
  const [backgroundLayers, setBackgroundLayers] = useState(['modeShiftOpportunity'])
  const [backgroundData, setBackgroundData] = useState(() => getEmptyBackgroundOverlayData('phoenix'))
  const [backgroundLoading, setBackgroundLoading] = useState(false)
  const [backgroundError, setBackgroundError] = useState(null)
  const [drawMode, setDrawMode] = useState(false)
  const [showDrawHint, setShowDrawHint] = useState(false)
  const [customLines, setCustomLines] = useState({})
  const [mapPanelHeight, setMapPanelHeight] = useState(null)
  const leftPaneRef = useRef(null)
  const resizeStateRef = useRef({ active: false, startY: 0, startHeight: 0 })
  const analyzeRequestRef = useRef(0)
  const aiRequestRef = useRef(0)

  const city = scenario.cityId
  const mapCorridors = scenario.corridors.map((corridor) => ({
    id: corridor.id,
    geojson: getCorridorFeatureCollection(corridor, city, customLines),
  }))

  const activeCorridor = scenario.corridors.find((corridor) => corridor.id === activeCorridorId)
  const activeCorridorFeatureCollection = activeCorridor
    ? getCorridorFeatureCollection(activeCorridor, city, customLines)
    : null
  const drawReferenceGeojson = drawMode && activeCorridorFeatureCollection?.features?.length
    ? activeCorridorFeatureCollection
    : null
  const activeCorridorPreviewMap = activeCorridor
    ? buildSegmentPreviewMap(activeCorridor, activeCorridorFeatureCollection, backgroundData)
    : new Map()

  const handleCityChange = useCallback((cityId) => {
    setScenario(createDefaultScenario(cityId))
    setActiveCorridorId('')
    setCustomLines({})
    setResults(null)
    setReportOpen(false)
    setLastAnalyzedScenario(null)
    setAiAdvisorByLens({})
  }, [])

  useEffect(() => {
    let cancelled = false
    const emptyState = getEmptyBackgroundOverlayData(city)
    setBackgroundData(emptyState)
    setBackgroundLoading(true)
    setBackgroundError(null)

    getBackgroundOverlays(city)
      .then((data) => {
        if (!cancelled) setBackgroundData(mergeBackgroundOverlayData(data, emptyState))
      })
      .catch((err) => {
        if (!cancelled) {
          setBackgroundError(err.message)
          setBackgroundData(getEmptyBackgroundOverlayData(city, 'Live public overlay data is unavailable right now.'))
        }
      })
      .finally(() => {
        if (!cancelled) setBackgroundLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [city])

  const updateScenario = (fn) => setScenario((prev) => ({ ...prev, corridors: fn(prev.corridors) }))
  const handleSelectCorridor = (id) => setActiveCorridorId(id)
  const handleRenameCorridor = (id, name) =>
    updateScenario((corridors) => corridors.map((corridor) => (
      corridor.id === id ? { ...corridor, name } : corridor
    )))

  const handleAddCorridor = () => {
    const id = `alt-${++nextId}`
    updateScenario((corridors) => [
      ...corridors,
      {
        id,
        name: `Alt ${String.fromCharCode(65 + corridors.length)}`,
        segments: [
          {
            id: `${id}-1`,
            label: 'New segment',
            segmentType: 'at_grade_median',
            sectionFamily: 'conventional_rc',
            lengthFt: 5000,
            context: 'suburban',
            factors: {
              trafficAadt: 20000,
              intersectionDensityPerMi: 6,
              utilityDensityHigh: false,
              trafficSensitivityHigh: false,
              constrainedRow: false,
              floodRisk: 'low',
              urbanCore: false,
              nightWorkOnly: false,
            },
            community: {
              populationCatchment: 5,
              jobCatchment: 5,
              zeroCarHouseholdsPct: 5,
              transferConnectivity: 4,
              activityNodeImportance: 5,
              heatExposureHigh: false,
              stationTransferStrong: false,
            },
          },
        ],
      },
    ])
    setActiveCorridorId(id)
  }

  const handleRemoveCorridor = (id) => {
    updateScenario((corridors) => corridors.filter((corridor) => corridor.id !== id))
    setCustomLines((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setResults(null)
    setReportOpen(false)
    if (activeCorridorId === id) {
      setActiveCorridorId(scenario.corridors.find((corridor) => corridor.id !== id)?.id || '')
    }
  }

  const handleAddSegment = (corridorId) => {
    const segId = `seg-${++nextId}`
    const customLine = customLines[corridorId]
    updateScenario((corridors) => corridors.map((corridor) => (
      corridor.id !== corridorId
        ? corridor
        : (() => {
            const nextCorridor = {
            ...corridor,
            segments: [
              ...corridor.segments,
              {
                id: segId,
                label: 'New segment',
                segmentType: 'at_grade_median',
                sectionFamily: 'conventional_rc',
                lengthFt: 3000,
                context: 'suburban',
                factors: {
                  trafficAadt: 20000,
                  intersectionDensityPerMi: 6,
                  utilityDensityHigh: false,
                  trafficSensitivityHigh: false,
                  constrainedRow: false,
                  floodRisk: 'low',
                  urbanCore: false,
                  nightWorkOnly: false,
                },
                community: {
                  populationCatchment: 5,
                  jobCatchment: 5,
                  zeroCarHouseholdsPct: 5,
                  transferConnectivity: 4,
                  activityNodeImportance: 5,
                  heatExposureHigh: false,
                  stationTransferStrong: false,
                },
              },
            ],
            }
            return customLine ? rebalanceCorridorSegments(nextCorridor, customLine) : nextCorridor
          })()
    )))
    setResults(null)
    setReportOpen(false)
    setLastAnalyzedScenario(null)
    setAiAdvisorByLens({})
  }

  const handleUpdateSegment = (corridorId, updatedSegment) => {
    updateScenario((corridors) => corridors.map((corridor) => (
      corridor.id !== corridorId
        ? corridor
        : {
            ...corridor,
            segments: corridor.segments.map((segment) => (
              segment.id === updatedSegment.id ? updatedSegment : segment
            )),
          }
    )))
    setResults(null)
    setReportOpen(false)
    setLastAnalyzedScenario(null)
    setAiAdvisorByLens({})
    setError(null)
  }

  const handleRemoveSegment = (corridorId, segmentId) => {
    updateScenario((corridors) => corridors.map((corridor) => {
      const customLine = customLines[corridorId]
      return (
      corridor.id !== corridorId
        ? corridor
        : (() => {
            const nextCorridor = {
            ...corridor,
            segments: corridor.segments.filter((segment) => segment.id !== segmentId),
            }
            return customLine ? rebalanceCorridorSegments(nextCorridor, customLine) : nextCorridor
          })()
      )
    }))
    setResults(null)
    setReportOpen(false)
    setLastAnalyzedScenario(null)
    setAiAdvisorByLens({})
    setError(null)
  }

  const handleAnalyze = async () => {
    const requestId = analyzeRequestRef.current + 1
    analyzeRequestRef.current = requestId
    const geometryByCorridorId = Object.fromEntries(
      mapCorridors.map((corridor) => [corridor.id, corridor.geojson?.features?.[0]?.geometry || null]),
    )
    const payload = {
      ...scenario,
      corridors: scenario.corridors.map((corridor) => {
        const featureCollection = getCorridorFeatureCollection(corridor, city, customLines)
        const nextCorridor = customLines[corridor.id] ? rebalanceCorridorSegments(corridor, customLines[corridor.id]) : corridor
        const previewMap = buildSegmentPreviewMap(nextCorridor, featureCollection, backgroundData)
        return {
          ...nextCorridor,
          segments: nextCorridor.segments.map((segment) => applySegmentPreview(segment, previewMap.get(segment.id))),
          geometry: geometryByCorridorId[corridor.id] || nextCorridor.geometry || null,
        }
      }),
    }

    setLoading(true)
    setAiLoading(false)
    setError(null)
    try {
      const analysisResult = await analyzeScenario(payload)
      if (analyzeRequestRef.current !== requestId) return
      setResults(analysisResult)
      setReportOpen(false)
      setLastAnalyzedScenario(payload)
      setAiAdvisorByLens({})
      setAiLoading(false)
    } catch (e) {
      if (analyzeRequestRef.current !== requestId) return
      setError(e.message)
      setAiLoading(false)
    } finally {
      if (analyzeRequestRef.current !== requestId) return
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!results?.corridorResults?.length || !lastAnalyzedScenario) return undefined
    if (aiAdvisorByLens[lens]) return undefined

    const requestId = aiRequestRef.current + 1
    aiRequestRef.current = requestId
    setAiLoading(true)

    getAiCorridorAdvisor({ scenario: lastAnalyzedScenario, analysis: results, lens })
      .then((aiResult) => {
        if (aiRequestRef.current !== requestId) return
        if (!aiResult?.available || !aiResult?.advisor) return
        setAiAdvisorByLens((current) => ({
          ...current,
          [lens]: aiResult.advisor,
        }))
      })
      .catch(() => {
        if (aiRequestRef.current !== requestId) return
      })
      .finally(() => {
        if (aiRequestRef.current !== requestId) return
        setAiLoading(false)
      })

    return undefined
  }, [results, lastAnalyzedScenario, lens, aiAdvisorByLens])

  const canAnalyze = scenario.corridors.length > 0
  const handleDrawComplete = (geojson) => {
    setCustomLines((prev) => ({ ...prev, [activeCorridorId]: geojson }))
    updateScenario((corridors) => corridors.map((corridor) => (
      corridor.id !== activeCorridorId ? corridor : rebalanceCorridorSegments(corridor, geojson)
    )))
    setResults(null)
    setReportOpen(false)
    setError(null)
    setDrawMode(false)
  }

  const corridorResults = results?.corridorResults
  const recommendation = corridorResults?.length ? buildLensRecommendation(corridorResults, lens) : results?.recommendation
  const hasResults = Boolean(results)
  const activeCorridorResult = corridorResults?.find((corridor) => corridor.id === activeCorridorId) || null

  useEffect(() => {
    if (!hasResults) {
      setMapPanelHeight(null)
      return
    }

    const container = leftPaneRef.current
    if (!container) return undefined

    const applyHeight = () => {
      const totalHeight = container.clientHeight
      if (totalHeight <= 0) return
      setMapPanelHeight((current) => {
        if (current !== null) return clampMapPanelHeight(current, totalHeight)
        return clampMapPanelHeight(Math.round(totalHeight * 0.5), totalHeight)
      })
    }

    applyHeight()

    const resizeObserver = new ResizeObserver(() => {
      applyHeight()
    })
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [hasResults])

  useEffect(() => {
    if (!hasResults) return undefined

    const onPointerMove = (event) => {
      const container = leftPaneRef.current
      const resizeState = resizeStateRef.current
      if (!container || !resizeState.active) return

      const deltaY = event.clientY - resizeState.startY
      const totalHeight = container.clientHeight
      setMapPanelHeight(clampMapPanelHeight(resizeState.startHeight + deltaY, totalHeight))
    }

    const onPointerUp = () => {
      resizeStateRef.current.active = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [hasResults])

  useEffect(() => {
    if (!showDrawHint) return undefined

    const timeoutId = window.setTimeout(() => {
      setShowDrawHint(false)
    }, 3200)

    return () => window.clearTimeout(timeoutId)
  }, [showDrawHint])

  const handleStartResize = useCallback((event) => {
    const container = leftPaneRef.current
    if (!container || !hasResults) return

    resizeStateRef.current = {
      active: true,
      startY: event.clientY,
      startHeight: mapPanelHeight ?? Math.round(container.clientHeight * 0.5),
    }
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [hasResults, mapPanelHeight])

  const handleGenerateReport = useCallback(() => {
    if (!results) return
    setReportOpen((open) => !open)
  }, [results])

  const handleToggleDrawMode = useCallback(() => {
    setDrawMode((enabled) => {
      const next = !enabled
      setShowDrawHint(next)
      return next
    })
  }, [])

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-800">
      <Header
        city={city}
        onCityChange={handleCityChange}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        onGenerateReport={handleGenerateReport}
        reportOpen={reportOpen}
        reportDisabled={!hasResults}
      />

      {reportOpen && hasResults ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-100 px-6 py-6">
          <div className="mx-auto max-w-6xl space-y-5">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Report Format</p>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {scenario.projectName?.trim() || 'Transit Corridor Report'}
                  </h2>
                  <p className="max-w-3xl text-sm leading-6 text-gray-600">
                    Clean review layout for corridor alternatives, tradeoffs, and recommendation summary.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-900">City:</span> {city === 'phoenix' ? 'Phoenix, AZ' : city}</p>
                  <p><span className="font-medium text-gray-900">View As:</span> {lens.charAt(0).toUpperCase() + lens.slice(1)}</p>
                  <p><span className="font-medium text-gray-900">Options:</span> {corridorResults?.length || 0}</p>
                </div>
              </div>
            </div>

            <Suspense fallback={<PanelFallback message="Loading report..." />}>
              <RecommendationPanel
                recommendation={recommendation}
                corridorResults={corridorResults}
                lens={lens}
                liveContext={results?.meta?.liveContext}
                aiAdvisor={aiAdvisorByLens[lens] || null}
                aiLoading={aiLoading}
              />
              <ResultsSummaryCards
                corridorResults={corridorResults}
                bestOverallId={recommendation?.bestOverallId}
                lens={lens}
              />
              <CorridorComparisonChart corridorResults={corridorResults} />
              <SegmentBreakdownTable corridorResults={corridorResults} />
              <SectionTradeoffCard corridorResults={corridorResults} />
            </Suspense>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-1 overflow-hidden">
            <div ref={leftPaneRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                className={hasResults ? 'relative shrink-0' : 'relative min-h-[500px] flex-1'}
                style={hasResults && mapPanelHeight !== null ? { height: `${mapPanelHeight}px` } : undefined}
              >
                <Suspense fallback={<PanelFallback message="Loading map workspace..." minHeight={400} />}>
                  <CorridorMap
                    city={city}
                    corridors={mapCorridors}
                    drawMode={drawMode}
                    drawReferenceGeojson={drawReferenceGeojson}
                    backgroundLayers={backgroundLayers}
                    backgroundData={backgroundData}
                    backgroundLoading={backgroundLoading}
                    backgroundError={backgroundError}
                    onBackgroundLayerChange={setBackgroundLayers}
                    onDrawComplete={handleDrawComplete}
                  />
                </Suspense>
                {activeCorridor && !hasPresetGeometry(activeCorridorId, city) && (
                  <div className="absolute top-4 left-4 z-10 max-w-[240px] space-y-2">
                    <button
                      onClick={handleToggleDrawMode}
                      className={`rounded-lg px-3 py-2 text-xs font-medium shadow-md transition-colors ${
                        drawMode
                          ? 'bg-emerald-600 text-white'
                          : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {drawMode
                        ? `Drawing ${activeCorridor?.name || ''}`
                        : `Draw ${activeCorridor?.name || 'Corridor'}`}
                    </button>
                    {showDrawHint && (
                      <div className="rounded-lg border border-emerald-100 bg-white/95 px-3 py-2 text-[11px] leading-relaxed text-gray-600 shadow-sm backdrop-blur-sm">
                        Click to keep adding points. Double-click to finish the route.
                      </div>
                    )}
                  </div>
                )}
                {corridorResults && (
                  <Suspense fallback={null}>
                    <MapStatsOverlay corridorResults={corridorResults} activeCorridorId={activeCorridorId} />
                  </Suspense>
                )}
              </div>

              {hasResults && (
                <>
                  <div
                    role="separator"
                    aria-orientation="horizontal"
                    aria-label="Resize map and report panels"
                    onPointerDown={handleStartResize}
                    className="group relative z-10 h-4 shrink-0 cursor-row-resize bg-gray-50"
                  >
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200" />
                    <div className="absolute left-1/2 top-1/2 flex h-7 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-colors group-hover:text-gray-600">
                      <span className="h-1 w-1 rounded-full bg-current" />
                      <span className="h-1 w-1 rounded-full bg-current" />
                      <span className="h-1 w-1 rounded-full bg-current" />
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
                    <div className="space-y-5">
                      <Suspense fallback={<PanelFallback message="Loading results..." />}>
                        <StakeholderLensToggle lens={lens} onLensChange={setLens} />
                        <RecommendationPanel
                          recommendation={recommendation}
                          corridorResults={corridorResults}
                          lens={lens}
                          liveContext={results?.meta?.liveContext}
                          aiAdvisor={aiAdvisorByLens[lens] || null}
                          aiLoading={aiLoading}
                        />
                        <ResultsSummaryCards
                          corridorResults={corridorResults}
                          bestOverallId={recommendation?.bestOverallId}
                          lens={lens}
                        />
                        <CorridorComparisonChart corridorResults={corridorResults} />
                        <SegmentBreakdownTable corridorResults={corridorResults} />
                        <SectionTradeoffCard corridorResults={corridorResults} />
                      </Suspense>
                    </div>
                  </div>
                </>
              )}
            </div>

            {sidebarOpen && (
              <aside className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">
                <div className="flex-1 space-y-4 p-4">
                  <input
                    value={scenario.projectName}
                    onChange={(event) => setScenario((prev) => ({ ...prev, projectName: event.target.value }))}
                    className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
                    placeholder="Project name"
                  />
                  <CorridorPanel
                    corridors={scenario.corridors}
                    activeCorridorId={activeCorridorId}
                    corridorResults={corridorResults}
                    onSelectCorridor={handleSelectCorridor}
                    onRenameCorridor={handleRenameCorridor}
                    onAddCorridor={handleAddCorridor}
                    onRemoveCorridor={handleRemoveCorridor}
                    onAddSegment={handleAddSegment}
                  />
                  {activeCorridor && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Segments - {activeCorridor.name}
                      </h3>
                      <Suspense fallback={<PanelFallback message="Loading segment editor..." />}>
                        {activeCorridor.segments.map((segment) => (
                          <SegmentEditor
                            key={segment.id}
                            segment={segment}
                            previewSegment={applySegmentPreview(segment, activeCorridorPreviewMap.get(segment.id))}
                            resultSegment={activeCorridorResult?.segmentResults?.find((resultSegment) => resultSegment.id === segment.id) || null}
                            onUpdate={(updatedSegment) => handleUpdateSegment(activeCorridorId, updatedSegment)}
                            onRemove={() => handleRemoveSegment(activeCorridorId, segment.id)}
                          />
                        ))}
                      </Suspense>
                    </div>
                  )}
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <AnalyzeActions
                    onAnalyze={handleAnalyze}
                    onReset={() => setResults(null)}
                    loading={loading}
                    hasResults={Boolean(results)}
                    disabled={!canAnalyze}
                  />
                </div>
              </aside>
            )}
          </div>

          <FloatingAnalyzeButton onAnalyze={handleAnalyze} loading={loading} visible={!sidebarOpen} disabled={!canAnalyze} />
        </>
      )}
    </div>
  )
}

export default App
