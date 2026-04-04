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

export default function SegmentBreakdownTable({ corridorResults }) {
  const [expandedId, setExpandedId] = useState(null)
  if (!corridorResults?.length) return null

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Segment Breakdown</h3>
      {corridorResults.map((c) => (
        <div key={c.id} className="mt-3">
          <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
            className="flex w-full items-center gap-2 text-left text-xs font-medium text-white">
            <span>{expandedId === c.id ? '▾' : '▸'}</span>
            {c.name}
            <span className="text-gray-500">({c.segmentResults.length} segments)</span>
          </button>

          {expandedId === c.id && (
            <table className="mt-2 w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-700 text-gray-500">
                  <th className="py-1 text-left">Segment</th>
                  <th className="py-1 text-right">Type</th>
                  <th className="py-1 text-right">Section</th>
                  <th className="py-1 text-right">Length</th>
                  <th className="py-1 text-right">Carbon</th>
                  <th className="py-1 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {c.segmentResults.map((s) => (
                  <tr key={s.id} className="border-b border-gray-700/30">
                    <td className="py-1.5 text-gray-300">{s.label}</td>
                    <td className="py-1.5 text-right text-gray-400">{TYPE_LABELS[s.segmentType] || s.segmentType}</td>
                    <td className="py-1.5 text-right text-gray-400">{SECTION_LABELS[s.sectionFamily] || s.sectionFamily}</td>
                    <td className="py-1.5 text-right text-gray-300">{s.lengthFt.toLocaleString()}'</td>
                    <td className="py-1.5 text-right text-gray-300">{Math.round(s.metrics.carbonKgCo2e / 1000)}t</td>
                    <td className="py-1.5 text-right text-gray-300">${(s.metrics.costUsd / 1e6).toFixed(2)}M</td>
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
