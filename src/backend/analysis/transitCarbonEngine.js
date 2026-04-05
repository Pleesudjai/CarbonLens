/**
 * transitCarbonEngine.js — Pure deterministic analysis engine.
 * All functions accept plain objects and return plain JSON-safe objects.
 * No external API calls. No side effects.
 */
import {
  MIX_PRESETS,
  SECTION_FAMILIES,
  MATERIAL_RATES,
  SEGMENT_TYPES,
  CONTEXT_MULTIPLIERS,
  DISRUPTION_THRESHOLDS,
  COMMUNITY_WEIGHTS,
  COMPOSITE_WEIGHTS,
  CONSTRUCTION_PENALTY_WEIGHTS,
  CONSTRUCTION_STRUCTURE_SCORES,
  CONSTRUCTION_SECTION_PREMIUM_SCORES,
} from './transitConstants.js'

// ─── Helpers ────────────────────────────────────────────────────────────────

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function round(val, decimals = 1) {
  const f = 10 ** decimals
  return Math.round(val * f) / f
}

function floodPenaltyScore(floodRisk) {
  switch (floodRisk) {
    case 'high':
      return 8.5
    case 'moderate':
      return 5.5
    default:
      return 1.5
  }
}

function rowStagingPenaltyScore(factors) {
  let score = factors.constrainedRow ? 7 : 2
  if (factors.nightWorkOnly) score += 1
  if (factors.trafficSensitivityHigh) score += 1
  if ((factors.trafficAadt || 0) > DISRUPTION_THRESHOLDS.trafficAadtHigh) score += 0.5
  return clamp(score, 1, 10)
}

function utilityUrbanComplexityScore(factors) {
  let score = 2
  if (factors.utilityDensityHigh) score += 4
  if (factors.urbanCore) score += 3
  if ((factors.intersectionDensityPerMi || 0) > DISRUPTION_THRESHOLDS.intersectionDensityHigh) score += 1
  return clamp(score, 1, 10)
}

function constructionPenaltyDrivers(segment, factors) {
  const drivers = []
  if (segment.segmentType === 'elevated_crossing') drivers.push('elevated_structure')
  if (segment.segmentType === 'bridge_approach') drivers.push('bridge_structure')
  if (segment.segmentType === 'embedded_urban_street') drivers.push('embedded_urban_construction')
  if (factors.floodRisk === 'moderate' || factors.floodRisk === 'high') drivers.push('flood_mitigation')
  if (factors.constrainedRow) drivers.push('constrained_row')
  if (factors.utilityDensityHigh) drivers.push('utility_relocation')
  if (factors.urbanCore) drivers.push('urban_core_staging')
  if (factors.nightWorkOnly) drivers.push('night_work_window')
  return drivers
}

// ─── 1. Expand Section Inputs ───────────────────────────────────────────────

export function expandSectionInputs(segment) {
  const family = SECTION_FAMILIES[segment.sectionFamily] || SECTION_FAMILIES.conventional_rc
  return {
    slabThicknessIn: segment.slabThicknessIn ?? family.slabThicknessIn,
    slabWidthFt: segment.slabWidthFt ?? family.slabWidthFt,
    concreteMix: segment.concreteMix ?? family.concreteMix,
    scmPct: segment.scmPct ?? family.scmPct,
    rebarLbPerCy: segment.rebarLbPerCy ?? family.rebarLbPerCy,
    steelFiberLbPerCy: segment.steelFiberLbPerCy ?? family.steelFiberLbPerCy,
    targetServiceLifeYears: segment.targetServiceLifeYears ?? family.targetServiceLifeYears,
    baseProductionLfPerDay: segment.baseProductionLfPerDay ?? family.baseProductionLfPerDay,
    maintenanceBaseRisk: family.maintenanceBaseRisk,
    durabilityHigh: family.durabilityHigh,
  }
}

// ─── 2. Calculate Segment Quantities ────────────────────────────────────────

export function calculateSegmentQuantities(segment, section) {
  const lengthFt = segment.lengthFt || 0
  const volumeCy = (lengthFt * section.slabWidthFt * (section.slabThicknessIn / 12)) / 27
  const rebarLb = volumeCy * section.rebarLbPerCy
  const steelFiberLb = volumeCy * section.steelFiberLbPerCy
  return { lengthFt, volumeCy: round(volumeCy, 1), rebarLb: round(rebarLb, 0), steelFiberLb: round(steelFiberLb, 0) }
}

