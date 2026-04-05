/**
 * transitConstants.js — All editable factors, presets, and weights for the analysis engine.
 * Change values here to tune results without touching engine logic.
 */

// ─── Concrete Mix Presets ───────────────────────────────────────────────────
// kgCO2e per cubic yard and cost per cubic yard by mix type

export const MIX_PRESETS = {
  standard_15_scm: {
    label: 'Standard (15% SCM)',
    concreteKgCo2ePerCy: 290,
    concreteCostPerCy: 165,
  },
  fiber_mix_15_scm: {
    label: 'Fiber Mix (15% SCM)',
    concreteKgCo2ePerCy: 275,
    concreteCostPerCy: 175,
  },
  low_carbon_35_scm: {
    label: 'Low-Carbon (35% SCM)',
    concreteKgCo2ePerCy: 210,
    concreteCostPerCy: 180,
  },
}

// ─── Section Family Presets ─────────────────────────────────────────────────

export const SECTION_FAMILIES = {
  conventional_rc: {
    label: 'Conventional Reinforced Concrete',
    slabThicknessIn: 14,
    slabWidthFt: 10,
    concreteMix: 'standard_15_scm',
    scmPct: 15,
    rebarLbPerCy: 240,
    steelFiberLbPerCy: 0,
    targetServiceLifeYears: 40,
    baseProductionLfPerDay: 35,
    maintenanceBaseRisk: 4,
    durabilityHigh: false,
  },
  fiber_reduced: {
    label: 'Fiber Reinforced Concrete (FRC)',
    slabThicknessIn: 12,
    slabWidthFt: 10,
    concreteMix: 'fiber_mix_15_scm',
    scmPct: 15,
    rebarLbPerCy: 0,
    steelFiberLbPerCy: 60,
    targetServiceLifeYears: 40,
    baseProductionLfPerDay: 55,
    maintenanceBaseRisk: 3,
    durabilityHigh: true,
  },
  low_cement_rc: {
    label: 'Low-Cement SCM-Rich Slab',
    slabThicknessIn: 14,
    slabWidthFt: 10,
    concreteMix: 'low_carbon_35_scm',
    scmPct: 35,
    rebarLbPerCy: 240,
    steelFiberLbPerCy: 0,
    targetServiceLifeYears: 40,
    baseProductionLfPerDay: 32,
    maintenanceBaseRisk: 5,
    durabilityHigh: false,
  },
}

// ─── Material Unit Rates ────────────────────────────────────────────────────

export const MATERIAL_RATES = {
  rebarKgCo2ePerLb: 0.90,        // ICE v3: 1,990 kg/t / 2,205 lb/t = 0.903
  rebarCostPerLb: 0.95,           // RS Means 2024
  steelFiberKgCo2ePerLb: 1.03,    // ICE v3 wire rod: 2,270 kg/t / 2,205 lb/t = 1.030
  steelFiberCostPerLb: 1.45,      // Industry avg hooked-end macro fiber
  ppFiberKgCo2ePerLb: 0.91,       // BarChip 48 EPD (S-P-02054): 2,000 kg/t / 2,205 lb/t
  ppFiberCostPerLb: 0.85,         // Industry avg PP macro fiber
}

// ─── Construction-Phase Emission Rates ──────────────────────────────────────
// Traffic delay + detour + equipment emissions during construction

export const CONSTRUCTION_PHASE_RATES = {
  idleKgCo2PerVehicleHour: 8.16,   // EPA: avg passenger vehicle idle emission
  detourExtraMiles: 1.5,            // FHWA: typical urban arterial detour
  detourKgCo2PerMile: 0.404,        // EPA: avg passenger vehicle per mile
  avgDelayHoursPerVehicle: 0.05,     // FHWA: 3 minutes average work-zone delay
  equipmentKgCo2PerDay: 2500,        // Industry avg for LRT construction equipment
  affectedTrafficShareBase: 0.22,    // only part of corridor traffic is directly exposed to work-zone effects
  minAffectedTrafficShare: 0.10,
  maxAffectedTrafficShare: 0.50,
  detourShareOfAffectedTraffic: 0.45, // only a subset of affected traffic takes the modeled detour
  minDetourTrafficShare: 0.04,
  maxDetourTrafficShare: 0.22,
  stagedConstructionBaseFactor: 0.9, // staged / lane-by-lane work reduces the share exposed each day
  minStagedConstructionFactor: 0.65,
  maxStagedConstructionFactor: 1.05,
  contextTrafficShareMultiplier: {
    urban_core: 1.15,
    urban_arterial: 1.0,
    suburban: 0.92,
    industrial: 0.88,
  },
  segmentTrafficShareMultiplier: {
    at_grade_median: 1.0,
    embedded_urban_street: 1.12,
    station_zone: 1.08,
    elevated_crossing: 0.85,
    bridge_approach: 0.95,
  },
  contextStageMultiplier: {
    urban_core: 1.08,
    urban_arterial: 1.0,
    suburban: 0.94,
    industrial: 0.9,
  },
  segmentStageMultiplier: {
    at_grade_median: 0.88,
    embedded_urban_street: 1.0,
    station_zone: 0.95,
    elevated_crossing: 0.78,
    bridge_approach: 0.9,
  },
  constrainedRowShareAdd: 0.08,
  trafficSensitivityShareAdd: 0.08,
  urbanCoreShareAdd: 0.05,
  highIntersectionShareAdd: 0.03,
  moderateFloodShareAdd: 0.02,
  highFloodShareAdd: 0.04,
  nightWorkShareReduction: 0.05,
  constrainedRowStageAdd: 0.04,
  urbanCoreStageAdd: 0.03,
  nightWorkStageReduction: 0.05,
  constrainedRowDetourShareAdd: 0.03,
  urbanCoreDetourShareAdd: 0.02,
  structureDetourShareAdd: 0.015,
  nightWorkDetourReduction: 0.01,
}

