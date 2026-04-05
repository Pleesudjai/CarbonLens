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

  if (!flood.live) {
    return `Flood ${flood.risk || 'low'} • scenario fallback`
  }

  const zone = flood.primaryZone ? `Zone ${flood.primaryZone}` : 'No mapped FEMA zone'
  const subtype = flood.primarySubtype ? ` (${flood.primarySubtype})` : ''
  return `FEMA ${zone}${subtype} • ${flood.risk} risk`
}

export default function SegmentBreakdownTable({ corridorResults }) {
  const [expandedId, setExpandedId] = useState(null)
  if (!corridorResults?.length) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Segment Breakdown</h3>
      {corridorResults.map((c) => (
        <div key={c.id} className="mt-3">
          <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
            className="flex w-full items-center gap-2 text-left text-xs font-medium text-gray-800">
            <span className="text-gray-400">{expandedId === c.id ? '▾' : '▸'}</span>
            {c.name}
            <span className="text-gray-400">({c.segmentResults.length} segments)</span>
          </button>

          {expandedId === c.id && (
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
                {c.segmentResults.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-700">
                      <div>{s.label}</div>
                      {(formatFloodContext(s) || formatDriverList(s)) && (
                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {formatFloodContext(s)}
                          {formatFloodContext(s) && formatDriverList(s) ? ' • ' : ''}
                          {formatDriverList(s) ? `Drivers: ${formatDriverList(s)}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-1.5 text-right text-gray-500">{TYPE_LABELS[s.segmentType] || s.segmentType}</td>
                    <td className="py-1.5 text-right text-gray-500">{SECTION_LABELS[s.sectionFamily] || s.sectionFamily}</td>
                    <td className="py-1.5 text-right text-gray-700">{s.lengthFt.toLocaleString()}'</td>
                    <td className="py-1.5 text-right text-gray-700">{Math.round(s.metrics.carbonKgCo2e / 1000)}t</td>
                    <td className="py-1.5 text-right text-gray-700">{s.metrics.constructionCarbonPenaltyScore.toFixed(1)}</td>
                    <td className="py-1.5 text-right text-gray-700">${(s.metrics.costUsd / 1e6).toFixed(2)}M</td>
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
