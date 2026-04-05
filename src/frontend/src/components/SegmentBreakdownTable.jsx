import StructureCarbonBar from './StructureCarbonBar'

const FEET_PER_MILE = 5280

const SECTION_LABELS = {
  conventional_rc: 'Conventional RC',
  fiber_reduced: 'FRC (12 in thin slab)',
  low_cement_rc: 'Low-Cement SCM',
}

const TYPE_LABELS = {
  at_grade_median: 'At-Grade Median',
  embedded_urban_street: 'Embedded Urban',
  station_zone: 'Station Zone',
  elevated_crossing: 'Elevated Crossing',
  bridge_approach: 'Bridge Approach',
}

const DRIVER_LABELS = {
  elevated_structure: 'elevated structure',
  bridge_structure: 'bridge structure',
  embedded_urban_construction: 'embedded urban construction',
  flood_mitigation: 'flood mitigation',
  constrained_row: 'constrained ROW',
  utility_relocation: 'utility relocation',
  urban_core_staging: 'urban-core staging',
  night_work_window: 'night work',
}

function formatDriverList(segment) {
  const drivers = segment.metrics.constructionCarbonPenalty?.drivers || []
  if (!drivers.length) return null
  return drivers.map((driver) => DRIVER_LABELS[driver] || driver.replaceAll('_', ' ')).slice(0, 3).join(', ')
}

function formatFloodContext(segment) {
  const flood = segment.liveContext?.flood
  if (!flood) return null
  if (!flood.live) return `Flood ${flood.risk || 'low'} - scenario fallback`
  const zone = flood.primaryZone ? `Zone ${flood.primaryZone}` : 'No mapped FEMA zone'
  const subtype = flood.primarySubtype ? ` (${flood.primarySubtype})` : ''
  return `FEMA ${zone}${subtype} - ${flood.risk} risk`
}

function formatConstructabilityContext(segment) {
  const constructability = segment.liveContext?.constructability
  if (!constructability) return null
  if (!constructability.live || !constructability.metrics) {
    return 'U.S. Census Bureau TIGERweb Transportation - road-network proxy fallback'
  }
  const metrics = constructability.metrics
  return `U.S. Census Bureau TIGERweb Transportation roads/mi ${metrics.roadFeatureDensityPerMi} (P ${metrics.primaryPerMi} / S ${metrics.secondaryPerMi} / L ${metrics.localPerMi})`
}

function contextLine(segment) {
  return [formatFloodContext(segment), formatConstructabilityContext(segment), formatDriverList(segment) ? `Drivers: ${formatDriverList(segment)}` : null]
    .filter(Boolean)
    .join(' - ')
}

function formatTonnes(valueKg) {
  const valueT = valueKg / 1000
  return valueT >= 1000 ? Math.round(valueT).toLocaleString() : Math.round(valueT).toString()
}

function tonnesPerMile(valueKg, lengthFt) {
  const safeLengthFt = Number(lengthFt) || 0
  if (!Number.isFinite(Number(valueKg)) || safeLengthFt <= 0) return null
  const lengthMi = safeLengthFt / FEET_PER_MILE
  if (lengthMi <= 0) return null
  return (Number(valueKg) / 1000) / lengthMi
}

