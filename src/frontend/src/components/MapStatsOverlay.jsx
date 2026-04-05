export default function MapStatsOverlay({ corridorResults, activeCorridorId }) {
  if (!corridorResults?.length) return null
  const c = corridorResults.find((r) => r.id === activeCorridorId)
  if (!c) return null

  const t = c.totals
  const stats = [
    { label: 'Length', value: `${t.lengthFt.toLocaleString()} ft` },
    { label: 'Carbon', value: `${Math.round(t.carbonKgCo2e / 1000)} t CO2e` },
    { label: 'Cost', value: `$${(t.costUsd / 1e6).toFixed(2)}M` },
    { label: 'Buildability', value: `${t.buildabilityScore.toFixed(1)} / 10` },
    { label: 'Build Carbon', value: `${t.constructionCarbonPenaltyScore.toFixed(1)} / 10` },
  ]

  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">{c.name}</p>
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[10px] text-gray-400">{s.label}</p>
            <p className="text-xs font-medium text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
