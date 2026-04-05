function getSourcePills(sourceSummary = '') {
  const pills = []
  const text = sourceSummary.toLowerCase()

  if (text.includes('adot')) pills.push('Live ADOT')
  if (text.includes('census')) pills.push('Live Census')
  if (text.includes('lodes') || text.includes('lehd')) pills.push('Live LEHD')
  if (text.includes('fema')) pills.push('Live FEMA')
  if (text.includes('tiger')) pills.push('Live TIGER')
  if (text.includes('live gtfs')) pills.push('Live GTFS')
  else if (text.includes('gtfs')) pills.push('GTFS Context')

  return pills
}

export default function LiveDataBadge({ loading = false, error = null, sourceSummary = '' }) {
  const pills = getSourcePills(sourceSummary)

  if (loading) {
    return (
      <div className="absolute left-4 top-20 z-10 w-72 rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">Live Data</p>
        <p className="mt-1 text-[11px] text-amber-800">Refreshing public sources...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="absolute left-4 top-20 z-10 w-72 rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Data Mode</p>
        <p className="mt-1 text-[11px] text-gray-700">Live data unavailable</p>
      </div>
    )
  }

  if (!pills.length) return null

  return (
    <div className="absolute left-4 top-20 z-10 w-72 rounded-xl border border-emerald-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Data Mode</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pills.map((pill) => (
          <span
            key={pill}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700"
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  )
}
