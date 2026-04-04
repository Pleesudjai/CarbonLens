import { useState, useCallback } from 'react'
import CorridorMap from './components/CorridorMap'
import CitySelector from './components/CitySelector'
import CorridorPanel from './components/CorridorPanel'
import SegmentEditor from './components/SegmentEditor'
import AnalyzeActions from './components/AnalyzeActions'
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

  // --- City ---
  const handleCityChange = useCallback((cityId) => {
    setScenario(createDefaultScenario(cityId))
    setActiveCorridorId('alt-a')
    setResults(null)
  }, [])

  // --- Corridor CRUD ---
  const updateScenario = (fn) => setScenario((prev) => ({ ...prev, corridors: fn(prev.corridors) }))

  const handleSelectCorridor = (id) => setActiveCorridorId(id)

  const handleRenameCorridor = (id, name) =>
    updateScenario((cs) => cs.map((c) => (c.id === id ? { ...c, name } : c)))

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
    if (activeCorridorId === id) setActiveCorridorId((prev) => scenario.corridors.find((c) => c.id !== id)?.id || '')
  }

  // --- Segment CRUD ---
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

  // --- Analyze ---
  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await analyzeScenario(scenario)
      setResults(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const activeCorridor = scenario.corridors.find((c) => c.id === activeCorridorId)
  const mapCorridors = scenario.corridors.map((c) => ({ id: c.id, geojson: corridorGeojson(c.id, city) }))

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-700 px-5 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400">Innovation Hacks 2.0</p>
          <h1 className="text-xl font-bold">GreenRoute Transit</h1>
        </div>
        <CitySelector city={city} onCityChange={handleCityChange} />
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="relative flex-1">
          <CorridorMap city={city} corridors={mapCorridors} />
          {results && (
            <div className="absolute bottom-4 left-4 rounded-lg bg-gray-900/90 px-4 py-3 text-sm backdrop-blur">
              <p className="font-medium text-emerald-400">Recommendation</p>
              <p className="mt-1 max-w-sm text-xs text-gray-300">{results.recommendation?.summary}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex w-[380px] flex-col overflow-y-auto border-l border-gray-700 bg-gray-800">
          <div className="flex-1 space-y-4 p-4">
            {/* Project info */}
            <input value={scenario.projectName} onChange={(e) => setScenario((s) => ({ ...s, projectName: e.target.value }))}
              className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none" placeholder="Project name" />

            <CorridorPanel
              corridors={scenario.corridors} activeCorridorId={activeCorridorId}
              onSelectCorridor={handleSelectCorridor} onRenameCorridor={handleRenameCorridor}
              onAddCorridor={handleAddCorridor} onRemoveCorridor={handleRemoveCorridor}
              onAddSegment={handleAddSegment}
            />

            {/* Segment editors for active corridor */}
            {activeCorridor && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Segments — {activeCorridor.name}
                </h3>
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
            <AnalyzeActions onAnalyze={handleAnalyze} onReset={() => setResults(null)}
              loading={loading} hasResults={!!results} />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
