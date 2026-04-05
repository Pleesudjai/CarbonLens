# Carbon Calculation Cross-Check

Updated: 2026-04-04

Purpose:
- confirm the current CarbonLens implementation against:
  - `specs/carbon-emission-factors.md`
  - `specs/construction-phase-carbon.md`

## Bottom Line

The current engine follows the intended carbon calculation direction from your specs.

What is aligned in code:
- `rebarKgCo2ePerLb = 0.90`
- `steelFiberKgCo2ePerLb = 1.03`
- `ppFiberKgCo2ePerLb = 0.91`
- `ppFiberCostPerLb = 0.85`
- `standard_15_scm = 290 kg CO2e / cy`
- `fiber_mix_15_scm = 275 kg CO2e / cy`
- `low_carbon_35_scm = 210 kg CO2e / cy`
- construction-phase carbon from:
  - traffic idle
  - traffic detour
  - equipment
- `totalCarbonKg = embodied + construction-phase`

## Engine Files Checked

- `src/backend/analysis/transitConstants.js`
- `src/backend/analysis/transitCarbonEngine.js`

## Current Carbon Views In The Demo

The demo now exposes all 3 carbon layers clearly:

- `Embodied Carbon`
- `Construction-Phase Carbon`
- `Total Carbon`

Visible in:

- `Corridor Comparison`
- `MapStatsOverlay`
- `Total Carbon Breakdown`
- `Structure Carbon Comparison`
- `Section Tradeoffs`

## Key Interpretation Rule

- `Embodied Carbon` = material carbon only
- `Construction-Phase Carbon` = delay + detour + equipment proxy
- `Total Carbon` = embodied + construction-phase

## What Was Cross-Checked Successfully

### Against `specs/carbon-emission-factors.md`

- corrected steel and fiber factors are being used in code
- the FRC story is being presented as:
  - thinner slab
  - less rebar
  - steel-fiber substitution
  - lower embodied carbon
- the demo now also surfaces the larger schedule-driven carbon story through construction-phase carbon

### Against `specs/construction-phase-carbon.md`

- `constructionPhaseCarbonKg` is implemented
- `constructionPhaseBreakdown` is implemented
- `totalCarbonKg` is implemented
- UI rows and charts are implemented
- map summary is implemented
- structure-level comparison is implemented

## Known Doc Gaps

The implementation is ahead of some older text in the original spec files.

Main gaps:
- `specs/construction-phase-carbon.md` is now refreshed, but older notes elsewhere may still describe construction-phase carbon as future work
- `specs/carbon-emission-factors.md` still contains legacy wording and encoding artifacts in places
- some older sections still talk about embodied-only reporting, which is no longer true in the demo

## Recommended Use

For the demo and pitch, trust the current implementation plus this cross-check note over older stale wording in legacy sections of the large factor doc.