// ─── Segment Type Factors ───────────────────────────────────────────────────
// Each segment type has trackwork carbon/cost, production factor, disruption base, and buildability base

export const SEGMENT_TYPES = {
  at_grade_median: {
    label: 'At-Grade Median Running',
    trackworkKgCo2ePerLf: 18,
    installCostPerLf: 320,
    productionFactor: 1.0,
    disruptionBase: 3,
    buildabilityBase: 8,
  },
  embedded_urban_street: {
    label: 'Embedded Urban Street Section',
    trackworkKgCo2ePerLf: 22,
    installCostPerLf: 410,
    productionFactor: 0.75,
    disruptionBase: 5,
    buildabilityBase: 6,
  },
  station_zone: {
    label: 'Station Zone',
    trackworkKgCo2ePerLf: 28,
    installCostPerLf: 520,
    productionFactor: 0.60,
    disruptionBase: 4,
    buildabilityBase: 7,
  },
  elevated_crossing: {
    label: 'Elevated Crossing',
    trackworkKgCo2ePerLf: 45,
    installCostPerLf: 890,
    productionFactor: 0.40,
    disruptionBase: 6,
    buildabilityBase: 5,
  },
  bridge_approach: {
    label: 'Bridge Approach',
    trackworkKgCo2ePerLf: 55,
    installCostPerLf: 1100,
    productionFactor: 0.35,
    disruptionBase: 7,
    buildabilityBase: 4,
  },
}

// ─── Context Multipliers ────────────────────────────────────────────────────
// Applied to install cost and production rate based on corridor context

export const CONTEXT_MULTIPLIERS = {
  urban_core: { costMultiplier: 0.20, productivityFactor: 0.80 },
  urban_arterial: { costMultiplier: 0.10, productivityFactor: 0.90 },
  suburban: { costMultiplier: 0.0, productivityFactor: 1.0 },
  industrial: { costMultiplier: 0.05, productivityFactor: 0.95 },
}

// ─── Disruption Adjustment Thresholds ───────────────────────────────────────

export const DISRUPTION_THRESHOLDS = {
  trafficAadtHigh: 25000,
  intersectionDensityHigh: 8, // per mile
  utilityDensityHigh: true,   // boolean flag from input
  trafficSensitivityHigh: true,
}

// ─── Community Benefit Weights ──────────────────────────────────────────────
// Each factor maps a 1-10 input to a weighted contribution

export const COMMUNITY_WEIGHTS = {
  populationCatchment: 0.25,
  jobCatchment: 0.20,
  zeroCarHouseholdsPct: 0.20,
  transferConnectivity: 0.20,
  activityNodeImportance: 0.15,
}

export const CONSTRUCTION_PENALTY_WEIGHTS = {
  structureDemand: 0.35,
  floodDrainage: 0.20,
  rowStaging: 0.20,
  sectionPremium: 0.15,
  utilityUrbanComplexity: 0.10,
}

export const CONSTRUCTION_STRUCTURE_SCORES = {
  at_grade_median: 2.5,
  embedded_urban_street: 5.0,
  station_zone: 4.5,
  elevated_crossing: 8.5,
  bridge_approach: 9.0,
}

export const CONSTRUCTION_SECTION_PREMIUM_SCORES = {
  conventional_rc: 5.0,
  fiber_reduced: 3.5,
  low_cement_rc: 2.5,
}

// ─── Composite Score Weights ────────────────────────────────────────────────
// Lower composite = better. Community benefit is subtracted (credit).

export const COMPOSITE_WEIGHTS = {
  carbon: 0.25,
  cost: 0.15,
  duration: 0.15,
  disruption: 0.15,
  maintenance: 0.10,
  buildability: 0.10,   // penalty = 11 - buildabilityScore
  communityBenefit: 0.10, // subtracted as credit
}
