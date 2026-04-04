const BADGES = [
  { key: 'bestOverallId', label: 'Best Overall', color: 'bg-emerald-600' },
  { key: 'lowestCarbonId', label: 'Lowest Carbon', color: 'bg-teal-600' },
  { key: 'lowestCostId', label: 'Lowest Cost', color: 'bg-blue-600' },
  { key: 'fastestId', label: 'Fastest Build', color: 'bg-violet-600' },
  { key: 'lowestDisruptionId', label: 'Lowest Disruption', color: 'bg-amber-600' },
  { key: 'highestCommunityBenefitId', label: 'Community Benefit', color: 'bg-rose-600' },
]

export default function RecommendationPanel({ recommendation, corridorResults }) {
  if (!recommendation) return null
  const nameOf = (id) => corridorResults?.find((c) => c.id === id)?.name || id

  return (
    <div className="rounded-xl border border-emerald-700/50 bg-gray-800 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Recommendation</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-300">{recommendation.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {BADGES.map(({ key, label, color }) => (
          <span key={key} className={`inline-flex items-center gap-1.5 rounded-full ${color}/20 px-2.5 py-1 text-[11px] font-medium`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
            <span className="text-gray-400">{label}:</span>
            <span className="text-white">{nameOf(recommendation[key])}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
