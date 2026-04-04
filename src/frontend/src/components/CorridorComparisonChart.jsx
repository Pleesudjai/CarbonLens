import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b']

export default function CorridorComparisonChart({ corridorResults }) {
  if (!corridorResults?.length) return null

  // Bar chart data: carbon, cost, duration
  const barData = [
    { metric: 'Carbon (t)', ...Object.fromEntries(corridorResults.map((c) => [c.name.slice(0, 12), Math.round(c.totals.carbonKgCo2e / 1000)])) },
    { metric: 'Cost ($100k)', ...Object.fromEntries(corridorResults.map((c) => [c.name.slice(0, 12), Math.round(c.totals.costUsd / 100000)])) },
    { metric: 'Duration (d)', ...Object.fromEntries(corridorResults.map((c) => [c.name.slice(0, 12), Math.round(c.totals.durationDays)])) },
  ]
  const barKeys = corridorResults.map((c) => c.name.slice(0, 12))

  // Radar chart data: disruption, maintenance, buildability, community
  const radarData = [
    { factor: 'Disruption', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.disruptionScore])) },
    { factor: 'Maintenance', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.maintenanceRiskScore])) },
    { factor: 'Buildability', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.buildabilityScore])) },
    { factor: 'Community', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.communityBenefitScore])) },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Carbon / Cost / Duration</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {barKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Planning Factors</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="factor" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 9 }} />
            {corridorResults.map((c, i) => (
              <Radar key={c.id} name={c.name.slice(0, 16)} dataKey={c.id}
                stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