// ─── 3. Calculate Segment Metrics ───────────────────────────────────────────

export function calculateSegmentMetrics(segment, section, quantities) {
  const segType = SEGMENT_TYPES[segment.segmentType] || SEGMENT_TYPES.at_grade_median
  const mix = MIX_PRESETS[section.concreteMix] || MIX_PRESETS.standard_15_scm
  const ctx = CONTEXT_MULTIPLIERS[segment.context] || CONTEXT_MULTIPLIERS.suburban
  const factors = segment.factors || {}
  const community = segment.community || {}

  // Carbon
  const concreteCarbon = quantities.volumeCy * mix.concreteKgCo2ePerCy
  const rebarCarbon = quantities.rebarLb * MATERIAL_RATES.rebarKgCo2ePerLb
  const fiberCarbon = quantities.steelFiberLb * MATERIAL_RATES.steelFiberKgCo2ePerLb
  const trackworkCarbon = quantities.lengthFt * segType.trackworkKgCo2ePerLf
  const carbonKgCo2e = round(concreteCarbon + rebarCarbon + fiberCarbon + trackworkCarbon, 0)

  // Cost
  const concreteCost = quantities.volumeCy * mix.concreteCostPerCy
  const rebarCost = quantities.rebarLb * MATERIAL_RATES.rebarCostPerLb
  const fiberCost = quantities.steelFiberLb * MATERIAL_RATES.steelFiberCostPerLb
  const installCost = quantities.lengthFt * segType.installCostPerLf
  const contextPremium = installCost * ctx.costMultiplier
  const costUsd = round(concreteCost + rebarCost + fiberCost + installCost + contextPremium, 0)

  // Duration
  const effectiveProduction = section.baseProductionLfPerDay * segType.productionFactor * ctx.productivityFactor
  const durationDays = round(quantities.lengthFt / Math.max(effectiveProduction, 1), 1)

  // Disruption (1-10, higher = worse)
  let disruption = segType.disruptionBase
  if (factors.trafficAadt > DISRUPTION_THRESHOLDS.trafficAadtHigh) disruption += 2
  if (factors.intersectionDensityPerMi > DISRUPTION_THRESHOLDS.intersectionDensityHigh) disruption += 1
  if (factors.utilityDensityHigh) disruption += 2
  if (factors.trafficSensitivityHigh) disruption += 2
  if (factors.urbanCore) disruption += 1
  if (factors.nightWorkOnly) disruption += 1
  const disruptionScore = clamp(disruption, 1, 10)

  // Buildability (1-10, higher = better)
  let buildability = segType.buildabilityBase
  if (factors.utilityDensityHigh) buildability -= 2
  if (factors.constrainedRow) buildability -= 2
  if (factors.trafficAadt > DISRUPTION_THRESHOLDS.trafficAadtHigh) buildability -= 1
  if (factors.intersectionDensityPerMi > DISRUPTION_THRESHOLDS.intersectionDensityHigh) buildability -= 1
  if (factors.floodRisk === 'moderate' || factors.floodRisk === 'high') buildability -= 1
  if (factors.urbanCore) buildability -= 1
  const buildabilityScore = clamp(buildability, 1, 10)

  // Community benefit (1-10, higher = better)
  const cw = COMMUNITY_WEIGHTS
  let communityRaw =
    (community.populationCatchment || 0) * cw.populationCatchment +
    (community.jobCatchment || 0) * cw.jobCatchment +
    (community.zeroCarHouseholdsPct || 0) * cw.zeroCarHouseholdsPct +
    (community.transferConnectivity || 0) * cw.transferConnectivity +
    (community.activityNodeImportance || 0) * cw.activityNodeImportance
  if (community.heatExposureHigh) communityRaw -= 1
  if (community.stationTransferStrong) communityRaw += 1
  const communityBenefitScore = clamp(round(communityRaw, 1), 1, 10)

  // Maintenance risk (1-10)
  let maintenance = section.maintenanceBaseRisk
  if (section.targetServiceLifeYears > 40) maintenance += 1
  if (segment.segmentType === 'elevated_crossing') maintenance += 1
  if (section.durabilityHigh) maintenance -= 1
  const maintenanceRiskScore = clamp(maintenance, 1, 10)

  // Construction carbon penalty (1-10, higher = more structurally carbon-heavy)
  const constructionComponents = {
    structureDemand: CONSTRUCTION_STRUCTURE_SCORES[segment.segmentType] ?? 4,
    floodDrainage: floodPenaltyScore(factors.floodRisk),
    rowStaging: rowStagingPenaltyScore(factors),
    sectionPremium: CONSTRUCTION_SECTION_PREMIUM_SCORES[segment.sectionFamily] ?? 4,
    utilityUrbanComplexity: utilityUrbanComplexityScore(factors),
  }
  const cpw = CONSTRUCTION_PENALTY_WEIGHTS
  const constructionCarbonPenaltyScore = clamp(round(
    constructionComponents.structureDemand * cpw.structureDemand +
    constructionComponents.floodDrainage * cpw.floodDrainage +
    constructionComponents.rowStaging * cpw.rowStaging +
    constructionComponents.sectionPremium * cpw.sectionPremium +
    constructionComponents.utilityUrbanComplexity * cpw.utilityUrbanComplexity,
    1,
  ), 1, 10)

  return {
    carbonKgCo2e,
    costUsd,
    durationDays,
    disruptionScore,
    buildabilityScore,
    communityBenefitScore,
    maintenanceRiskScore,
    constructionCarbonPenaltyScore,
    constructionCarbonPenalty: {
      drivers: constructionPenaltyDrivers(segment, factors),
      components: constructionComponents,
    },
    carbonBreakdown: {
      concrete: round(concreteCarbon, 0),
      rebar: round(rebarCarbon, 0),
      fiber: round(fiberCarbon, 0),
      trackwork: round(trackworkCarbon, 0),
    },
  }
}

