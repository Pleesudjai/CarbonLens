export default function CommunityImpactNote({ corridorResults, recommendation }) {
  if (!corridorResults?.length || !recommendation) return null

  const best = corridorResults.find((c) => c.id === recommendation.highestCommunityBenefitId)
  const overall = corridorResults.find((c) => c.id === recommendation.bestOverallId)
  if (!best) return null

  const score = best.totals.communityBenefitScore
  const overallScore = overall?.totals.communityBenefitScore

  // Build community-facing narrative
  const lines = []
  lines.push(`${best.name} scores highest in community benefit (${score.toFixed(1)}/10), reflecting stronger population reach, job access, and transit connectivity along its corridor.`)

  if (best.id !== overall?.id && overallScore) {
    lines.push(`The best overall option (${overall.name}) scores ${overallScore.toFixed(1)}/10 on community benefit — ${overallScore < score ? 'a tradeoff' : 'comparable'} that planners and community stakeholders should weigh together.`)
  }

  lines.push('Community benefit scoring considers population catchment, job density, zero-car households, transfer connectivity, activity nodes, and heat exposure — all transparent and adjustable.')

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Community Impact</h3>
      <div className="mt-2 space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="text-xs leading-relaxed text-gray-300">{line}</p>
        ))}
      </div>
      <p className="mt-3 text-[10px] italic text-gray-500">
        All factors are conceptual planning inputs — not final design validation. Adjust values in the sidebar to explore tradeoffs.
      </p>
    </div>
  )
}
