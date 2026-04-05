const CORRIDOR_COLORS = ['text-emerald-700', 'text-blue-700', 'text-amber-700']

const LENS_PRIMARY = {
  planner: ['totalCarbonKg', 'carbonKgCo2e', 'constructionPhaseCarbonKg', 'durationDays', 'communityBenefitScore'],
  contractor: ['costUsd', 'buildabilityScore', 'durationDays', 'maintenanceRiskScore', 'constructionCarbonPenaltyScore'],
  community: ['communityBenefitScore', 'disruptionScore', 'totalCarbonKg'],
}

function MetricRow({ label, values, unit, format, highlighted }) {
  const fmt = format || ((v) => v?.toLocaleString())
  return (
    <tr className={`border-b border-gray-100 ${highlighted ? 'bg-emerald-50/60' : ''}`}>
      <td className={`py-2 pr-4 text-xs ${highlighted ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
        {highlighted && <span className="mr-1 text-emerald-500">*</span>}{label}
      </td>
      {values.map((v, i) => (
        <td key={i} className={`py-2 px-2 text-right text-xs font-medium ${CORRIDOR_COLORS[i]}`}>
          {fmt(v)}{unit ? ` ${unit}` : ''}
        </td>
      ))}
    </tr>
  )
}

export default function ResultsSummaryCards({ corridorResults, bestOverallId, lens = 'planner' }) {
  if (!corridorResults?.length) return null

  const v = (field) => corridorResults.map((c) => c.totals[field])
  const score = (val) => val?.toFixed(1)
  const hi = (field) => (LENS_PRIMARY[lens] || []).includes(field)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Corridor Comparison</h3>
      <table className="mt-3 w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-2 text-left text-[10px] uppercase tracking-wider text-gray-400">Metric</th>
            {corridorResults.map((c, i) => (
              <th key={c.id} className={`pb-2 px-2 text-right text-[10px] uppercase tracking-wider ${CORRIDOR_COLORS[i]}`}>
                {c.name.length > 18 ? c.name.slice(0, 18) + '...' : c.name}
                {c.id === bestOverallId && <span className="ml-1 text-emerald-600">*</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <MetricRow label="Embodied Carbon" values={v('carbonKgCo2e')} unit="kg" highlighted={hi('carbonKgCo2e')} />
          <MetricRow label="Construction-Phase Carbon" values={v('constructionPhaseCarbonKg')} unit="kg" highlighted={hi('constructionPhaseCarbonKg')} />
          <MetricRow label="Total Carbon" values={v('totalCarbonKg')} unit="kg" highlighted={hi('totalCarbonKg')} />
          <MetricRow label="Carbon / LF" values={v('carbonKgCo2ePerLf')} unit="kg/lf" format={score} highlighted={hi('carbonKgCo2ePerLf')} />
          <MetricRow label="Cost" values={v('costUsd')} format={(v) => `$${(v / 1e6).toFixed(2)}M`} highlighted={hi('costUsd')} />
          <MetricRow label="Duration" values={v('durationDays')} unit="days" format={score} highlighted={hi('durationDays')} />
          <MetricRow label="Disruption" values={v('disruptionScore')} format={score} highlighted={hi('disruptionScore')} />
          <MetricRow label="Maintenance Risk" values={v('maintenanceRiskScore')} format={score} highlighted={hi('maintenanceRiskScore')} />
          <MetricRow label="Buildability" values={v('buildabilityScore')} format={score} highlighted={hi('buildabilityScore')} />
          <MetricRow label="Construction Carbon Penalty" values={v('constructionCarbonPenaltyScore')} format={score} highlighted={hi('constructionCarbonPenaltyScore')} />
          <MetricRow label="Community Benefit" values={v('communityBenefitScore')} format={score} highlighted={hi('communityBenefitScore')} />
          <MetricRow label="Composite" values={v('compositeScore')} format={(v) => v?.toFixed(3)} highlighted={false} />
        </tbody>
      </table>
    </div>
  )
}
