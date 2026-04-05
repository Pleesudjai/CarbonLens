import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const COLORS = ['#059669', '#2563eb', '#d97706']

export default function CorridorComparisonChart({ corridorResults }) {
  if (!corridorResults?.length) return null

  // Stacked carbon chart: embodied vs construction-phase per corridor
  const carbonData = corridorResults.map((c) => ({
    name: c.name.length > 16 ? c.name.slice(0, 16) + '...' : c.name,
    'Embodied (t)': Math.round(c.totals.carbonKgCo2e / 1000),
    'Construction (t)': Math.round(c.totals.constructionPhaseCarbonKg / 1000),
  }))

  // Cost and duration grouped bar
  const barData = [
    { metric: 'Cost ($100k)', ...Object.fromEntries(corridorResults.map((c) => [c.name.slice(0, 12), Math.round(c.totals.costUsd / 100000)])) },
    { metric: 'Duration (d)', ...Object.fromEntries(corridorResults.map((c) => [c.name.slice(0, 12), Math.round(c.totals.durationDays)])) },
  ]
  const barKeys = corridorResults.map((c) => c.name.slice(0, 12))

  const radarData = [
    { factor: 'Disruption', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.disruptionScore])) },
    { factor: 'Maintenance', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.maintenanceRiskScore])) },
    { factor: 'Buildability', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.buildabilityScore])) },
    { factor: 'Build Carbon', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.constructionCarbonPenaltyScore])) },
    { factor: 'Community', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.communityBenefitScore])) },
  ]

  return (
    <div className="space-y-6">
      {/* Stacked carbon: embodied + construction phase */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Total Carbon Breakdown</h3>
        <p className="mb-3 text-[10px] text-gray-400">Embodied material carbon + construction-phase emissions (traffic delay, detour, equipment)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={carbonData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} label={{ value: 'tonnes CO2e', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Embodied (t)" stackId="carbon" fill="#059669" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Construction (t)" stackId="carbon" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost and duration */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Cost / Duration</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {barKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Planning Factors</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="factor" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 9 }} />
            {corridorResults.map((c, i) => (
              <Radar key={c.id} name={c.name.slice(0, 16)} dataKey={c.id}
                stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
