# Feature Spec: Transit Corridor Analysis Engine
Date: 2026-04-04
Layer: backend-module

## What We're Building

A deterministic JavaScript analysis module that accepts corridor alternatives plus segment section inputs and derived context snapshots from public datasets, then returns comparable embodied-carbon, cost, duration, disruption, maintenance, buildability, and community-benefit metrics.

This engine is the core of the MVP. It must work without external APIs.

## Inputs / Outputs

- Input: scenario payload with city, corridor alternatives, segments, section families, and derived context/community factors populated from public-data connectors or dataset snapshots
- Output: normalized analysis result with corridor totals, segment breakdowns, ranking, and recommendation metadata

## Files to Create or Edit

- `src/backend/analysis/transitConstants.js` - all editable factors and default presets
- `src/backend/analysis/transitCarbonEngine.js` - pure calculation functions and result assembly
- `src/backend/analysis/transitScenarioPresets.js` - seed data for Phoenix and default corridor alternatives
- `src/backend/analysis/geospatialUtils.js` - shared Turf and H3 helper functions
- `src/backend/analysis/gtfsContext.js` - optional GTFS connectivity helpers

## Chosen Support Libraries

The analysis engine should assume these support libraries are the default path:

- `Turf` for GeoJSON geometry calculations
- `H3` for hex-based catchment and density scoring
- `node-gtfs` for optional stop, route, shape, and connectivity context

Do not invent a second geometry or density framework unless a later spec explicitly requires it.

## Calculation Requirements

The engine must:

1. validate the minimum required fields
2. expand section family presets into full section inputs
3. calculate segment-level quantities
4. calculate segment-level metrics
5. aggregate corridor totals
6. rank corridors by:
   - lowest carbon
   - lowest cost
   - fastest delivery
   - lowest disruption
   - highest community benefit
   - best overall composite score
7. generate plain recommendation metadata that the frontend can render without Claude API support

## Required Result Shape

```json
{
  "meta": {
    "cityId": "phoenix",
    "projectName": "West Phoenix Connector",
    "planningGoal": "lowest carbon with manageable disruption",
    "units": {
      "carbon": "kgCO2e",
      "cost": "USD",
      "length": "ft",
      "duration": "days"
    }
  },
  "corridorResults": [
    {
      "id": "alt-a",
      "name": "Alt A - Median Running",
      "totals": {
        "carbonKgCo2e": 0,
        "carbonKgCo2ePerLf": 0,
        "costUsd": 0,
        "durationDays": 0,
        "disruptionScore": 0,
        "maintenanceRiskScore": 0,
        "buildabilityScore": 0,
        "communityBenefitScore": 0,
        "compositeScore": 0
      },
      "segmentResults": []
    }
  ],
  "recommendation": {
    "bestOverallId": "alt-a",
    "lowestCarbonId": "alt-b",
    "lowestCostId": "alt-c",
    "fastestId": "alt-a",
    "lowestDisruptionId": "alt-b",
    "highestCommunityBenefitId": "alt-c",
    "summary": "Alt A offers the best overall balance for this scenario."
  }
}
```

## Default Presets

### Section Family Presets

Define at least these 3 presets in `transitConstants.js`.

#### conventional_rc

- `slabThicknessIn`: 14
- `slabWidthFt`: 10
- `concreteMix`: `standard_15_scm`
- `scmPct`: 15
- `rebarLbPerCy`: 240
- `steelFiberLbPerCy`: 0
- `targetServiceLifeYears`: 40
- `baseProductionLfPerDay`: 35

#### fiber_reduced

- `slabThicknessIn`: 12
- `slabWidthFt`: 10
- `concreteMix`: `fiber_mix_15_scm`
- `scmPct`: 15
- `rebarLbPerCy`: 40
- `steelFiberLbPerCy`: 60
- `targetServiceLifeYears`: 40
- `baseProductionLfPerDay`: 55

#### low_cement_rc

- `slabThicknessIn`: 14
- `slabWidthFt`: 10
- `concreteMix`: `low_carbon_35_scm`
- `scmPct`: 35
- `rebarLbPerCy`: 240
- `steelFiberLbPerCy`: 0
- `targetServiceLifeYears`: 40
- `baseProductionLfPerDay`: 32

## Formula Details

### Quantity Calculation

- `volumeCy = lengthFt * slabWidthFt * (slabThicknessIn / 12) / 27`
- `rebarLb = volumeCy * rebarLbPerCy`
- `steelFiberLb = volumeCy * steelFiberLbPerCy`

### Carbon Calculation

Use this structure:

- `concreteCarbon = volumeCy * mixPreset.concreteKgCo2ePerCy`
- `rebarCarbon = rebarLb * rebarKgCo2ePerLb`
- `fiberCarbon = steelFiberLb * steelFiberKgCo2ePerLb`
- `trackworkCarbon = lengthFt * segmentType.trackworkKgCo2ePerLf`
- `segmentCarbon = concreteCarbon + rebarCarbon + fiberCarbon + trackworkCarbon`

### Cost Calculation

- `concreteCost = volumeCy * mixPreset.concreteCostPerCy`
- `rebarCost = rebarLb * rebarCostPerLb`
- `fiberCost = steelFiberLb * steelFiberCostPerLb`
- `installCost = lengthFt * segmentType.installCostPerLf`
- `contextPremium = installCost * contextMultiplier`
- `segmentCost = concreteCost + rebarCost + fiberCost + installCost + contextPremium`

### Duration Calculation

- start with `baseProductionLfPerDay`
- multiply by segment type factor
- multiply by context productivity factor
- `durationDays = lengthFt / effectiveProductionLfPerDay`

### Disruption Score

Disruption score is a normalized conceptual score from `1` to `10`.

Start with a segment-type base score, then add:

- `+2` for traffic AADT above corridor threshold
- `+1` for intersection density above threshold
- `+2` for high utility density
- `+2` for high traffic sensitivity
- `+1` for urban core
- `+1` for night work only

Cap the segment score at `10`.

### Buildability Score

Buildability score is a conceptual score from `1` to `10`, where higher is better.

Start with a segment-type base score, then apply:

- subtract `2` for high utility density
- subtract `2` for constrained right-of-way
- subtract `1` for high traffic AADT
- subtract `1` for high intersection density
- subtract `1` for moderate or high flood risk
- subtract `1` for urban-core staging constraints

Clamp the result to `1` through `10`.

### Community Benefit Score

Community benefit score is a conceptual score from `1` to `10`, where higher is better.

Use transparent weighted factors:

- population catchment
- job catchment
- zero-car households percentage
- transfer connectivity score
- activity-node importance

Then apply penalties or adjustments:

- subtract `1` for very high heat exposure
- add `1` for station zones with strong transfer connectivity

Clamp the result to `1` through `10`.

### Maintenance Risk Score

Maintenance risk is a conceptual score from `1` to `10`.

Use:

- base risk by section family
- add `+1` if target service life exceeds preset expectation
- add `+1` for elevated crossings
- subtract `1` if section family durability is marked high

Clamp to `1` through `10`.

### Composite Score

Composite score should be lower-is-better.

Normalize each corridor metric against the corridor set, then apply weights.

Use:

- carbon penalty: `0.25`
- cost penalty: `0.15`
- duration penalty: `0.15`
- disruption penalty: `0.15`
- maintenance penalty: `0.10`
- buildability penalty: `0.10`
- community benefit credit: `0.10`

Use:

- `buildabilityPenalty = 11 - buildabilityScore`
- subtract normalized community benefit from the penalty stack

This keeps the overall score interpretable while still rewarding corridors that serve more people and stronger transit connections.

## Scenario Presets

Seed `transitScenarioPresets.js` with:

- `Phoenix`
- project name placeholder
- 3 corridor alternatives
- 2 to 3 segments per corridor

The preset should showcase:

- a lower-carbon corridor
- a lower-disruption corridor
- a higher-community-benefit corridor
- a best-balance corridor

## Implementation Steps

1. [ ] Create `transitConstants.js` with:
   - mix presets
   - section family presets
   - segment type factors
   - context multipliers
   - buildability factors
   - community benefit factors
   - scoring weights
2. [ ] Create `transitScenarioPresets.js` with one Phoenix starter scenario
3. [ ] Create `geospatialUtils.js` with reusable Turf and H3 helpers
4. [ ] Create `gtfsContext.js` as an optional GTFS context wrapper
5. [ ] Create `transitCarbonEngine.js` with pure functions:
   - `expandSectionInputs`
   - `calculateSegmentQuantities`
   - `calculateSegmentMetrics`
   - `aggregateCorridor`
   - `rankCorridors`
   - `analyzeScenario`
6. [ ] Ensure all functions return plain JSON-safe objects
7. [ ] Add defensive defaults for missing optional fields
8. [ ] Include one plain-language recommendation summary in the result

## Demo Test

Use the Phoenix preset. Expected demo behavior:

- all 3 corridors return stable metric totals
- the thinner fiber-reduced option produces lower concrete volume than the conventional option
- at least one corridor has stronger community benefit because of better population, jobs, or transfer connectivity
- at least one corridor ranks best overall without also being best in every category
- the output object is directly usable by a frontend without additional transformation

## Out of Scope

- real structural analysis
- finite element modeling
- calibration against real agency bid tabs
- GIS-based route generation
- live emissions factors from external APIs
- live traffic, census, or GTFS ingestion
