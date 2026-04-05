const CORRIDOR_COLORS = ['text-emerald-700', 'text-blue-700', 'text-amber-700']

const LENS_PRIMARY = {
  planner: ['totalCarbonKg', 'totalCarbonKgPerMi', 'costUsd', 'costUsdPerMi', 'durationDays', 'communityBenefitScore', 'disruptionScore'],
  contractor: ['costUsd', 'costUsdPerMi', 'buildabilityScore', 'durationDays', 'maintenanceRiskScore', 'constructionCarbonPenaltyScore'],
  community: ['communityBenefitScore', 'disruptionScore', 'totalCarbonKg', 'totalCarbonKgPerMi'],
}

const METRIC_DEFINITIONS = [
  { field: 'totalCarbonKg', label: 'Total Carbon', unit: 't', format: 'tonnes' },
  { field: 'totalCarbonKgPerMi', label: 'Total Carbon / mile', unit: 't/mi', format: 'tonnes' },
  { field: 'costUsd', label: 'Cost', format: 'cost' },
  { field: 'costUsdPerMi', label: 'Cost / mile', format: 'costPerMi' },
  { field: 'durationDays', label: 'Duration', unit: 'days', format: 'score' },
  { field: 'communityBenefitScore', label: 'Community Benefit', format: 'score' },
  { field: 'disruptionScore', label: 'Disruption', format: 'score' },
  { field: 'carbonKgCo2e', label: 'Material Carbon', unit: 't', format: 'tonnes' },
  { field: 'carbonKgCo2ePerMi', label: 'Material Carbon / mile', unit: 't/mi', format: 'tonnes' },
  { field: 'constructionPhaseCarbonKg', label: 'During-Build Carbon', unit: 't', format: 'tonnes' },
  { field: 'constructionPhaseCarbonKgPerMi', label: 'During-Build Carbon / mile', unit: 't/mi', format: 'tonnes' },
  { field: 'carbonKgCo2ePerLf', label: 'Material Carbon / LF', unit: 'kg/lf', format: 'score' },
  { field: 'buildabilityScore', label: 'Buildability', format: 'score' },
  { field: 'constructionCarbonPenaltyScore', label: 'Build Penalty Score', format: 'score' },
  { field: 'maintenanceRiskScore', label: 'Maintenance Risk', format: 'score' },
  { field: 'compositeScore', label: 'Composite', format: 'composite' },
]

