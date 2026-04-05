# Feature Spec: Construction-Phase Carbon Emissions
Date: 2026-04-04
Layer: backend-module | frontend

## What We're Building

Add construction-phase carbon (traffic delay + detour + equipment emissions) to the analysis engine output, computed from each segment's `durationDays`, `trafficAadt`, and live corridor context.

This is now implemented in the current CarbonLens build.

## Why This Matters

Embodied carbon alone does not tell the full RC vs FRC story.

Construction itself generates major CO2 from:
- traffic idling at work zones
- traffic detours
- construction equipment

Because FRC builds faster, it can reduce not only material carbon, but also community-facing construction emissions.

The current model also fixes the earlier overstatement problem where full `AADT` was effectively counted every day. It now uses:
- an `affected traffic share`
- a `staged construction factor`
- a `corridor type factor` based on context + segment type

## Inputs / Outputs

- Input:
  - existing segment `factors.trafficAadt`
  - live / editor context such as `factors.constrainedRow`, `factors.trafficSensitivityHigh`, `factors.urbanCore`, `factors.intersectionDensityPerMi`, `factors.floodRisk`, `factors.nightWorkOnly`
  - segment `context`
  - segment `segmentType`
  - computed `metrics.durationDays`
- Output:
  - `constructionPhaseCarbonKg`
  - `constructionPhaseBreakdown`
  - `constructionPhaseAssumptions`
  - `totalCarbonKg`

## Construction-Phase Carbon Formula

### Per Segment

```text
affectedTrafficShare =
  clamp(
    affectedTrafficShareBase x corridorTypeTrafficMultiplier
    + ROW / traffic-sensitive / urban-core / flood / intersection adjustments
    - night-work reduction,
    0.10,
    0.50
  )

stagedConstructionFactor =
  clamp(
    stagedConstructionBaseFactor
    x segmentStageMultiplier
    x contextStageMultiplier
    + constrained-ROW / urban-core adjustments
    - night-work reduction,
    0.65,
    1.05
  )

detourTrafficShare =
  clamp(
    affectedTrafficShare x 0.45
    + constrained-ROW / urban-core / structure adjustments
    - night-work reduction,
    0.04,
    0.22
  )

affectedTrafficAadt = trafficAadt x affectedTrafficShare x stagedConstructionFactor
detourTrafficAadt = trafficAadt x detourTrafficShare x stagedConstructionFactor

avgDelayHoursPerVehicle = 0.05
detourExtraMiles = 1.5

trafficIdlePerDay = affectedTrafficAadt x avgDelayHoursPerVehicle x 8.16 kg CO2 per vehicle-hour
trafficDetourPerDay = detourTrafficAadt x detourExtraMiles x 0.404 kg CO2 per mile
equipmentPerDay = 2500 kg CO2 per day

constructionCarbonPerDay = trafficIdlePerDay + trafficDetourPerDay + equipmentPerDay
constructionPhaseCarbonKg = constructionCarbonPerDay x durationDays
```

### Per Corridor

```text
totalConstructionPhaseCarbonKg = sum(segment.constructionPhaseCarbonKg)
totalCarbonKg = embodiedCarbonKg + totalConstructionPhaseCarbonKg
```

## Constants

| Constant | Value | Source |
|----------|-------|--------|
| Idle emission rate | 8.16 kg CO2 per vehicle-hour | EPA vehicle emission factors |
| Detour emission rate | 0.404 kg CO2 per mile | EPA average passenger vehicle |
| Avg delay per affected vehicle | 0.05 hours (3 min) | FHWA work-zone estimate |
| Detour extra miles | 1.5 miles | FHWA typical urban arterial |
| Equipment per day | 2,500 kg CO2 | Conceptual LRT construction average |
| Affected traffic share base | 22% | Calibrated planning assumption |
| Affected traffic share range | 10% - 50% | Calibrated planning range |
| Staged construction factor range | 0.65 - 1.05 | Corridor staging calibration |

## Material Rate Corrections Cross-Checked From `carbon-emission-factors.md`

These are the values the current engine now uses:

| Constant | Implemented Value |
|----------|-------------------|
| `rebarKgCo2ePerLb` | `0.90` |
| `steelFiberKgCo2ePerLb` | `1.03` |
| `ppFiberKgCo2ePerLb` | `0.91` |
| `ppFiberCostPerLb` | `0.85` |

## Implemented Files

### Backend
- `src/backend/analysis/transitConstants.js`
- `src/backend/analysis/transitCarbonEngine.js`

### Frontend
- `src/frontend/src/components/ResultsSummaryCards.jsx`
- `src/frontend/src/components/MapStatsOverlay.jsx`
- `src/frontend/src/components/SectionTradeoffCard.jsx`
- `src/frontend/src/components/CorridorComparisonChart.jsx`
- `src/frontend/src/components/SegmentBreakdownTable.jsx`

## Implementation Status

0. [x] Fix material rates in `transitConstants.js`
1. [x] Add `CONSTRUCTION_PHASE_RATES`
2. [x] Add `calculateConstructionPhaseCarbon()`
3. [x] Extend segment metrics with construction-phase carbon
4. [x] Extend corridor totals with construction-phase carbon
5. [x] Add `totalCarbonKg`
6. [x] Show embodied, construction-phase, and total carbon in results
7. [x] Show total carbon in the map stats overlay
8. [x] Add construction-phase insight in `Section Tradeoffs`
9. [x] Add stacked embodied vs construction chart
10. [x] Add structure-level carbon comparison view

## Expected Interpretation

For RC vs FRC:
- `Embodied Carbon` explains the material savings
- `Construction-Phase Carbon` explains the schedule-driven savings and traffic-exposure assumptions
- `Total Carbon` is the judge-facing number for the combined story

For same-section corridors with different totals:
- same `Material Carbon / mile` is expected if the slab recipe is the same
- large differences usually come from `During-Build Carbon / mile`
- those differences now come from a more believable subset of affected traffic, not the old full-AADT assumption

## Demo Test

1. Click `Analyze Corridors`
2. Confirm `Corridor Comparison` shows:
   - `Embodied Carbon`
   - `Construction-Phase Carbon`
   - `Total Carbon`
3. Confirm `Total Carbon Breakdown` shows stacked bars
4. Confirm `Structure Carbon Comparison` shows each segment with:
   - structure type
   - section family
   - embodied carbon
   - construction-phase carbon
   - total carbon
5. Confirm `Section Tradeoffs` explains the RC vs FRC savings story in plain language

## Out Of Scope

- real-time traffic feeds
- equipment-specific duty-cycle modeling
- worker commute emissions
- supplier transport emissions
- full lifecycle end-of-life carbon
