import CitySelector from './CitySelector'

export default function Header({ city, onCityChange, sidebarOpen, onToggleSidebar }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-emerald-600">CarbonLens</p>
        <h1 className="text-xl font-bold text-gray-900">Transit Corridor Planner</h1>
      </div>
      <div className="flex items-center gap-3">
        <CitySelector city={city} onCityChange={onCityChange} />
        <button onClick={onToggleSidebar}
          className="rounded border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
          title={sidebarOpen ? 'Hide panel' : 'Show panel'}>
          {sidebarOpen ? 'Panel \u25B6' : '\u25C0 Panel'}
        </button>
      </div>
    </header>
  )
}
