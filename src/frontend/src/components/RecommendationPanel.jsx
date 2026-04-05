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

function AiAdvisorRow({ aiAdvisor, aiLoading }) {
  if (!aiLoading && !aiAdvisor) return null

  return (
    <div className="mt-4 rounded-xl border border-emerald-200/80 bg-white/90 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          Claude advisor
        </span>
        {aiLoading && <span className="text-[11px] text-gray-500">Writing guidance from the deterministic results...</span>}
      </div>
      {aiAdvisor && (
        <div className="mt-2 space-y-2">
          {aiAdvisor.summary && <p className="text-xs leading-relaxed text-gray-700">{aiAdvisor.summary}</p>}
          {aiAdvisor.constructionInsight && (
            <p className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs leading-relaxed text-emerald-800">
              {aiAdvisor.constructionInsight}
            </p>
          )}
          {Array.isArray(aiAdvisor.risks) && aiAdvisor.risks.length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Watchouts:</span>{' '}
              {aiAdvisor.risks.slice(0, 3).join('; ')}
            </div>
          )}
          {Array.isArray(aiAdvisor.nextSteps) && aiAdvisor.nextSteps.length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Next steps:</span>{' '}
              {aiAdvisor.nextSteps.slice(0, 3).join('; ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RecommendationPanel({
  recommendation,
  corridorResults,
  lens = 'planner',
  liveContext = null,
  aiAdvisor = null,
  aiLoading = false,
}) {
  if (!recommendation) return null
  const nameOf = (id) => corridorResults?.find((c) => c.id === id)?.name || id
  const summaryText = aiAdvisor?.decision || aiAdvisor?.summary || recommendation.summary

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Recommendation</h3>
      <p className="mt-1 text-[11px] italic text-emerald-600">{LENS_NOTES[lens]}</p>
      <LiveContextRow liveContext={liveContext} />
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{summaryText}</p>
      <AiAdvisorRow aiAdvisor={aiAdvisor} aiLoading={aiLoading} />

      <div className="mt-4 flex flex-wrap gap-2">
        {(recommendation.badges || []).map(({ id, label, color }) => (
          <span
            key={`${label}-${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-2.5 py-1 text-[11px] font-medium shadow-sm"
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
            <span className="text-gray-500">{label}:</span>
            <span className="text-gray-800">{nameOf(id)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
