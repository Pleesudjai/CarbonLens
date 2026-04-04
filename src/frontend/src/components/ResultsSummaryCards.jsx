const CORRIDOR_COLORS = ['text-emerald-400', 'text-blue-400', 'text-amber-400']

function MetricRow({ label, values, unit, format }) {
  const fmt = format || ((v) => v?.toLocaleString())
  return (
    <tr className="border-b border-gray-700/50">
      <td className="py-2 pr-4 text-xs text-gray-400">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`py-2 px-2 text-right text-xs font-medium ${CORRIDOR_COLORS[i]}`}>
          {fmt(v)}{unit ? ` ${unit}` : ''}
        </td>
      ))}
    </tr>
  )
}

export default function ResultsSummaryCards({ corridorResults, bestOverallId }) {
  if (!corridorResults?.length) return null

  const v = (field) => corridorResults.map((c) => c.totals[field])
  const score = (val) => val?.toFixed(1)

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Corridor Comparison</h3>
      <table className="mt-3 w-full">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="pb-2 text-left text-[10px] uppercase tracking-wider text-gray-500">Metric</th>
            {corridorResults.map((c, i) => (
              <th key={c.id} className={`pb-2 px-2 text-right text-[10px] uppercase tracking-wider ${CORRIDOR_COLORS[i]}`}>
                {c.name.length > 18 ? c.name.slice(0, 18) + '...' : c.name}
                {c.id === bestOverallId && <span className="ml-1 text-emerald-500">*</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <MetricRow label="Embodied Carbon" values={v('carbonKgCo2e')} unit="kg" />
          <MetricRow label="Carbon / LF" values={v('carbonKgCo2ePerLf')} unit="kg/lf" format={score} />
          <MetricRow label="Cost" values={v('costUsd')} unit="" format={(v) => `$${(v / 1e6).toFixed(2)}M`} />
          <MetricRow label="Duration" values={v('durationDays')} unit="days" format={score} />
          <MetricRow label="Disruption" values={v('disruptionScore')} format={score} />
          <MetricRow label="Maintenance Risk" values={v('maintenanceRiskScore')} format={score} />
          <MetricRow label="Buildability" values={v('buildabilityScore')} format={score} />
          <MetricRow label="Community Benefit" values={v('communityBenefitScore')} format={score} />
          <MetricRow label="Composite" values={v('compositeScore')} format={(v) => v?.toFixed(3)} />
        </tbody>
      </table>
    </div>
  )
}