// ─── 4. Aggregate Corridor ──────────────────────────────────────────────────

export function aggregateCorridor(corridor) {
  const segmentResults = corridor.segments.map((seg) => {
    const section = expandSectionInputs(seg)
    const quantities = calculateSegmentQuantities(seg, section)
    const metrics = calculateSegmentMetrics(seg, section, quantities)
    return {
      id: seg.id,
      label: seg.label,
      segmentType: seg.segmentType,
      sectionFamily: seg.sectionFamily,
      context: seg.context,
      factors: seg.factors || {},
      liveContext: seg.liveContext || null,
      lengthFt: quantities.lengthFt,
      quantities,
      metrics,
    }
  })

  const totalLengthFt = segmentResults.reduce((s, r) => s + r.lengthFt, 0)
  const carbonKgCo2e = segmentResults.reduce((s, r) => s + r.metrics.carbonKgCo2e, 0)
  const costUsd = segmentResults.reduce((s, r) => s + r.metrics.costUsd, 0)
  const durationDays = round(segmentResults.reduce((s, r) => s + r.metrics.durationDays, 0), 1)

  // Weighted averages for scores (weighted by segment length)
  const wAvg = (field) => {
    if (totalLengthFt === 0) return 0
    const sum = segmentResults.reduce((s, r) => s + r.metrics[field] * r.lengthFt, 0)
    return round(sum / totalLengthFt, 1)
  }

  return {
    id: corridor.id,
    name: corridor.name,
    description: corridor.description || '',
    totals: {
      lengthFt: totalLengthFt,
      carbonKgCo2e,
      carbonKgCo2ePerLf: totalLengthFt > 0 ? round(carbonKgCo2e / totalLengthFt, 1) : 0,
      costUsd,
      durationDays,
      disruptionScore: wAvg('disruptionScore'),
      maintenanceRiskScore: wAvg('maintenanceRiskScore'),
      buildabilityScore: wAvg('buildabilityScore'),
      communityBenefitScore: wAvg('communityBenefitScore'),
      constructionCarbonPenaltyScore: wAvg('constructionCarbonPenaltyScore'),
      compositeScore: 0, // filled after ranking
    },
    segmentResults,
  }
}

// ─── 5. Rank Corridors ──────────────────────────────────────────────────────

