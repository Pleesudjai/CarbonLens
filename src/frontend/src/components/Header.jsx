import CitySelector from './CitySelector'

export default function Header({
  city,
  onCityChange,
  sidebarOpen,
  onToggleSidebar,
  onGenerateReport,
  reportOpen = false,
  reportDisabled = false,
}) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="CarbonLens" className="h-9 w-9" />
        <div>
          <h1 className="text-2xl font-bold text-emerald-600 tracking-tight">CarbonLens</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Transit Corridor Partner</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onGenerateReport}
          disabled={reportDisabled}
          className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
          title={reportDisabled ? 'Run analysis first to open the report view.' : reportOpen ? 'Return to the planning workspace.' : 'Open the in-app report format.'}
        >
          {reportOpen ? 'Back to Workspace' : 'Show Report'}
        </button>
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
