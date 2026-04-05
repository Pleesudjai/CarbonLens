import { useState, useCallback, useEffect, useRef } from 'react'
import Header from './components/Header'
import CorridorMap from './components/CorridorMap'
import CorridorPanel from './components/CorridorPanel'
import SegmentEditor from './components/SegmentEditor'
import AnalyzeActions from './components/AnalyzeActions'
import FloatingAnalyzeButton from './components/FloatingAnalyzeButton'
import MapStatsOverlay from './components/MapStatsOverlay'
import StakeholderLensToggle from './components/StakeholderLensToggle'
import RecommendationPanel from './components/RecommendationPanel'
import ResultsSummaryCards from './components/ResultsSummaryCards'
import CorridorComparisonChart from './components/CorridorComparisonChart'
import SegmentBreakdownTable from './components/SegmentBreakdownTable'
import SectionTradeoffCard from './components/SectionTradeoffCard'
import CommunityImpactNote from './components/CommunityImpactNote'
import { getEmptyBackgroundOverlayData, mergeBackgroundOverlayData } from './components/backgroundOverlayData'
import { createDefaultScenario, corridorGeojson, hasPresetGeometry } from './components/defaultScenario'
import { analyzeScenario, getBackgroundOverlays } from './api'

let nextId = 100
const MIN_MAP_PANEL_HEIGHT = 280
const MIN_RESULTS_PANEL_HEIGHT = 260

function clampMapPanelHeight(nextHeight, totalHeight) {
  const safeTotal = Math.max(totalHeight || 0, MIN_MAP_PANEL_HEIGHT + MIN_RESULTS_PANEL_HEIGHT)
  const maxHeight = Math.max(MIN_MAP_PANEL_HEIGHT, safeTotal - MIN_RESULTS_PANEL_HEIGHT)
  return Math.min(Math.max(nextHeight, MIN_MAP_PANEL_HEIGHT), maxHeight)
}

function App() {
  const [scenario, setScenario] = useState(() => createDefaultScenario('phoenix'))
  const [activeCorridorId, setActiveCorridorId] = useState('alt-a')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lens, setLens] = useState('planner')
  const [backgroundLayer, setBackgroundLayer] = useState('modeShiftOpportunity')
  const [backgroundData, setBackgroundData] = useState(() => getEmptyBackgroundOverlayData('phoenix'))
  const [backgroundLoading, setBackgroundLoading] = useState(false)
  const [backgroundError, setBackgroundError] = useState(null)
  const [drawMode, setDrawMode] = useState(false)
  const [customLines, setCustomLines] = useState({})
  const [mapPanelHeight, setMapPanelHeight] = useState(null)
  const leftPaneRef = useRef(null)
  const resizeStateRef = useRef({ active: false, startY: 0, startHeight: 0 })

  const city = scenario.cityId
  const mapCorridors = scenario.corridors.map((corridor) => ({
    id: corridor.id,
    geojson: customLines[corridor.id] || corridorGeojson(corridor.id, city),
  }))

  const handleCityChange = useCallback((cityId) => {
    setScenario(createDefaultScenario(cityId))
    setActiveCorridorId('alt-a')
    setResults(null)
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
        name: `Alt ${corridors.length + 1}`,
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
    if (activeCorridorId === id) {
      setActiveCorridorId(scenario.corridors.find((corridor) => corridor.id !== id)?.id || '')
    }
  }

  const handleAddSegment = (corridorId) => {
    const segId = `seg-${++nextId}`
    updateScenario((corridors) => corridors.map((corridor) => (
      corridor.id !== corridorId
        ? corridor
        : {
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
    )))
  }

  const handleUpdateSegment = (corridorId, updatedSegment) =>
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

  const handleRemoveSegment = (corridorId, segmentId) =>
    updateScenario((corridors) => corridors.map((corridor) => (
      corridor.id !== corridorId
        ? corridor
        : {
            ...corridor,
            segments: corridor.segments.filter((segment) => segment.id !== segmentId),
          }
    )))

  const handleAnalyze = async () => {
    const geometryByCorridorId = Object.fromEntries(
      mapCorridors.map((corridor) => [corridor.id, corridor.geojson?.features?.[0]?.geometry || null]),
    )
    const payload = {
      ...scenario,
      corridors: scenario.corridors.map((corridor) => ({
        ...corridor,
        geometry: geometryByCorridorId[corridor.id] || corridor.geometry || null,
      })),
    }

    setLoading(true)
    setError(null)
    try {
      setResults(await analyzeScenario(payload))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const activeCorridor = scenario.corridors.find((corridor) => corridor.id === activeCorridorId)
  const handleDrawComplete = (geojson) => {
    setCustomLines((prev) => ({ ...prev, [activeCorridorId]: geojson }))
    setDrawMode(false)
  }

  const corridorResults = results?.corridorResults
  const recommendation = results?.recommendation
  const hasResults = Boolean(results)

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

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-800">
      <Header
        city={city}
        onCityChange={handleCityChange}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div ref={leftPaneRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className={hasResults ? 'relative shrink-0' : 'relative min-h-[500px] flex-1'}
            style={hasResults && mapPanelHeight !== null ? { height: `${mapPanelHeight}px` } : undefined}
          >
            <CorridorMap
              city={city}
              corridors={mapCorridors}
              drawMode={drawMode}
              backgroundLayer={backgroundLayer}
              backgroundData={backgroundData}
              backgroundLoading={backgroundLoading}
              backgroundError={backgroundError}
              onBackgroundLayerChange={setBackgroundLayer}
              onDrawComplete={handleDrawComplete}
            />
            {!hasPresetGeometry(activeCorridorId, city) && (
              <button
                onClick={() => setDrawMode((enabled) => !enabled)}
                className={`absolute top-4 left-4 z-10 rounded-lg px-3 py-2 text-xs font-medium shadow-md transition-colors ${
                  drawMode
                    ? 'bg-emerald-600 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {drawMode
                  ? `Drawing ${activeCorridor?.name || ''}... (dbl-click to finish)`
                  : `Draw ${activeCorridor?.name || 'Corridor'}`}
              </button>
            )}
            {corridorResults && (
              <MapStatsOverlay corridorResults={corridorResults} activeCorridorId={activeCorridorId} />
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
                  <StakeholderLensToggle lens={lens} onLensChange={setLens} />
                  <RecommendationPanel
                    recommendation={recommendation}
                    corridorResults={corridorResults}
                    lens={lens}
                    liveContext={results?.meta?.liveContext}
                  />
                  <ResultsSummaryCards
                    corridorResults={corridorResults}
                    bestOverallId={recommendation?.bestOverallId}
                    lens={lens}
                  />
                  <CorridorComparisonChart corridorResults={corridorResults} />
                  <SectionTradeoffCard corridorResults={corridorResults} />
                  <SegmentBreakdownTable corridorResults={corridorResults} />
                  <CommunityImpactNote corridorResults={corridorResults} recommendation={recommendation} />
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
                  {activeCorridor.segments.map((segment) => (
                    <SegmentEditor
                      key={segment.id}
                      segment={segment}
                      onUpdate={(updatedSegment) => handleUpdateSegment(activeCorridorId, updatedSegment)}
                      onRemove={() => handleRemoveSegment(activeCorridorId, segment.id)}
                    />
                  ))}
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
              />
            </div>
          </aside>
        )}
      </div>

      <FloatingAnalyzeButton onAnalyze={handleAnalyze} loading={loading} visible={!sidebarOpen} />
    </div>
  )
}

export default App