function formatCorridorScope(corridorResults) {
  const names = corridorResults
    .map((corridor) => corridor?.name)
    .filter(Boolean)

  if (names.length === 0) return 'all corridor options'
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]}`
  return `${names.slice(0, 3).join(', ')}, and ${names.length - 3} more`
}

function helperTextForScope(corridorCount, comparisonScope) {
  if (corridorCount <= 1) {
    return 'Gray background = unused space up to the largest per-mile carbon value in the current corridor. Material carbon mostly follows length. Build carbon mostly follows traffic and construction time.'
  }

  return `Gray background = unused space up to the largest per-mile carbon value in this comparison (${comparisonScope}). Material carbon mostly follows length. Build carbon mostly follows traffic and construction time.`
}

function DetailPill({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-gray-800">{value}</p>
    </div>
  )
}

function SegmentCard({ segment, maxTotalT, comparisonScope, corridorCount }) {
  const embodiedPerMiT = tonnesPerMile(segment.metrics.carbonKgCo2e, segment.lengthFt) || 0
  const constructionPerMiT = tonnesPerMile(segment.metrics.constructionPhaseCarbonKg, segment.lengthFt) || 0
  const totalPerMiT = tonnesPerMile(segment.metrics.totalCarbonKg, segment.lengthFt) || 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h5 className="text-sm font-semibold text-gray-900">{segment.label}</h5>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{contextLine(segment)}</p>
        </div>
        <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600">
          Total {totalPerMiT.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t/mi
        </div>
      </div>

      <div className="mt-3 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-2">
          <DetailPill label="Structure Type" value={TYPE_LABELS[segment.segmentType] || segment.segmentType} />
          <DetailPill label="Section Family" value={SECTION_LABELS[segment.sectionFamily] || segment.sectionFamily} />
          <DetailPill label="Length" value={`${segment.lengthFt.toLocaleString()} ft`} />
          <DetailPill label="Cost" value={`$${(segment.metrics.costUsd / 1e6).toFixed(2)}M`} />
        </div>
        <StructureCarbonBar
          embodiedT={embodiedPerMiT}
          constructionT={constructionPerMiT}
          totalT={totalPerMiT}
          maxTotalT={maxTotalT}
          scaleLabel={corridorCount <= 1 ? 'Largest per-mile value' : 'Largest per-mile value'}
          helperText={helperTextForScope(corridorCount, comparisonScope)}
        />
      </div>
    </div>
  )
}

export default function SegmentBreakdownTable({ corridorResults }) {
  if (!corridorResults?.length) return null
  const corridorCount = corridorResults.length
  const maxPerMiT = Math.max(
    ...corridorResults.flatMap((corridor) => {
      const corridorPerMi = tonnesPerMile(corridor.totals.totalCarbonKg, corridor.totals.lengthFt)
      const segmentPerMi = corridor.segmentResults.map((segment) => tonnesPerMile(segment.metrics.totalCarbonKg, segment.lengthFt))
      return [corridorPerMi, ...segmentPerMi].map((value) => value || 0)
    }),
  )
  const comparisonScope = formatCorridorScope(corridorResults)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Structure Carbon Comparison</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
        Green bars show material carbon per mile in concrete, steel, and fiber. Amber bars show during-build carbon per mile from traffic delay, detours, and equipment. The full bar shows total carbon per mile for each structure section.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
        Simple rule: longer routes usually raise material carbon, but busier roads and longer construction time can raise total carbon much more. This panel normalizes everything per mile so different project lengths stay comparable.
      </p>

      <div className="mt-4 space-y-5">
        {corridorResults.map((corridor) => (
          <div key={corridor.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
            {(() => {
              const embodiedPerMiT = tonnesPerMile(corridor.totals.carbonKgCo2e, corridor.totals.lengthFt) || 0
              const constructionPerMiT = tonnesPerMile(corridor.totals.constructionPhaseCarbonKg, corridor.totals.lengthFt) || 0
              const totalPerMiT = tonnesPerMile(corridor.totals.totalCarbonKg, corridor.totals.lengthFt) || 0

              return (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{corridor.name}</h4>
                <p className="mt-1 text-[11px] text-gray-500">
                  Per mile: {embodiedPerMiT.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t/mi materials, {constructionPerMiT.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t/mi during build, {totalPerMiT.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t/mi total.
                </p>
              </div>
              <div className="min-w-[260px] flex-1 xl:max-w-[420px]">
                <StructureCarbonBar
                  embodiedT={embodiedPerMiT}
                  constructionT={constructionPerMiT}
                  totalT={totalPerMiT}
                  maxTotalT={maxPerMiT}
                  compact
                  scaleLabel="Largest per-mile value"
                />
              </div>
            </div>
              )
            })()}

            <div className="mt-4 space-y-3">
              {corridor.segmentResults.map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  maxTotalT={maxPerMiT}
                  comparisonScope={comparisonScope}
                  corridorCount={corridorCount}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