export function rankCorridors(corridorResults) {
  if (corridorResults.length === 0) return corridorResults

  // Find min/max for normalization
  const vals = (field) => corridorResults.map((c) => c.totals[field])
  const normalize = (val, arr) => {
    const min = Math.min(...arr)
    const max = Math.max(...arr)
    return max === min ? 0 : (val - min) / (max - min)
  }

  const carbonVals = vals('carbonKgCo2e')
  const costVals = vals('costUsd')
  const durationVals = vals('durationDays')
  const disruptionVals = vals('disruptionScore')
  const maintenanceVals = vals('maintenanceRiskScore')
  const buildabilityVals = vals('buildabilityScore')
  const communityVals = vals('communityBenefitScore')

  const w = COMPOSITE_WEIGHTS

  corridorResults.forEach((c) => {
    const t = c.totals
    const composite =
      normalize(t.carbonKgCo2e, carbonVals) * w.carbon +
      normalize(t.costUsd, costVals) * w.cost +
      normalize(t.durationDays, durationVals) * w.duration +
      normalize(t.disruptionScore, disruptionVals) * w.disruption +
      normalize(t.maintenanceRiskScore, maintenanceVals) * w.maintenance +
      normalize(11 - t.buildabilityScore, buildabilityVals.map((v) => 11 - v)) * w.buildability -
      normalize(t.communityBenefitScore, communityVals) * w.communityBenefit

    t.compositeScore = round(composite, 3)
  })

  return corridorResults
}

// ─── 6. Generate Recommendation ─────────────────────────────────────────────

function generateRecommendation(corridorResults) {
  const best = (field, lower = true) => {
    const sorted = [...corridorResults].sort((a, b) =>
      lower ? a.totals[field] - b.totals[field] : b.totals[field] - a.totals[field]
    )
    return sorted[0]?.id
  }

  const bestOverallId = best('compositeScore')
  const lowestCarbonId = best('carbonKgCo2e')
  const lowestCostId = best('costUsd')
  const fastestId = best('durationDays')
  const lowestDisruptionId = best('disruptionScore')
  const lowestConstructionPenaltyId = best('constructionCarbonPenaltyScore')
  const highestCommunityBenefitId = best('communityBenefitScore', false)

  const bestCorridor = corridorResults.find((c) => c.id === bestOverallId)
  const bestName = bestCorridor?.name || 'Unknown'

  // Build a plain-language summary
  const strengths = []
  if (bestOverallId === lowestCarbonId) strengths.push('lowest embodied carbon')
  if (bestOverallId === lowestCostId) strengths.push('lowest cost')
  if (bestOverallId === fastestId) strengths.push('fastest construction')
  if (bestOverallId === lowestDisruptionId) strengths.push('lowest disruption')
  if (bestOverallId === lowestConstructionPenaltyId) strengths.push('lowest construction carbon penalty')
  if (bestOverallId === highestCommunityBenefitId) strengths.push('highest community benefit')

  let summary
  if (strengths.length > 0) {
    summary = `${bestName} offers the best overall balance, leading in ${strengths.join(' and ')}.`
  } else {
    summary = `${bestName} offers the best overall balance across carbon, cost, schedule, disruption, and community benefit — even though no single metric is best-in-class.`
  }

  return {
    bestOverallId,
    lowestCarbonId,
    lowestCostId,
    fastestId,
    lowestDisruptionId,
    lowestConstructionPenaltyId,
    highestCommunityBenefitId,
    summary,
  }
}

// ─── 7. Main Entry Point ────────────────────────────────────────────────────

/**
 * Analyze a full scenario with multiple corridor alternatives.
 * @param {{ cityId: string, projectName?: string, planningGoal?: string, corridors: Array }} scenario
 * @returns {object} Full analysis result matching the spec's required shape
 */
export function analyzeScenario(scenario) {
  const corridors = scenario.corridors || []

  // Aggregate each corridor
  let corridorResults = corridors.map(aggregateCorridor)

  // Rank and assign composite scores
  corridorResults = rankCorridors(corridorResults)

  // Generate recommendation
  const recommendation = generateRecommendation(corridorResults)

  return {
    meta: {
      cityId: scenario.cityId || 'unknown',
      projectName: scenario.projectName || 'Untitled Scenario',
      planningGoal: scenario.planningGoal || '',
      units: {
        carbon: 'kgCO2e',
        cost: 'USD',
        length: 'ft',
        duration: 'days',
      },
    },
    corridorResults,
    recommendation,
  }
}
