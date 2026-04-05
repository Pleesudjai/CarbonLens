import { useState } from 'react'

const SECTION_INFO = {
  conventional_rc: { label: 'Conventional RC', thickness: '14 in', rebar: 'High (240 lb/cy)', fiber: 'None', production: '35 lf/day' },
  fiber_reduced: { label: 'Fiber Reinforced Concrete (FRC)', thickness: '12 in', rebar: 'None', fiber: '60 lb/cy', production: '55 lf/day' },
}

const SECTION_FIGURES = {
  conventional_rc: '/section-figures/RC section.png',
  fiber_reduced: '/section-figures/FRC section.png',
}

const DISPLAY_FAMILIES = ['conventional_rc', 'fiber_reduced']

const SECTION_BENCHMARKS = {
  conventional_rc: {
    thicknessIn: 14,
    widthFt: 10,
    concreteKgCo2ePerCy: 290,
    rebarLbPerCy: 240,
    steelFiberLbPerCy: 0,
    productionLfPerDay: 35,
    maintenanceRisk: 4,
  },
  fiber_reduced: {
    thicknessIn: 12,
    widthFt: 10,
    concreteKgCo2ePerCy: 275,
    rebarLbPerCy: 0,
    steelFiberLbPerCy: 60,
    productionLfPerDay: 55,
    maintenanceRisk: 3,
  },
}

const BENCHMARK_LENGTH_FT = 5280
const TRACKWORK_KG_PER_LF = 18
const REBAR_KG_PER_LB = 0.9
const STEEL_FIBER_KG_PER_LB = 1.03
const BENCHMARK_TRAFFIC_AADT = 15000
const IDLE_KG_PER_VEHICLE_HOUR = 8.16
const DETOUR_EXTRA_MILES = 1.5
const DETOUR_KG_PER_MILE = 0.404
const AVG_DELAY_HOURS_PER_VEHICLE = 0.05
const EQUIPMENT_KG_PER_DAY = 2500
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

function formatMetricValue(value, decimals = 0) {
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
}

