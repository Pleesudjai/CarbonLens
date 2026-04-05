# Feature Spec: Construction-Phase Carbon Emissions
Date: 2026-04-04
Layer: backend-module | frontend

## What We're Building

Add construction-phase carbon (traffic delay + detour + equipment emissions) to the analysis engine output, computed from each segment's `durationDays` and `trafficAadt`. This reveals the hidden 84% of FRC's carbon benefit that the current material-only formula misses.

## Why This Matters

The current engine only counts embodied material carbon (concrete + rebar + fiber + trackwork). But construction itself generates massive CO2 from:
- **Traffic idling** at work zones (15,000 vehicles x 3 min/day avg delay)
- **Traffic detours** (1.5 extra miles per detoured trip)
- **Construction equipment** (excavators, trucks, pavers, generators)

FRC builds 48% faster (121 vs 231 days/mile), which eliminates ~1,948 tonnes/mile of construction-phase carbon. This is 5x larger than the 380-tonne embodied savings.

## Inputs / Outputs

- Input: existing segment `factors.trafficAadt` and computed `metrics.durationDays` (already in the engine)
- Output: new fields in segment metrics and corridor totals:
  - `constructionPhaseCarbonKg` — total construction-phase emissions
  - `constructionPhaseBreakdown` — { trafficIdle, trafficDetour, equipment }
  - `totalCarbonKg` — embodied + construction phase combined
  - `totalCarbonSavingsVsRc` — comparison against conventional RC baseline

## Construction-Phase Carbon Formula

### Per Segment

```
avgDelayHoursPerVehicle = 0.05  (3 minutes average delay)
detourExtraMiles = 1.5

trafficIdlePerDay = trafficAadt × avgDelayHoursPerVehicle × 8.16 kg CO2/hr
trafficDetourPerDay = trafficAadt × detourExtraMiles × 0.404 kg CO2/mile
equipmentPerDay = 2500 kg CO2/day (flat rate for typical light-rail construction)

constructionCarbonPerDay = trafficIdlePerDay + trafficDetourPerDay + equipmentPerDay
constructionPhaseCarbonKg = constructionCarbonPerDay × durationDays
```

### Per Corridor (sum of segments)

```
totalConstructionPhaseCarbonKg = sum(segment.constructionPhaseCarbonKg)
totalCarbonKg = carbonKgCo2e (embodied) + totalConstructionPhaseCarbonKg
```

### Constants

| Constant | Value | Source |
|----------|-------|--------|
| Idle emission rate | 8.16 kg CO2 per 1,000 idle-hours | EPA vehicle emission factors |
| Detour emission rate | 0.404 kg CO2 per mile | EPA avg passenger vehicle |
| Avg delay per vehicle | 0.05 hours (3 min) | FHWA work zone estimates |
| Detour extra miles | 1.5 miles | FHWA typical urban arterial |
| Equipment per day | 2,500 kg CO2 | Industry avg for LRT construction |
| Affected traffic fraction | 100% of AADT | Conservative (uses segment's own AADT) |

## Material Rate Corrections (from carbon-emission-factors.md cross-check)

These discrepancies were identified during the fact-check against ICE Database v3.0 and must be fixed in the same update:

| Constant | Current | Corrected | Source |
|----------|---------|-----------|--------|
| `rebarKgCo2ePerLb` | 0.82 | **0.90** | ICE v3: 1,990 kg/t / 2,205 lb/t = 0.903 |
| `steelFiberKgCo2ePerLb` | 1.10 | **1.03** | ICE v3 wire rod: 2,270 kg/t / 2,205 lb/t = 1.030 |
| `ppFiberKgCo2ePerLb` | (missing) | **0.91** | BarChip 48 EPD (S-P-02054): 2,000 kg/t / 2,205 lb/t |
| `ppFiberCostPerLb` | (missing) | **0.85** | Industry average for PP macro fiber |

These corrections affect all embodied carbon calculations. The rebar rate increases (+10%), the steel fiber rate decreases (-6%), and PP fiber support is added for future section families.

## Files to Create or Edit

### Backend
- `src/backend/analysis/transitConstants.js` — add `CONSTRUCTION_PHASE_RATES` constant block + fix `MATERIAL_RATES` (rebar, steel fiber, add PP fiber)
- `src/backend/analysis/transitCarbonEngine.js` — add `calculateConstructionPhaseCarbon()` function, extend `calculateSegmentMetrics()` return, extend `aggregateCorridor()` totals

### Frontend
- `src/frontend/src/components/ResultsSummaryCards.jsx` — add construction-phase carbon and total carbon rows
- `src/frontend/src/components/MapStatsOverlay.jsx` — show total carbon (embodied + construction)
- `src/frontend/src/components/SectionTradeoffCard.jsx` — add insight about construction-phase savings
- `src/frontend/src/components/CorridorComparisonChart.jsx` — add stacked bar showing embodied vs construction-phase

## Implementation Steps

0. [ ] Fix `MATERIAL_RATES` in `transitConstants.js`: rebar 0.82→0.90, steel fiber 1.10→1.03, add ppFiber 0.91/0.85
1. [ ] Add `CONSTRUCTION_PHASE_RATES` to `transitConstants.js`
2. [ ] Add `calculateConstructionPhaseCarbon(segment, durationDays)` to `transitCarbonEngine.js`
3. [ ] Extend `calculateSegmentMetrics()` to include construction-phase carbon in return
4. [ ] Extend `aggregateCorridor()` to sum construction-phase carbon in totals
5. [ ] Add `totalCarbonKg` (embodied + construction) to corridor totals
6. [ ] Update `ResultsSummaryCards.jsx` — add construction-phase and total carbon rows
7. [ ] Update `MapStatsOverlay.jsx` — show total carbon
8. [ ] Update `SectionTradeoffCard.jsx` — add construction-phase insight
9. [ ] Update `CorridorComparisonChart.jsx` — stacked bar (embodied vs construction-phase)
10. [ ] Verify with Phoenix preset: FRC total carbon should be ~45% less than RC (not just 34%)

## Expected Results (Phoenix Preset, Per Mile)

| Metric | Conventional RC | Steel-Fiber FRC | Savings |
|--------|----------------|-----------------|---------|
| Embodied carbon | 1,111 t | 731 t | 380 t (34%) |
| Construction-phase carbon | 4,091 t | 2,143 t | 1,948 t (48%) |
| **Total carbon** | **5,202 t** | **2,874 t** | **2,328 t (45%)** |

## Demo Test

1. Click Analyze with Phoenix preset
2. Results table shows three carbon rows: Embodied, Construction Phase, Total
3. FRC corridor shows ~45% total carbon reduction (not just 34%)
4. Bar chart shows stacked bars (green = embodied, amber = construction phase)
5. Section Tradeoffs panel says something like: "Alt B saves 1,948 tonnes of construction-phase CO2 by building 110 fewer days"
6. MapStatsOverlay shows total carbon (embodied + construction)

## Out of Scope

- Real-time traffic data integration (uses segment AADT from presets)
- Equipment-specific emission models (uses flat daily rate)
- Worker commute emissions
- Supply chain transportation emissions
- Scope 2/3 grid electricity emissions
