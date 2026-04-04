const BADGES = [
  { key: 'bestOverallId', label: 'Best Overall', color: 'bg-emerald-600' },
  { key: 'lowestCarbonId', label: 'Lowest Carbon', color: 'bg-teal-600' },
  { key: 'lowestCostId', label: 'Lowest Cost', color: 'bg-blue-600' },
  { key: 'fastestId', label: 'Fastest Build', color: 'bg-violet-600' },
  { key: 'lowestDisruptionId', label: 'Lowest Disruption', color: 'bg-amber-600' },
  { key: 'highestCommunityBenefitId', label: 'Community Benefit', color: 'bg-rose-600' },
]

const LENS_NOTES = {
  planner: 'Viewing as Planner — prioritizing carbon, schedule, and community reach.',
  contractor: 'Viewing as Contractor — prioritizing cost, buildability, and schedule.',
  community: 'Viewing as Community — prioritizing benefit, disruption, and equity.',
}

export default function RecommendationPanel({ recommendation, corridorResults, lens = 'planner' }) {
  if (!recommendation) return null
  const nameOf = (id) => corridorResults?.find((c) => c.id === id)?.name || id

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Recommendation</h3>
      <p className="mt-1 text-[11px] italic text-emerald-600">{LENS_NOTES[lens]}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{recommendation.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {BADGES.map(({ key, label, color }) => (
          <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium shadow-sm border border-gray-100">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
            <span className="text-gray-500">{label}:</span>
            <span className="text-gray-800">{nameOf(recommendation[key])}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