function TradeoffMetric({ title, unit, rcValue, frcValue, note, better = 'lower', decimals = 0, footer = null }) {
  const maxValue = Math.max(rcValue, frcValue, 1)
  const rcPct = (rcValue / maxValue) * 100
  const frcPct = (frcValue / maxValue) * 100
  const frcBetter = better === 'lower' ? frcValue < rcValue : frcValue > rcValue
  const rcBetter = better === 'lower' ? rcValue < frcValue : rcValue > frcValue

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-gray-700">{title}</p>
          <p className="text-[10px] text-gray-400">{note}</p>
        </div>
        <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-500">{unit}</span>
      </div>

      <div className="mt-2 space-y-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className={`font-semibold ${rcBetter ? 'text-emerald-700' : 'text-gray-500'}`}>Conventional RC</span>
            <span className={`font-semibold ${rcBetter ? 'text-emerald-700' : 'text-gray-700'}`}>
              {formatMetricValue(rcValue, decimals)} {unit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-slate-500" style={{ width: `${rcPct}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className={`font-semibold ${frcBetter ? 'text-emerald-700' : 'text-violet-700'}`}>FRC candidate</span>
            <span className={`font-semibold ${frcBetter ? 'text-emerald-700' : 'text-violet-700'}`}>
              {formatMetricValue(frcValue, decimals)} {unit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-violet-500" style={{ width: `${frcPct}%` }} />
          </div>
        </div>
      </div>

      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  )
}

function calculateBenchmark(section) {
  const volumeCy = (BENCHMARK_LENGTH_FT * section.widthFt * (section.thicknessIn / 12)) / 27
  const concreteKg = volumeCy * section.concreteKgCo2ePerCy
  const rebarKg = volumeCy * section.rebarLbPerCy * REBAR_KG_PER_LB
  const steelFiberKg = volumeCy * section.steelFiberLbPerCy * STEEL_FIBER_KG_PER_LB
  const trackworkKg = BENCHMARK_LENGTH_FT * TRACKWORK_KG_PER_LF

  return {
    volumeCy,
    concreteKg,
    rebarKg,
    steelFiberKg,
    trackworkKg,
    totalKg: concreteKg + rebarKg + steelFiberKg + trackworkKg,
  }
}

function calculateBenchmarkDuringBuildKg(productionLfPerDay) {
  const durationDays = BENCHMARK_LENGTH_FT / Math.max(productionLfPerDay, 1)
  const trafficIdlePerDay = BENCHMARK_TRAFFIC_AADT * AVG_DELAY_HOURS_PER_VEHICLE * IDLE_KG_PER_VEHICLE_HOUR
  const trafficDetourPerDay = BENCHMARK_TRAFFIC_AADT * DETOUR_EXTRA_MILES * DETOUR_KG_PER_MILE
  const constructionCarbonPerDay = trafficIdlePerDay + trafficDetourPerDay + EQUIPMENT_KG_PER_DAY
  return constructionCarbonPerDay * durationDays
}

export default function SectionTradeoffCard({ corridorResults }) {
  if (!corridorResults?.length) return null

  const [selectedRouteId, setSelectedRouteId] = useState(corridorResults[0]?.id ?? '')

  const corridorsByFamily = DISPLAY_FAMILIES.reduce((map, family) => {
    map[family] = corridorResults
      .filter((corridor) => corridor.segmentResults.some((segment) => segment.sectionFamily === family))
      .map((corridor) => corridor.name)
    return map
  }, {})
  const rcBenchmark = calculateBenchmark(SECTION_BENCHMARKS.conventional_rc)
  const frcBenchmark = calculateBenchmark(SECTION_BENCHMARKS.fiber_reduced)
  const slabReductionPct = ((rcBenchmark.volumeCy - frcBenchmark.volumeCy) / rcBenchmark.volumeCy) * 100
  const rebarReductionPct = ((SECTION_BENCHMARKS.conventional_rc.rebarLbPerCy - SECTION_BENCHMARKS.fiber_reduced.rebarLbPerCy) / SECTION_BENCHMARKS.conventional_rc.rebarLbPerCy) * 100
  const materialSavingsTPerMi = (rcBenchmark.totalKg - frcBenchmark.totalKg) / 1000
  const materialSavingsPct = ((rcBenchmark.totalKg - frcBenchmark.totalKg) / rcBenchmark.totalKg) * 100
  const productionGainPct =
    ((SECTION_BENCHMARKS.fiber_reduced.productionLfPerDay - SECTION_BENCHMARKS.conventional_rc.productionLfPerDay) /
      SECTION_BENCHMARKS.conventional_rc.productionLfPerDay) *
    100
  const rcMaterialTPerMi = rcBenchmark.totalKg / 1000
  const frcMaterialTPerMi = frcBenchmark.totalKg / 1000
  const rcSteelLbPerCy = SECTION_BENCHMARKS.conventional_rc.rebarLbPerCy + SECTION_BENCHMARKS.conventional_rc.steelFiberLbPerCy
  const frcSteelLbPerCy = SECTION_BENCHMARKS.fiber_reduced.rebarLbPerCy + SECTION_BENCHMARKS.fiber_reduced.steelFiberLbPerCy
  const steelReductionPct = ((rcSteelLbPerCy - frcSteelLbPerCy) / rcSteelLbPerCy) * 100
  const rcDuringBuildTPerMi = calculateBenchmarkDuringBuildKg(SECTION_BENCHMARKS.conventional_rc.productionLfPerDay) / 1000
  const frcDuringBuildTPerMi = calculateBenchmarkDuringBuildKg(SECTION_BENCHMARKS.fiber_reduced.productionLfPerDay) / 1000
  const duringBuildSavingsTPerMi = rcDuringBuildTPerMi - frcDuringBuildTPerMi
  const rcTotalTPerMi = rcMaterialTPerMi + rcDuringBuildTPerMi
  const frcTotalTPerMi = frcMaterialTPerMi + frcDuringBuildTPerMi
  const totalSavingsTPerMi = rcTotalTPerMi - frcTotalTPerMi
  const selectedRoute = corridorResults.find((corridor) => corridor.id === selectedRouteId) || corridorResults[0]
  const selectedRouteMiles = Math.max((selectedRoute?.totals?.lengthFt || 0) / 5280, 0)
  const selectedRouteRcTotalT = rcTotalTPerMi * selectedRouteMiles
  const selectedRouteFrcTotalT = frcTotalTPerMi * selectedRouteMiles
  const selectedRouteSavingsT = selectedRouteRcTotalT - selectedRouteFrcTotalT
  const equivalentRcTotalMiles = rcTotalTPerMi > 0 ? selectedRouteSavingsT / rcTotalTPerMi : 0
  const floodLiveCount = corridorResults.reduce(
    (sum, corridor) => sum + corridor.segmentResults.filter((segment) => segment.liveContext?.flood?.live).length,
    0,
  )
  const floodFallbackCount = corridorResults.reduce(
    (sum, corridor) => sum + corridor.segmentResults.filter((segment) => segment.liveContext?.flood && !segment.liveContext.flood.live).length,
    0,
  )
  const tigerLiveCount = corridorResults.reduce(
    (sum, corridor) => sum + corridor.segmentResults.filter((segment) => segment.liveContext?.constructability?.live).length,
    0,
  )
  const tigerFallbackCount = corridorResults.reduce(
    (sum, corridor) =>
      sum + corridor.segmentResults.filter((segment) => segment.liveContext?.constructability && !segment.liveContext.constructability.live).length,
    0,
  )

  const insights = []
  insights.push(
    `Candidate FRC tradeoff: if you switch a typical at-grade section from Conventional RC to Fiber Reinforced Concrete (FRC), the slab gets about ${slabReductionPct.toFixed(
      0,
    )}% thinner, the rebar cage drops out entirely, and the mix adds 60 lb/cy of steel fiber.`,
  )
  insights.push(
    `On a normalized one-mile benchmark, that shift lowers material carbon by about ${materialSavingsTPerMi.toFixed(0)} t/mi (${materialSavingsPct.toFixed(
      0,
    )}%) while base production rises from ${SECTION_BENCHMARKS.conventional_rc.productionLfPerDay} to ${SECTION_BENCHMARKS.fiber_reduced.productionLfPerDay} lf/day.`,
  )
  insights.push(
    `In the current model, the FRC section also lowers base maintenance risk from ${SECTION_BENCHMARKS.conventional_rc.maintenanceRisk} to ${SECTION_BENCHMARKS.fiber_reduced.maintenanceRisk}, so the tradeoff is less concrete and no rebar cage versus a more specialized fiber mix.`,
  )
  const sorted = [...corridorResults].sort((a, b) => a.totals.carbonKgCo2e - b.totals.carbonKgCo2e)
  const lowest = sorted[0]
  const highest = sorted[sorted.length - 1]
  const carbonDiff = highest.totals.carbonKgCo2e - lowest.totals.carbonKgCo2e

  if (carbonDiff > 0) {
    insights.push(`${lowest.name} saves ${Math.round(carbonDiff / 1000)} tonnes of embodied CO2e compared to ${highest.name}.`)
  }

  const frcCorridor = corridorResults.find((c) => c.segmentResults.some((s) => s.sectionFamily === 'fiber_reduced'))
  if (frcCorridor) {
    insights.push(
      `${frcCorridor.name} uses a thinner 12-in fiber-reinforced slab instead of conventional RC, reducing concrete volume by about 14% per linear foot and boosting production rate to 55 lf/day.`,
    )
  }

  const bestBuild = [...corridorResults].sort((a, b) => b.totals.buildabilityScore - a.totals.buildabilityScore)[0]
  const worstBuild = [...corridorResults].sort((a, b) => a.totals.buildabilityScore - b.totals.buildabilityScore)[0]
  if (bestBuild.id !== worstBuild.id) {
    insights.push(`${worstBuild.name} scores lower on buildability due to traffic, utility, or ROW constraints along its corridor.`)
  }

  const sortedByConstPhase = [...corridorResults].sort((a, b) => a.totals.constructionPhaseCarbonKg - b.totals.constructionPhaseCarbonKg)
  const lowestConstPhase = sortedByConstPhase[0]
  const highestConstPhase = sortedByConstPhase[sortedByConstPhase.length - 1]
  if (lowestConstPhase && highestConstPhase && lowestConstPhase.id !== highestConstPhase.id) {
    const constPhaseDiff = highestConstPhase.totals.constructionPhaseCarbonKg - lowestConstPhase.totals.constructionPhaseCarbonKg
    const daysDiff = Math.round(highestConstPhase.totals.durationDays - lowestConstPhase.totals.durationDays)
    if (constPhaseDiff > 0) {
      const durationText =
        daysDiff > 0
          ? ` by building ${daysDiff} fewer days`
          : daysDiff < 0
            ? ` even though it builds ${Math.abs(daysDiff)} more days`
            : ''
      insights.push(
        `${lowestConstPhase.name} saves ${Math.round(constPhaseDiff / 1000)} tonnes of during-build CO2e${durationText}, reducing traffic delays, detours, and equipment emissions.`,
      )
    }
  }

  const sortedByTotal = [...corridorResults].sort((a, b) => a.totals.totalCarbonKg - b.totals.totalCarbonKg)
  const lowestTotal = sortedByTotal[0]
  const highestTotal = sortedByTotal[sortedByTotal.length - 1]
  if (lowestTotal && highestTotal && lowestTotal.id !== highestTotal.id) {
    const totalDiff = highestTotal.totals.totalCarbonKg - lowestTotal.totals.totalCarbonKg
    const pct = ((totalDiff / highestTotal.totals.totalCarbonKg) * 100).toFixed(0)
    insights.push(
      `When during-build emissions are included, ${lowestTotal.name} reduces total carbon by ${Math.round(totalDiff / 1000)} tonnes (${pct}%), showing that material savings are only part of the story.`,
    )
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
        {DISPLAY_FAMILIES.map((f) => {
          const info = SECTION_INFO[f]
          const corridorNames = corridorsByFamily[f] || []
          const roleLabel = corridorNames.length > 0 ? corridorNames.join(' + ') : f === 'fiber_reduced' ? 'Candidate option' : 'Default section'
          return info ? (
            <div key={f} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[11px] font-medium text-gray-800">{info.label}</p>
              <p className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${corridorNames.length > 0 ? 'text-emerald-700' : 'text-violet-700'}`}>
                {roleLabel}
              </p>
              <p className="text-[10px] text-gray-500">Slab: {info.thickness} | Rebar: {info.rebar}</p>
              <p className="text-[10px] text-gray-500">Fiber: {info.fiber} | Prod: {info.production}</p>
              {SECTION_FIGURES[f] && (
                <img
                  src={SECTION_FIGURES[f]}
                  alt={`${info.label} section figure`}
                  className="mt-2 mx-auto w-full max-w-[320px] rounded border border-gray-200 bg-white"
                />
              )}
            </div>
          ) : null
        })}
      </div>

      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Candidate FRC Tradeoff Graph</h4>
            <p className="mt-1 text-[11px] text-gray-600">
              Same one-mile plus 15,000 AADT benchmark for both sections. The route box below scales that benchmark to the corridor you choose.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              RC vs FRC
            </span>
            <label className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>Route</span>
              <select
                value={selectedRoute?.id || ''}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-700"
              >
                {corridorResults.map((corridor) => (
                  <option key={corridor.id} value={corridor.id}>
                    {corridor.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <TradeoffMetric
            title="Slab thickness"
            unit="in"
            rcValue={SECTION_BENCHMARKS.conventional_rc.thicknessIn}
            frcValue={SECTION_BENCHMARKS.fiber_reduced.thicknessIn}
            note={`${slabReductionPct.toFixed(0)}% thinner with FRC`}
            better="lower"
          />
          <TradeoffMetric
            title="Steel"
            unit="lb/cy"
            rcValue={rcSteelLbPerCy}
            frcValue={frcSteelLbPerCy}
            note={`${steelReductionPct.toFixed(0)}% less total steel with FRC.`}
            better="lower"
          />
          <TradeoffMetric
            title="Material carbon"
            unit="t/mi"
            rcValue={rcMaterialTPerMi}
            frcValue={frcMaterialTPerMi}
            note={`${materialSavingsTPerMi.toFixed(0)} t/mi lower with FRC`}
            better="lower"
            decimals={0}
          />
          <TradeoffMetric
            title="During-Build carbon"
            unit="t/mi"
            rcValue={rcDuringBuildTPerMi}
            frcValue={frcDuringBuildTPerMi}
            note={`${duringBuildSavingsTPerMi.toFixed(0)} t/mi lower with FRC at the same traffic benchmark`}
            better="lower"
            decimals={0}
          />
          <TradeoffMetric
            title="Total carbon"
            unit="t/mi"
            rcValue={rcTotalTPerMi}
            frcValue={frcTotalTPerMi}
            note={`${totalSavingsTPerMi.toFixed(0)} t/mi lower overall with FRC`}
            better="lower"
            decimals={0}
          />
          <TradeoffMetric
            title="Selected route total carbon"
            unit="t"
            rcValue={selectedRouteRcTotalT}
            frcValue={selectedRouteFrcTotalT}
            note={`${selectedRouteSavingsT.toFixed(0)} t lower over ${selectedRoute?.name || 'this route'} (${selectedRouteMiles.toFixed(2)} mi)`}
            better="lower"
            decimals={0}
            footer={
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-medium text-sky-700">
                  🌍 Around {formatMetricValue(selectedRouteSavingsT, 0)} tonnes total CO2e saved on this route
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
                  🛤️ Same as about {formatMetricValue(equivalentRcTotalMiles, 1)} miles of full conventional RC build carbon
                </span>
              </div>
            }
          />
        </div>
      </div>

      {insights.length > 0 && (
        <ul className="mt-3 list-inside list-disc space-y-1.5">
          {insights.map((t, i) => <Insight key={i} text={t} />)}
        </ul>
      )}

      <p className="mt-3 text-[10px] italic text-gray-400">
        Construction carbon penalty blends structural demand with live FEMA flood context and live TIGER road-network constructability where corridor geometry is available.
        {floodLiveCount > 0 ? ` ${floodLiveCount} segment${floodLiveCount !== 1 ? 's' : ''} used live FEMA NFHL queries.` : ''}
        {floodFallbackCount > 0 ? ` ${floodFallbackCount} segment${floodFallbackCount !== 1 ? 's' : ''} still rely on scenario fallback.` : ''}
        {tigerLiveCount > 0 ? ` ${tigerLiveCount} segment${tigerLiveCount !== 1 ? 's' : ''} used live TIGER roadway queries.` : ''}
        {tigerFallbackCount > 0 ? ` ${tigerFallbackCount} segment${tigerFallbackCount !== 1 ? 's' : ''} still rely on constructability fallback.` : ''}
      </p>
    </div>
  )
}