const METRIC_EXPLANATIONS = {
  costUsd: {
    summary: 'Concept-level project cost estimated from route length, section type, and corridor constraints.',
    howToRead: 'Lower is better for budget. Use this for total project spending, not bid-level pricing.',
  },
  costUsdPerMi: {
    summary: 'Same corridor cost normalized by route length.',
    howToRead: 'Use this to compare options with different lengths on a fair per-mile basis. Lower is better.',
  },
  durationDays: {
    summary: 'Estimated construction duration based on section productivity, route length, and corridor context.',
    howToRead: 'Lower is faster to deliver and usually means less disruption exposure.',
  },
  buildabilityScore: {
    summary: '1 to 10 score for how easy the corridor is to construct in the field.',
    howToRead: 'Higher is easier to build. It reflects staging, geometry, utilities, and corridor complexity.',
  },
  constructionCarbonPenaltyScore: {
    summary: '1 to 10 penalty score for construction difficulty and carbon-heavy context.',
    howToRead: 'Lower is better. It combines structure demand with flood, ROW, utility, and urban constraints.',
  },
  maintenanceRiskScore: {
    summary: '1 to 10 score for long-term upkeep risk after the corridor is built.',
    howToRead: 'Lower is better. Higher values suggest more future maintenance burden or durability concern.',
  },
  disruptionScore: {
    summary: '1 to 10 score for traffic, access, and construction disruption along the corridor.',
    howToRead: 'Lower is better. Higher values mean more disturbance to traffic flow and nearby activity.',
  },
  totalCarbonKg: {
    summary: 'Total project carbon: material carbon plus during-build carbon.',
    howToRead: 'This is the best single carbon number for the full corridor. Lower is better.',
  },
  totalCarbonKgPerMi: {
    summary: 'Total corridor carbon normalized by route length.',
    howToRead: 'Use this to compare different-length options fairly. Lower means the design is more carbon-efficient per mile.',
  },
  carbonKgCo2e: {
    summary: 'Material carbon from permanent construction materials such as concrete, steel, and fiber.',
    howToRead: 'This mostly grows with route length and section thickness. Lower is better.',
  },
  carbonKgCo2ePerMi: {
    summary: 'Material carbon normalized by route length.',
    howToRead: 'Best for comparing section efficiency across corridors of different length. Lower is better.',
  },
  constructionPhaseCarbonKg: {
    summary: 'Carbon created while building the project, mainly from traffic delay, detours, and construction equipment.',
    howToRead: 'This often rises on busier roads or longer work durations. Lower is better.',
  },
  constructionPhaseCarbonKgPerMi: {
    summary: 'During-build carbon normalized by route length.',
    howToRead: 'Use this to compare how construction impacts scale per mile, especially on different traffic corridors.',
  },
  carbonKgCo2ePerLf: {
    summary: 'Engineering-detail view of material carbon per linear foot of corridor.',
    howToRead: 'Useful for section design comparisons and cross-section studies. Lower is better.',
  },
  communityBenefitScore: {
    summary: '1 to 10 score for how strongly the corridor serves people, jobs, activity, and transit access.',
    howToRead: 'Higher is better. It is a benefit score, not a carbon score.',
  },
  compositeScore: {
    summary: 'Combined ranking score for the current stakeholder view.',
    howToRead: 'Lower is better in the current model because it reflects a stronger overall balance across the selected metrics.',
  },
}

const LENS_ROW_ORDER = {
  planner: [
    'totalCarbonKg',
    'totalCarbonKgPerMi',
    'costUsd',
    'costUsdPerMi',
    'durationDays',
    'communityBenefitScore',
    'disruptionScore',
    'carbonKgCo2e',
    'carbonKgCo2ePerMi',
    'constructionPhaseCarbonKg',
    'constructionPhaseCarbonKgPerMi',
    'carbonKgCo2ePerLf',
    'buildabilityScore',
    'constructionCarbonPenaltyScore',
    'maintenanceRiskScore',
    'compositeScore',
  ],
  contractor: [
    'costUsd',
    'costUsdPerMi',
    'durationDays',
    'buildabilityScore',
    'constructionCarbonPenaltyScore',
    'maintenanceRiskScore',
    'disruptionScore',
    'totalCarbonKg',
    'totalCarbonKgPerMi',
    'carbonKgCo2e',
    'carbonKgCo2ePerMi',
    'constructionPhaseCarbonKg',
    'constructionPhaseCarbonKgPerMi',
    'carbonKgCo2ePerLf',
    'communityBenefitScore',
    'compositeScore',
  ],
  community: [
    'communityBenefitScore',
    'disruptionScore',
    'totalCarbonKg',
    'totalCarbonKgPerMi',
    'costUsd',
    'costUsdPerMi',
    'durationDays',
    'carbonKgCo2e',
    'constructionPhaseCarbonKg',
    'carbonKgCo2ePerMi',
    'constructionPhaseCarbonKgPerMi',
    'buildabilityScore',
    'constructionCarbonPenaltyScore',
    'maintenanceRiskScore',
    'carbonKgCo2ePerLf',
    'compositeScore',
  ],
}

const FEET_PER_MILE = 5280

