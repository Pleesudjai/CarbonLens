import { EXISTING_TRANSIT_LEGEND } from './existingTransit'

export default function ExistingTransitLegend({ city }) {
  const items = EXISTING_TRANSIT_LEGEND[city] || []
  if (!items.length) return null

  return (
    <div className="absolute right-4 top-28 z-10 max-h-[calc(100%-8rem)] w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Existing Transport</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">Current Valley Metro network</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-7 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-gray-900">{item.longName}</p>
              <span className="mt-1 inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-gray-700">
                {item.id}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full border-2 border-black bg-white" />
        <p className="text-[11px] text-gray-600">White circles show current stations and stops.</p>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-gray-600">
        Use the draw tool to plan proposed extensions against the existing network.
      </p>
    </div>
  )
}
