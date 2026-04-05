import { EXISTING_TRANSIT_LEGEND } from './existingTransit'

export default function ExistingTransitLegend({ city }) {
  const items = EXISTING_TRANSIT_LEGEND[city] || []
  if (!items.length) return null

  return (
    <div className="absolute right-4 top-20 z-10 max-h-[calc(100%-6rem)] w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Existing Transport</p>
      <p className="mt-1 text-xs font-semibold text-gray-900">Current Valley Metro network</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-900">{item.longName}</p>
              <p className="text-[11px] text-gray-500">{item.id}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full border-2 border-black bg-white" />
        <p className="text-[10px] text-gray-500">White circles show current stations and stops.</p>
      </div>
      <p className="mt-2 text-[10px] text-gray-500">Use the draw tool to plan proposed extensions against the existing network.</p>
    </div>
  )
}
