export default function CommunityImpactNote({ corridorResults, recommendation }) {
  if (!corridorResults?.length || !recommendation) return null

  const best = corridorResults.find((c) => c.id === recommendation.highestCommunityBenefitId)
  const overall = corridorResults.find((c) => c.id === recommendation.bestOverallId)
  if (!best) return null

  const score = best.totals.communityBenefitScore
  const overallScore = overall?.totals.communityBenefitScore

  const lines = []
  lines.push(
    `${best.name} scores highest in community benefit (${score.toFixed(1)}/10), reflecting stronger population reach, job access, and transit connectivity along its corridor.`,
  )

  if (best.id !== overall?.id && overallScore) {
    lines.push(
      `The best overall option (${overall.name}) scores ${overallScore.toFixed(1)}/10 on community benefit - ${overallScore < score ? 'a tradeoff' : 'comparable'} that planners and community stakeholders should weigh together.`,
    )
  }

  lines.push(
    'Community benefit scoring considers population catchment, job density, zero-car households, transfer connectivity, activity nodes, and heat exposure - all transparent and traceable to public datasets.',
  )

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Community Impact</h3>
      <div className="mt-2 space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="text-xs leading-relaxed text-gray-600">
            {line}
          </p>
        ))}
      </div>
      <p className="mt-3 text-[10px] italic text-gray-400">
        All factors are conceptual planning inputs derived from public datasets - not final design validation.
        Adjust corridor geometry and section choices to explore tradeoffs.
      </p>
    </div>
  )
}
