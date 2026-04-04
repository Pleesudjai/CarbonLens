import { useState } from 'react'
import CorridorMap from './components/CorridorMap'
import { CITY_PRESETS } from './components/mapUtils'

function App() {
  const [city, setCity] = useState('phoenix')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              Innovation Hacks 2.0
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              GreenRoute Transit
            </h1>
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white"
          >
            {Object.entries(CITY_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>{preset.name}</option>
            ))}
          </select>
        </div>
        <p className="mt-1 max-w-3xl text-xs text-gray-400">
          Compare lower-carbon, more buildable rail corridors for planners, agencies, and communities.
        </p>
      </header>

      <main className="grid h-[calc(100vh-88px)] grid-cols-1 lg:grid-cols-[1fr_380px]">
        <div className="relative">
          <CorridorMap city={city} />
        </div>
        <aside className="overflow-y-auto border-l border-gray-700 bg-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white">Corridor Panel</h2>
          <p className="mt-2 text-sm text-gray-400">
            Draw or select corridors on the map. Segment analysis and comparison will appear here.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App
