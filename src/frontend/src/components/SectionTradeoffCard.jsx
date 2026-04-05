const SECTION_INFO = {
  conventional_rc: { label: 'Conventional RC', thickness: '14 in', rebar: 'High (240 lb/cy)', fiber: 'None', production: '35 lf/day' },
  fiber_reduced: { label: 'Steel-Fiber (Thinner)', thickness: '12 in', rebar: 'Low (40 lb/cy)', fiber: '60 lb/cy', production: '55 lf/day' },
  low_cement_rc: { label: 'Low-Cement SCM', thickness: '14 in', rebar: 'High (240 lb/cy)', fiber: 'None', production: '32 lf/day' },
}

const DRIVER_LABELS = {
  elevated_structure: 'elevated structure demand',
  bridge_structure: 'bridge approach structure',
  embedded_urban_construction: 'embedded urban track construction',
  flood_mitigation: 'flood and drainage mitigation',
  constrained_row: 'constrained right-of-way',
  utility_relocation: 'utility relocation complexity',
  urban_core_staging: 'urban-core staging limits',
  night_work_window: 'night-only work windows',
}

function summarizePenaltyDrivers(corridor) {
  const weightedDrivers = new Map()
  corridor.segmentResults.forEach((segment) => {
    const drivers = segment.metrics.constructionCarbonPenalty?.drivers || []
    drivers.forEach((driver) => {
      weightedDrivers.set(driver, (weightedDrivers.get(driver) || 0) + segment.lengthFt)
    })
  })

  return [...weightedDrivers.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([driver]) => DRIVER_LABELS[driver] || driver)
}

function Insight({ text }) {
  return <li className="text-xs leading-relaxed text-gray-600">{text}</li>
}

export default function SectionTradeoffCard({ corridorResults }) {
  if (!corridorResults?.length) return null

  const familiesUsed = new Set()
  corridorResults.forEach((c) => c.segmentResults.forEach((s) => familiesUsed.add(s.sectionFamily)))
  const floodLiveCount = corridorResults.reduce(
    (sum, corridor) => sum + corridor.segmentResults.filter((segment) => segment.liveContext?.flood?.live).length,
    0,
  )
  const floodFallbackCount = corridorResults.reduce(
    (sum, corridor) => sum + corridor.segmentResults.filter((segment) => segment.liveContext?.flood && !segment.liveContext.flood.live).length,
    0,
  )

  const insights = []
  const sorted = [...corridorResults].sort((a, b) => a.totals.carbonKgCo2e - b.totals.carbonKgCo2e)
  const lowest = sorted[0]
  const highest = sorted[sorted.length - 1]
  const carbonDiff = highest.totals.carbonKgCo2e - lowest.totals.carbonKgCo2e

  if (carbonDiff > 0) {
    insights.push(`${lowest.name} saves ${Math.round(carbonDiff / 1000)} tonnes CO2e compared to ${highest.name}.`)
  }

  const frcCorridor = corridorResults.find((c) => c.segmentResults.some((s) => s.sectionFamily === 'fiber_reduced'))
  if (frcCorridor) {
    insights.push(`${frcCorridor.name} uses a thinner 12-in fiber-reinforced slab, reducing concrete volume by ~14% per linear foot and boosting production rate to 55 lf/day.`)
  }

  const scmCorridor = corridorResults.find((c) => c.segmentResults.some((s) => s.sectionFamily === 'low_cement_rc'))
  if (scmCorridor) {
    insights.push(`${scmCorridor.name} uses 35% SCM replacement, cutting cement content and reducing concrete carbon intensity by ~28%.`)
  }

  const bestBuild = [...corridorResults].sort((a, b) => b.totals.buildabilityScore - a.totals.buildabilityScore)[0]
  const worstBuild = [...corridorResults].sort((a, b) => a.totals.buildabilityScore - b.totals.buildabilityScore)[0]
  if (bestBuild.id !== worstBuild.id) {
    insights.push(`${worstBuild.name} scores lower on buildability due to traffic, utility, or ROW constraints along its corridor.`)
  }

  const lowestPenalty = [...corridorResults].sort((a, b) => a.totals.constructionCarbonPenaltyScore - b.totals.constructionCarbonPenaltyScore)[0]
  const highestPenalty = [...corridorResults].sort((a, b) => b.totals.constructionCarbonPenaltyScore - a.totals.constructionCarbonPenaltyScore)[0]
  if (lowestPenalty.id !== highestPenalty.id) {
    const drivers = summarizePenaltyDrivers(highestPenalty)
    const driverText = drivers.length ? `, driven by ${drivers.join(', ')}` : ''
    insights.push(
      `${highestPenalty.name} carries the highest construction carbon penalty (${highestPenalty.totals.constructionCarbonPenaltyScore.toFixed(1)}/10)${driverText}.`,
    )
    insights.push(
      `${lowestPenalty.name} keeps construction carbon penalty lowest at ${lowestPenalty.totals.constructionCarbonPenaltyScore.toFixed(1)}/10, making it the lightest structural path to build.`,
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Section Tradeoffs</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {[...familiesUsed].map((f) => {
          const info = SECTION_INFO[f]
          return info ? (
            <div key={f} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[11px] font-medium text-gray-800">{info.label}</p>
              <p className="text-[10px] text-gray-500">Slab: {info.thickness} | Rebar: {info.rebar}</p>
              <p className="text-[10px] text-gray-500">Fiber: {info.fiber} | Prod: {info.production}</p>
            </div>
          ) : null
        })}
      </div>

      {insights.length > 0 && (
        <ul className="mt-3 list-inside list-disc space-y-1.5">
          {insights.map((t, i) => <Insight key={i} text={t} />)}
        </ul>
      )}

      <p className="mt-3 text-[10px] italic text-gray-400">
        Construction carbon penalty blends structural demand with live FEMA flood context where corridor geometry is available.
        {floodLiveCount > 0 ? ` ${floodLiveCount} segment${floodLiveCount !== 1 ? 's' : ''} used live FEMA NFHL queries.` : ''}
        {floodFallbackCount > 0 ? ` ${floodFallbackCount} segment${floodFallbackCount !== 1 ? 's' : ''} still rely on scenario fallback.` : ''}
      </p>
    </div>
  )
}
