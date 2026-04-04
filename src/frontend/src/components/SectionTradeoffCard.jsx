const SECTION_INFO = {
  conventional_rc: { label: 'Conventional RC', thickness: '14 in', rebar: 'High (240 lb/cy)', fiber: 'None', production: '35 lf/day' },
  fiber_reduced: { label: 'Steel-Fiber (Thinner)', thickness: '12 in', rebar: 'Low (40 lb/cy)', fiber: '60 lb/cy', production: '55 lf/day' },
  low_cement_rc: { label: 'Low-Cement SCM', thickness: '14 in', rebar: 'High (240 lb/cy)', fiber: 'None', production: '32 lf/day' },
}

function Insight({ text }) {
  return <li className="text-xs leading-relaxed text-gray-300">{text}</li>
}

export default function SectionTradeoffCard({ corridorResults }) {
  if (!corridorResults?.length) return null

  // Gather unique section families used across all corridors
  const familiesUsed = new Set()
  corridorResults.forEach((c) => c.segmentResults.forEach((s) => familiesUsed.add(s.sectionFamily)))

  // Generate insights by comparing corridors
  const insights = []
  const sorted = [...corridorResults].sort((a, b) => a.totals.carbonKgCo2e - b.totals.carbonKgCo2e)
  const lowest = sorted[0]
  const highest = sorted[sorted.length - 1]
  const carbonDiff = highest.totals.carbonKgCo2e - lowest.totals.carbonKgCo2e

  if (carbonDiff > 0) {
    insights.push(`${lowest.name} saves ${Math.round(carbonDiff / 1000)} tonnes CO2e compared to ${highest.name}.`)
  }

  // Check for fiber-reduced benefits
  const frcCorridor = corridorResults.find((c) => c.segmentResults.some((s) => s.sectionFamily === 'fiber_reduced'))
  if (frcCorridor) {
    insights.push(`${frcCorridor.name} uses a thinner 12-in fiber-reinforced slab, reducing concrete volume by ~14% per linear foot and boosting production rate to 55 lf/day.`)
  }

  // Check for SCM benefits
  const scmCorridor = corridorResults.find((c) => c.segmentResults.some((s) => s.sectionFamily === 'low_cement_rc'))
  if (scmCorridor) {
    insights.push(`${scmCorridor.name} uses 35% SCM replacement, cutting cement content and reducing concrete carbon intensity by ~28%.`)
  }

  // Buildability insight
  const bestBuild = [...corridorResults].sort((a, b) => b.totals.buildabilityScore - a.totals.buildabilityScore)[0]
  const worstBuild = [...corridorResults].sort((a, b) => a.totals.buildabilityScore - b.totals.buildabilityScore)[0]
  if (bestBuild.id !== worstBuild.id) {
    insights.push(`${worstBuild.name} scores lower on buildability due to traffic, utility, or ROW constraints along its corridor.`)
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Section Tradeoffs</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {[...familiesUsed].map((f) => {
          const info = SECTION_INFO[f]
          return info ? (
            <div key={f} className="rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2">
              <p className="text-[11px] font-medium text-white">{info.label}</p>
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
    </div>
  )
}
