const FEET_PER_MILE = 5280

const LOWER_IS_BETTER = new Set([
  'totalCarbonKg',
  'totalCarbonKgPerMi',
  'costUsd',
  'costUsdPerMi',
  'durationDays',
  'disruptionScore',
  'maintenanceRiskScore',
  'constructionCarbonPenaltyScore',
  'compositeScore',
])

const LENS_CONFIG = {
  planner: {
    weights: {
      totalCarbonKg: 0.28,
      totalCarbonKgPerMi: 0.18,
      costUsd: 0.12,
      costUsdPerMi: 0.07,
      durationDays: 0.16,
      communityBenefitScore: 0.11,
      disruptionScore: 0.08,
    },
    badges: [
      { field: 'bestOverallId', label: 'Best Overall', color: 'bg-emerald-600', summary: 'best overall balance' },
      { field: 'lowestCarbonId', label: 'Lowest Total Carbon', color: 'bg-teal-600', summary: 'lowest total carbon' },
      { field: 'lowestCostId', label: 'Lowest Cost', color: 'bg-blue-600', summary: 'lowest cost' },
      { field: 'fastestId', label: 'Fastest Build', color: 'bg-violet-600', summary: 'fastest construction' },
      { field: 'lowestDisruptionId', label: 'Lowest Disruption', color: 'bg-amber-600', summary: 'lowest disruption' },
      { field: 'highestCommunityBenefitId', label: 'Community Benefit', color: 'bg-rose-600', summary: 'highest community benefit' },
    ],
  },
  contractor: {
    weights: {
      costUsd: 0.24,
      costUsdPerMi: 0.14,
      durationDays: 0.2,
      buildabilityScore: 0.18,
      constructionCarbonPenaltyScore: 0.14,
      maintenanceRiskScore: 0.06,
      disruptionScore: 0.04,
    },
    badges: [
      { field: 'bestOverallId', label: 'Best Overall', color: 'bg-emerald-600', summary: 'best build program' },
      { field: 'lowestCostId', label: 'Lowest Cost', color: 'bg-blue-600', summary: 'lowest cost' },
      { field: 'lowestCostPerMiId', label: 'Lowest Cost / mile', color: 'bg-cyan-600', summary: 'lowest cost per mile' },
      { field: 'fastestId', label: 'Fastest Build', color: 'bg-violet-600', summary: 'fastest construction' },
      { field: 'highestBuildabilityId', label: 'Best Buildability', color: 'bg-lime-600', summary: 'highest buildability' },
      { field: 'lowestConstructionPenaltyId', label: 'Lowest Build Penalty', color: 'bg-slate-700', summary: 'lowest build penalty' },
    ],
  },
  community: {
    weights: {
      communityBenefitScore: 0.34,
      disruptionScore: 0.24,
      totalCarbonKg: 0.14,
      totalCarbonKgPerMi: 0.1,
      costUsd: 0.04,
      durationDays: 0.04,
      constructionCarbonPenaltyScore: 0.1,
    },
    badges: [
      { field: 'bestOverallId', label: 'Best Overall', color: 'bg-emerald-600', summary: 'best community-facing balance' },
      { field: 'highestCommunityBenefitId', label: 'Community Benefit', color: 'bg-rose-600', summary: 'highest community benefit' },
      { field: 'lowestDisruptionId', label: 'Lowest Disruption', color: 'bg-amber-600', summary: 'lowest disruption' },
      { field: 'lowestCarbonId', label: 'Lowest Total Carbon', color: 'bg-teal-600', summary: 'lowest total carbon' },
      { field: 'lowestConstructionPenaltyId', label: 'Lowest Build Penalty', color: 'bg-slate-700', summary: 'lowest build penalty' },
    ],
  },
}

function round(value, decimals = 3) {
  const factor = 10 ** decimals
  return Math.round((Number(value) || 0) * factor) / factor
}

function deriveTotalField(totals, field) {
  if (totals?.[field] !== undefined && totals?.[field] !== null) {
    return totals[field]
  }

  const lengthFt = Number(totals?.lengthFt) || 0
  const lengthMi = lengthFt > 0 ? lengthFt / FEET_PER_MILE : 0

  switch (field) {
    case 'totalCarbonKgPerMi':
      return lengthMi > 0 ? (Number(totals?.totalCarbonKg) || 0) / lengthMi : 0
    case 'costUsdPerMi':
      return lengthMi > 0 ? (Number(totals?.costUsd) || 0) / lengthMi : 0
    default:
      return Number(totals?.[field]) || 0
  }
}

function normalize(value, values) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return 0
  return (value - min) / (max - min)
}

function scoreField(corridorResults, corridor, field) {
  const values = corridorResults.map((item) => deriveTotalField(item.totals, field))
  const value = deriveTotalField(corridor.totals, field)
  const normalized = normalize(value, values)
  return LOWER_IS_BETTER.has(field) ? normalized : 1 - normalized
}

function pickBest(corridorResults, field, lower = true) {
  return [...corridorResults].sort((a, b) => {
    const aVal = deriveTotalField(a.totals, field)
    const bVal = deriveTotalField(b.totals, field)
    return lower ? aVal - bVal : bVal - aVal
  })[0]?.id
}

export function buildLensRecommendation(corridorResults, lens = 'planner') {
  if (!corridorResults?.length) return null
  const config = LENS_CONFIG[lens] || LENS_CONFIG.planner

  const scored = corridorResults.map((corridor) => {
    const composite = Object.entries(config.weights).reduce(
      (sum, [field, weight]) => sum + (scoreField(corridorResults, corridor, field) * weight),
      0,
    )
    return { corridor, composite: round(composite) }
  })

  const bestCorridor = [...scored].sort((a, b) => a.composite - b.composite)[0]?.corridor
  const bestOverallId = bestCorridor?.id

  const recommendation = {
    bestOverallId,
    lowestCarbonId: pickBest(corridorResults, 'totalCarbonKg', true),
    lowestCostId: pickBest(corridorResults, 'costUsd', true),
    lowestCostPerMiId: pickBest(corridorResults, 'costUsdPerMi', true),
    fastestId: pickBest(corridorResults, 'durationDays', true),
    lowestDisruptionId: pickBest(corridorResults, 'disruptionScore', true),
    lowestConstructionPenaltyId: pickBest(corridorResults, 'constructionCarbonPenaltyScore', true),
    highestCommunityBenefitId: pickBest(corridorResults, 'communityBenefitScore', false),
    highestBuildabilityId: pickBest(corridorResults, 'buildabilityScore', false),
    badges: [],
    summary: '',
  }

  const strengths = config.badges
    .filter((badge) => badge.field !== 'bestOverallId')
    .filter((badge) => recommendation[badge.field] === bestOverallId)
    .map((badge) => badge.summary)

  const bestName = bestCorridor?.name || 'This corridor'
  recommendation.summary =
    strengths.length > 0
      ? `${bestName} is the strongest ${lens} choice, leading in ${strengths.join(' and ')}.`
      : `${bestName} is the strongest ${lens} choice based on the current weighting of carbon, cost, schedule, disruption, and benefit for this audience.`

  recommendation.badges = config.badges.map((badge) => ({
    label: badge.label,
    color: badge.color,
    id: recommendation[badge.field],
  }))

  return recommendation
}
