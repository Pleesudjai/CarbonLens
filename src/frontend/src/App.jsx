import { useState, useCallback, useEffect } from 'react'
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
  const city = scenario.cityId
  const mapCorridors = scenario.corridors.map((c) => ({ id: c.id, geojson: customLines[c.id] || corridorGeojson(c.id, city) }))

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
  const handleRenameCorridor = (id, name) => updateScenario((cs) => cs.map((c) => (c.id === id ? { ...c, name } : c)))

  const handleAddCorridor = () => {
    const id = `alt-${++nextId}`
    updateScenario((cs) => [...cs, {
      id, name: `Alt ${cs.length + 1}`,
      segments: [{ id: `${id}-1`, label: 'New segment', segmentType: 'at_grade_median', sectionFamily: 'conventional_rc', lengthFt: 5000, context: 'suburban',
        factors: { trafficAadt: 20000, intersectionDensityPerMi: 6, utilityDensityHigh: false, trafficSensitivityHigh: false, constrainedRow: false, floodRisk: 'low', urbanCore: false, nightWorkOnly: false },
        community: { populationCatchment: 5, jobCatchment: 5, zeroCarHouseholdsPct: 5, transferConnectivity: 4, activityNodeImportance: 5, heatExposureHigh: false, stationTransferStrong: false } }],
    }])
    setActiveCorridorId(id)
  }

  const handleRemoveCorridor = (id) => {
    updateScenario((cs) => cs.filter((c) => c.id !== id))
    if (activeCorridorId === id) setActiveCorridorId(scenario.corridors.find((c) => c.id !== id)?.id || '')
  }

  const handleAddSegment = (corridorId) => {
    const segId = `seg-${++nextId}`
    updateScenario((cs) => cs.map((c) => c.id !== corridorId ? c : { ...c, segments: [...c.segments, {
      id: segId, label: 'New segment', segmentType: 'at_grade_median', sectionFamily: 'conventional_rc', lengthFt: 3000, context: 'suburban',
      factors: { trafficAadt: 20000, intersectionDensityPerMi: 6, utilityDensityHigh: false, trafficSensitivityHigh: false, constrainedRow: false, floodRisk: 'low', urbanCore: false, nightWorkOnly: false },
      community: { populationCatchment: 5, jobCatchment: 5, zeroCarHouseholdsPct: 5, transferConnectivity: 4, activityNodeImportance: 5, heatExposureHigh: false, stationTransferStrong: false },
    }] }))
  }

  const handleUpdateSegment = (corridorId, updated) =>
    updateScenario((cs) => cs.map((c) => c.id !== corridorId ? c : { ...c, segments: c.segments.map((s) => s.id === updated.id ? updated : s) }))
  const handleRemoveSegment = (corridorId, segId) =>
    updateScenario((cs) => cs.map((c) => c.id !== corridorId ? c : { ...c, segments: c.segments.filter((s) => s.id !== segId) }))

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

    setLoading(true); setError(null)
    try { setResults(await analyzeScenario(payload)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const activeCorridor = scenario.corridors.find((c) => c.id === activeCorridorId)
  const handleDrawComplete = (geojson) => {
    setCustomLines((prev) => ({ ...prev, [activeCorridorId]: geojson }))
    setDrawMode(false)
  }
  const cr = results?.corridorResults
  const rec = results?.recommendation

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-800">
      <Header city={city} onCityChange={handleCityChange} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className={results ? 'relative min-h-[320px]' : 'relative min-h-[500px] flex-1'}>
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
              <button onClick={() => setDrawMode((d) => !d)}
                className={`absolute top-4 left-4 z-10 rounded-lg px-3 py-2 text-xs font-medium shadow-md transition-colors ${
                  drawMode ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}>
                {drawMode ? `Drawing ${activeCorridor?.name || ''}... (dbl-click to finish)` : `Draw ${activeCorridor?.name || 'Corridor'}`}
              </button>
            )}
            {cr && <MapStatsOverlay corridorResults={cr} activeCorridorId={activeCorridorId} />}
          </div>
          {results && (
            <div className="space-y-5 bg-gray-50 p-5">
              <StakeholderLensToggle lens={lens} onLensChange={setLens} />
              <RecommendationPanel recommendation={rec} corridorResults={cr} lens={lens} />
              <ResultsSummaryCards corridorResults={cr} bestOverallId={rec?.bestOverallId} lens={lens} />
              <CorridorComparisonChart corridorResults={cr} />
              <SectionTradeoffCard corridorResults={cr} />
              <SegmentBreakdownTable corridorResults={cr} />
              <CommunityImpactNote corridorResults={cr} recommendation={rec} />
            </div>
          )}
        </div>

        {sidebarOpen && (
          <aside className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">
            <div className="flex-1 space-y-4 p-4">
              <input value={scenario.projectName} onChange={(e) => setScenario((s) => ({ ...s, projectName: e.target.value }))}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none" placeholder="Project name" />
              <CorridorPanel corridors={scenario.corridors} activeCorridorId={activeCorridorId} corridorResults={cr}
                onSelectCorridor={handleSelectCorridor} onRenameCorridor={handleRenameCorridor}
                onAddCorridor={handleAddCorridor} onRemoveCorridor={handleRemoveCorridor} onAddSegment={handleAddSegment} />
              {activeCorridor && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Segments — {activeCorridor.name}</h3>
                  {activeCorridor.segments.map((seg) => (
                    <SegmentEditor key={seg.id} segment={seg}
                      onUpdate={(s) => handleUpdateSegment(activeCorridorId, s)}
                      onRemove={() => handleRemoveSegment(activeCorridorId, seg.id)} />
                  ))}
                </div>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <AnalyzeActions onAnalyze={handleAnalyze} onReset={() => setResults(null)} loading={loading} hasResults={!!results} />
            </div>
          </aside>
        )}
      </div>

      <FloatingAnalyzeButton onAnalyze={handleAnalyze} loading={loading} visible={!sidebarOpen} />
    </div>
  )
}

export default App
