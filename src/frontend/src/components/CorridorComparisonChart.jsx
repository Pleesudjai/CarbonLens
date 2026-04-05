import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const COLORS = ['#059669', '#2563eb', '#d97706']
const FEET_PER_MILE = 5280

function derivePerMileValue(totals, totalField, perMileField) {
  if (Number.isFinite(Number(totals?.[perMileField]))) {
    return Number(totals[perMileField])
  }

  const lengthFt = Number(totals?.lengthFt) || 0
  const lengthMi = lengthFt > 0 ? lengthFt / FEET_PER_MILE : 0
  if (lengthMi <= 0) return 0

  return (Number(totals?.[totalField]) || 0) / lengthMi
}

export default function CorridorComparisonChart({ corridorResults }) {
  if (!corridorResults?.length) return null

  // Stacked carbon chart: embodied vs construction-phase per mile
  const carbonData = corridorResults.map((c) => ({
    name: c.name.length > 16 ? c.name.slice(0, 16) + '...' : c.name,
    'Material (t/mi)': derivePerMileValue(c.totals, 'carbonKgCo2e', 'carbonKgCo2ePerMi') / 1000,
    'During Build (t/mi)': derivePerMileValue(c.totals, 'constructionPhaseCarbonKg', 'constructionPhaseCarbonKgPerMi') / 1000,
  }))

  const radarData = [
    { factor: 'Disruption', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.disruptionScore])) },
    { factor: 'Maintenance', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.maintenanceRiskScore])) },
    { factor: 'Buildability', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.buildabilityScore])) },
    { factor: 'Build Penalty', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.constructionCarbonPenaltyScore])) },
    { factor: 'Community', ...Object.fromEntries(corridorResults.map((c) => [c.id, c.totals.communityBenefitScore])) },
  ]

  return (
    <div className="space-y-6">
      {/* Stacked carbon: embodied + construction phase */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Carbon Per Mile Breakdown</h3>
        <p className="mb-3 text-[10px] text-gray-400">Green = material carbon per mile. Amber = during-build carbon per mile from traffic delay, detours, and equipment.</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={carbonData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              label={{ value: 'tonnes CO2e / mile', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }}
            />
            <Tooltip
              formatter={(value, name) => [`${Number(value).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t/mi`, name]}
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Material (t/mi)" stackId="carbon" fill="#059669" radius={[0, 0, 0, 0]} />
            <Bar dataKey="During Build (t/mi)" stackId="carbon" fill="#f59e0b" radius={[4, 4, 0, 0]} />
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
