const BADGES = [
  { key: 'bestOverallId', label: 'Best Overall', color: 'bg-emerald-600' },
  { key: 'lowestCarbonId', label: 'Lowest Carbon', color: 'bg-teal-600' },
  { key: 'lowestCostId', label: 'Lowest Cost', color: 'bg-blue-600' },
  { key: 'fastestId', label: 'Fastest Build', color: 'bg-violet-600' },
  { key: 'lowestDisruptionId', label: 'Lowest Disruption', color: 'bg-amber-600' },
  { key: 'lowestConstructionPenaltyId', label: 'Lowest Build Carbon', color: 'bg-slate-700' },
  { key: 'highestCommunityBenefitId', label: 'Community Benefit', color: 'bg-rose-600' },
]

const LENS_NOTES = {
  planner: 'Viewing as Planner - prioritizing carbon, schedule, and community reach.',
  contractor: 'Viewing as Contractor - prioritizing cost, buildability, and schedule.',
  community: 'Viewing as Community - prioritizing benefit, disruption, and equity.',
}

function LiveContextRow({ liveContext }) {
  if (!liveContext?.floodRiskSource && !liveContext?.constructabilitySource) return null
  const sourceList = [liveContext?.floodRiskSource, liveContext?.constructabilitySource].filter(Boolean)

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {liveContext?.floodRiskSource && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-medium text-sky-700 shadow-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-600" />
          Live FEMA Flood
        </span>
      )}
      {liveContext?.constructabilitySource && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-medium text-violet-700 shadow-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-600" />
          Live TIGER Roads
        </span>
      )}
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow-sm">
        {liveContext.enrichedSegments || 0} segments enriched
      </span>
      {liveContext.fallbackSegments > 0 && (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-700 shadow-sm">
          {liveContext.fallbackSegments} fallback
        </span>
      )}
      {sourceList.length > 0 && <span className="text-[11px] text-emerald-700/80">Sources: {sourceList.join('; ')}</span>}
    </div>
  )
}

export default function RecommendationPanel({
  recommendation,
  corridorResults,
  lens = 'planner',
  liveContext = null,
}) {
  if (!recommendation) return null
  const nameOf = (id) => corridorResults?.find((c) => c.id === id)?.name || id

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Recommendation</h3>
      <p className="mt-1 text-[11px] italic text-emerald-600">{LENS_NOTES[lens]}</p>
      <LiveContextRow liveContext={liveContext} />
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{recommendation.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {BADGES.map(({ key, label, color }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-2.5 py-1 text-[11px] font-medium shadow-sm"
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
            <span className="text-gray-500">{label}:</span>
            <span className="text-gray-800">{nameOf(recommendation[key])}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
