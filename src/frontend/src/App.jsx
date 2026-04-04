import { useState, useCallback } from 'react'
import CorridorMap from './components/CorridorMap'
import CitySelector from './components/CitySelector'
import CorridorPanel from './components/CorridorPanel'
import SegmentEditor from './components/SegmentEditor'
import AnalyzeActions from './components/AnalyzeActions'
import RecommendationPanel from './components/RecommendationPanel'
import ResultsSummaryCards from './components/ResultsSummaryCards'
import CorridorComparisonChart from './components/CorridorComparisonChart'
import SegmentBreakdownTable from './components/SegmentBreakdownTable'
import SectionTradeoffCard from './components/SectionTradeoffCard'
import CommunityImpactNote from './components/CommunityImpactNote'
import { createDefaultScenario, corridorGeojson } from './components/defaultScenario'
import { analyzeScenario } from './api'

let nextId = 100

function App() {
  const [scenario, setScenario] = useState(() => createDefaultScenario('phoenix'))
  const [activeCorridorId, setActiveCorridorId] = useState('alt-a')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const city = scenario.cityId
  const handleCityChange = useCallback((cityId) => {
    setScenario(createDefaultScenario(cityId))
    setActiveCorridorId('alt-a')
    setResults(null)
  }, [])

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
    setLoading(true); setError(null)
    try { setResults(await analyzeScenario(scenario)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const activeCorridor = scenario.corridors.find((c) => c.id === activeCorridorId)
  const mapCorridors = scenario.corridors.map((c) => ({ id: c.id, geojson: corridorGeojson(c.id, city) }))
  const cr = results?.corridorResults
  const rec = results?.recommendation

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white">
      <header className="flex items-center justify-between border-b border-gray-700 px-5 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400">Innovation Hacks 2.0</p>
          <h1 className="text-xl font-bold">GreenRoute Transit</h1>
        </div>
        <CitySelector city={city} onCityChange={handleCityChange} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Map + Results */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="relative" style={{ minHeight: results ? 320 : 500 }}>
            <CorridorMap city={city} corridors={mapCorridors} />
          </div>
          {results && (
            <div className="space-y-5 p-5">
              <RecommendationPanel recommendation={rec} corridorResults={cr} />
              <ResultsSummaryCards corridorResults={cr} bestOverallId={rec?.bestOverallId} />
              <CorridorComparisonChart corridorResults={cr} />
              <SectionTradeoffCard corridorResults={cr} />
              <SegmentBreakdownTable corridorResults={cr} />
              <CommunityImpactNote corridorResults={cr} recommendation={rec} />
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-l border-gray-700 bg-gray-800">
          <div className="flex-1 space-y-4 p-4">
            <input value={scenario.projectName} onChange={(e) => setScenario((s) => ({ ...s, projectName: e.target.value }))}
              className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none" placeholder="Project name" />
            <CorridorPanel corridors={scenario.corridors} activeCorridorId={activeCorridorId}
              onSelectCorridor={handleSelectCorridor} onRenameCorridor={handleRenameCorridor}
              onAddCorridor={handleAddCorridor} onRemoveCorridor={handleRemoveCorridor} onAddSegment={handleAddSegment} />
            {activeCorridor && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Segments — {activeCorridor.name}</h3>
                {activeCorridor.segments.map((seg) => (
                  <SegmentEditor key={seg.id} segment={seg}
                    onUpdate={(s) => handleUpdateSegment(activeCorridorId, s)}
                    onRemove={() => handleRemoveSegment(activeCorridorId, seg.id)} />
                ))}
              </div>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <div className="border-t border-gray-700 p-4">
            <AnalyzeActions onAnalyze={handleAnalyze} onReset={() => setResults(null)} loading={loading} hasResults={!!results} />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
