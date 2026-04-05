import { useState } from 'react'

const SECTION_LABELS = {
  conventional_rc: 'Conv. RC',
  fiber_reduced: 'FRC (thin)',
  low_cement_rc: 'Low-Cement',
}

const TYPE_LABELS = {
  at_grade_median: 'At-Grade',
  embedded_urban_street: 'Embedded',
  station_zone: 'Station',
  elevated_crossing: 'Elevated',
  bridge_approach: 'Bridge',
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

function formatContextLine(segment) {
  const parts = [formatFloodContext(segment), formatConstructabilityContext(segment)]
  const drivers = formatDriverList(segment)
  if (drivers) parts.push(`Drivers: ${drivers}`)
  return parts.filter(Boolean).join(' - ')
}

export default function SegmentBreakdownTable({ corridorResults }) {
  const [expandedId, setExpandedId] = useState(null)
  if (!corridorResults?.length) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Segment Breakdown</h3>
      {corridorResults.map((corridor) => (
        <div key={corridor.id} className="mt-3">
          <button
            onClick={() => setExpandedId(expandedId === corridor.id ? null : corridor.id)}
            className="flex w-full items-center gap-2 text-left text-xs font-medium text-gray-800"
          >
            <span className="text-gray-400">{expandedId === corridor.id ? 'v' : '>'}</span>
            {corridor.name}
            <span className="text-gray-400">({corridor.segmentResults.length} segments)</span>
          </button>

          {expandedId === corridor.id && (
            <table className="mt-2 w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400">
                  <th className="py-1 text-left">Segment</th>
                  <th className="py-1 text-right">Type</th>
                  <th className="py-1 text-right">Section</th>
                  <th className="py-1 text-right">Length</th>
                  <th className="py-1 text-right">Carbon</th>
                  <th className="py-1 text-right">Build Carbon</th>
                  <th className="py-1 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {corridor.segmentResults.map((segment) => (
                  <tr key={segment.id} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-700">
                      <div>{segment.label}</div>
                      {formatContextLine(segment) && (
                        <div className="mt-0.5 text-[10px] text-gray-400">{formatContextLine(segment)}</div>
                      )}
                    </td>
                    <td className="py-1.5 text-right text-gray-500">{TYPE_LABELS[segment.segmentType] || segment.segmentType}</td>
                    <td className="py-1.5 text-right text-gray-500">{SECTION_LABELS[segment.sectionFamily] || segment.sectionFamily}</td>
                    <td className="py-1.5 text-right text-gray-700">{segment.lengthFt.toLocaleString()}'</td>
                    <td className="py-1.5 text-right text-gray-700">{Math.round(segment.metrics.carbonKgCo2e / 1000)}t</td>
                    <td className="py-1.5 text-right text-gray-700">{segment.metrics.constructionCarbonPenaltyScore.toFixed(1)}</td>
                    <td className="py-1.5 text-right text-gray-700">${(segment.metrics.costUsd / 1e6).toFixed(2)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}