function deriveTotalField(totals, field) {
  if (totals?.[field] !== undefined && totals?.[field] !== null) {
    return totals[field]
  }

  const lengthFt = Number(totals?.lengthFt) || 0
  const lengthMi = lengthFt > 0 ? lengthFt / FEET_PER_MILE : 0

  switch (field) {
    case 'carbonKgCo2ePerLf':
      return lengthFt > 0 ? (Number(totals?.carbonKgCo2e) || 0) / lengthFt : 0
    case 'carbonKgCo2ePerMi':
      return lengthMi > 0 ? (Number(totals?.carbonKgCo2e) || 0) / lengthMi : 0
    case 'constructionPhaseCarbonKgPerLf':
      return lengthFt > 0 ? (Number(totals?.constructionPhaseCarbonKg) || 0) / lengthFt : 0
    case 'constructionPhaseCarbonKgPerMi':
      return lengthMi > 0 ? (Number(totals?.constructionPhaseCarbonKg) || 0) / lengthMi : 0
    case 'totalCarbonKgPerLf':
      return lengthFt > 0 ? (Number(totals?.totalCarbonKg) || 0) / lengthFt : 0
    case 'totalCarbonKgPerMi':
      return lengthMi > 0 ? (Number(totals?.totalCarbonKg) || 0) / lengthMi : 0
    case 'costUsdPerMi':
      return lengthMi > 0 ? (Number(totals?.costUsd) || 0) / lengthMi : 0
    case 'lengthMi':
      return lengthMi
    default:
      return totals?.[field]
  }
}

function formatTonnesFromKg(valueKg) {
  if (!Number.isFinite(valueKg)) return '--'
  const tonnes = valueKg / 1000
  return tonnes.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function MetricLabel({ field, label, highlighted }) {
  const explanation = METRIC_EXPLANATIONS[field]

  if (!explanation) {
    return (
      <>
        {highlighted && <span className="mr-1 text-emerald-500">*</span>}
        {label}
      </>
    )
  }

  const tooltipText = `${explanation.summary} ${explanation.howToRead}`

  return (
    <div className="group relative inline-flex items-center gap-1">
      {highlighted && <span className="text-emerald-500">*</span>}
      <button
        type="button"
        aria-label={`${label}: ${tooltipText}`}
        className={`inline-flex items-center gap-1 text-left ${highlighted ? 'font-semibold text-gray-800' : 'text-gray-500'} cursor-help`}
      >
        <span className="border-b border-dotted border-gray-300">{label}</span>
      </button>
      <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-3 text-left opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">{label}</div>
        <p className="mt-1 text-xs leading-5 text-gray-700">{explanation.summary}</p>
        <p className="mt-2 text-xs leading-5 text-gray-500">
          <span className="font-semibold text-gray-700">How to read:</span> {explanation.howToRead}
        </p>
      </div>
    </div>
  )
}

function MetricRow({ field, label, values, unit, format, highlighted }) {
  const fmt = format || ((v) => v?.toLocaleString())
  return (
    <tr className={`border-b border-gray-100 ${highlighted ? 'bg-emerald-50/60' : ''}`}>
      <td className="py-2 pr-4 text-xs align-top">
        <MetricLabel field={field} label={label} highlighted={highlighted} />
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

  const v = (field) => corridorResults.map((c) => deriveTotalField(c.totals, field))
  const score = (val) => val?.toFixed(1)
  const hi = (field) => (LENS_PRIMARY[lens] || []).includes(field)
  const formatters = {
    tonnes: formatTonnesFromKg,
    cost: (value) => `$${(value / 1e6).toFixed(2)}M`,
    costPerMi: (value) => `$${(value / 1e6).toFixed(2)}M/mi`,
    score,
    composite: (value) => value?.toFixed(3),
  }
  const orderedFields = LENS_ROW_ORDER[lens] || LENS_ROW_ORDER.planner
  const orderedMetrics = orderedFields
    .map((field) => METRIC_DEFINITIONS.find((metric) => metric.field === field))
    .filter(Boolean)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Corridor Comparison</h3>
      <p className="mt-1 text-xs text-gray-500">Hover a metric name for a plain-language explanation.</p>
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
          {orderedMetrics.map((metric) => (
            <MetricRow
              key={metric.field}
              field={metric.field}
              label={metric.label}
              values={v(metric.field)}
              unit={metric.unit}
              format={formatters[metric.format]}
              highlighted={hi(metric.field)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
