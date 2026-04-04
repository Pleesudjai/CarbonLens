# Feature Spec: Embodied Carbon Transit Design Assistant
Date: 2026-04-04
Layer: product-reference

## What We're Building

A conceptual planning tool for agencies, consultants, contractors, and community-facing planning teams that compares rail corridor alternatives using embodied carbon, cost, constructability, disruption, service-life logic, and real planning context such as traffic, population, jobs, utilities, and right-of-way constraints.

The product combines two ideas:

1. `Corridor planning`
Choose a city, sketch or configure alternative rail corridors, and compare where and how rail could be built.

2. `Section optimization`
For each corridor segment, compare section families such as conventional reinforced track slab, thinner steel-fiber slab, and lower-cement SCM-rich slab.

## Why This Fits The Hackathon

- It directly addresses `lower carbon footprint` and `measure environmental impact`.
- It avoids being "just another carbon calculator" because it ties carbon to real transit design decisions.
- It feels relevant to Amazon because it overlaps with infrastructure, logistics, mobility access, and scalable planning decisions.
- It is actionable today because the first version can support early planning and option screening.

## Product Positioning

Use this phrasing consistently in copy:

`Google Maps helps communities see the city. Our tool helps planners, agencies, and communities choose the lowest-carbon, most buildable rail corridor together.`

Do not frame the product as if one person alone changes the city.

## Users

### Primary

- transit planners
- civil and structural engineers
- contractor preconstruction teams
- public agencies evaluating early alternatives

### Secondary

- community advisory groups
- university teams and researchers
- sustainability reviewers

## Core Problem

Transit options are often screened on access, cost, and schedule before embodied carbon is visible. Small changes in slab thickness, reinforcement strategy, mix design, and corridor structure type can materially change:

- total embodied carbon
- time to construct
- maintenance burden
- community disruption during construction
- corridor buildability in a constrained street network
- how well the corridor serves population, jobs, and transit-dependent communities

Today, those tradeoffs are usually spread across spreadsheets, plan sheets, and consultant judgment. The MVP should make them visible in one place.

## MVP Scope

The MVP must stay narrow enough for a weekend build.

### Selected Implementation Stack

The team should explicitly use this stack for the MVP:

- `MapLibre GL JS`
- `Terra Draw`
- `Turf`
- `H3`
- `node-gtfs`

Role summary:

- `MapLibre` handles map rendering
- `Terra Draw` handles corridor sketching/editing
- `Turf` handles geometry operations and buffers
- `H3` handles catchment and density scoring
- `node-gtfs` handles optional real transit-feed context

### In Scope

- city preset selector with at least `Phoenix`
- map-based corridor planning canvas
- up to `3` corridor alternatives per scenario
- manual segment definition for each corridor
- section comparison for at least `3` slab/guideway section families
- manual or preset-based input of real planning factors:
  - traffic intensity
  - intersection density
  - utility conflict risk
  - right-of-way width
  - population catchment
  - job catchment
  - transit dependency
  - transfer connectivity
  - heat exposure
- deterministic scoring engine for:
  - embodied carbon
  - conceptual cost
  - conceptual duration
  - disruption risk
  - maintenance/service-life score
  - buildability score
  - community benefit score
- results dashboard with recommendation
- plain-language summary for community and agency review

### Out Of Scope For MVP

- final route optimization using real traffic models
- stamped engineering design checks
- full structural analysis or code compliance checks
- GIS parcel acquisition logic
- live utility database integration
- real EPD ingestion pipeline
- real-time collaboration or accounts

## MVP Workflow

1. User selects a city preset.
2. User enters a project name and planning goal.
3. User creates up to 3 corridor alternatives.
4. User defines segments for each corridor.
5. User assigns a section family and planning-context inputs to each segment.
6. User runs analysis.
7. App compares alternatives and highlights:
   - lowest carbon
   - lowest cost
   - shortest duration
   - highest community benefit
   - best balanced option
8. App explains the tradeoffs in plain language.

## Segment Types

The first MVP should support these segment types:

- `at_grade_median_running`
- `embedded_urban_street_section`
- `station_zone`
- `elevated_crossing`
- `bridge_approach`

The first release can compute all 5, but only the at-grade and station types need polished defaults.

## Section Families

The first MVP should support these section families:

- `conventional_rc`
  - conventional reinforced concrete slab
  - baseline option
- `fiber_reduced`
  - thinner steel-fiber-reinforced slab
  - inspired by the Phoenix light rail precedent
- `low_cement_rc`
  - conventional geometry with higher SCM replacement
  - lower embodied carbon but not necessarily fastest

Optional stretch:

- `precast_concept`

## Real Planning Factors

The MVP should separate `physical segment type` from `real-world corridor context`.

### Traffic And Operations

- `trafficAadt`
- `laneCount`
- `intersectionDensityPerMile`
- `truckPct` optional
- `trafficSensitivity`

These factors mainly affect:

- disruption
- construction duration
- traffic-control cost
- feasibility of median running or embedded construction

### Buildability And Corridor Constraints

- `utilityDensity`
- `rowWidthFt`
- `urbanCore`
- `nightWorkOnly`
- `floodRisk`

These factors mainly affect:

- buildability
- schedule risk
- structure type suitability
- construction premium

### Community Demand And Access

- `populationCatchment`
- `jobCatchment`
- `zeroCarHouseholdsPct`
- `transferConnectivityScore`
- `heatExposureScore`
- `activityNodeImportance`

These factors mainly affect:

- community benefit
- station value
- network usefulness
- how much disruption may be justified by long-term public benefit

## Required Inputs

- city preset
- project name
- corridor name
- segment type
- segment length
- slab width
- slab thickness
- concrete mix family
- SCM percentage
- reinforcement type
- rebar quantity or fiber quantity
- target service life
- traffic AADT
- lane count
- intersection density
- constructability flags:
  - downtown or urban core
  - utility density
  - traffic sensitivity
  - night work constraint
- right-of-way width
- flood risk
- population catchment
- job catchment
- zero-car households percentage
- transfer connectivity score
- heat exposure score

## Required Outputs

- `kg CO2e`
- `kg CO2e per linear foot`
- material quantity breakdown
- conceptual cost
- conceptual duration
- disruption score
- maintenance risk score
- buildability score
- community benefit score
- corridor total score
- best overall recommendation
- simple explanation of why that option won

## Data Model

Use this conceptual schema for all layers.

```json
{
  "cityId": "phoenix",
  "projectName": "West Phoenix Connector",
  "planningGoal": "lowest carbon with manageable disruption",
  "corridorAlternatives": [
    {
      "id": "alt-a",
      "name": "Alt A - Median Running",
      "segments": [
        {
          "id": "seg-1",
          "label": "Downtown approach",
          "segmentType": "embedded_urban_street_section",
          "lengthFt": 3200,
          "sectionFamily": "fiber_reduced",
          "sectionInputs": {
            "slabWidthFt": 10,
            "slabThicknessIn": 12,
            "concreteMix": "fiber_mix_15_scm",
            "scmPct": 15,
            "rebarLbPerCy": 40,
            "steelFiberLbPerCy": 60,
            "targetServiceLifeYears": 40
          },
          "context": {
            "trafficAadt": 42000,
            "laneCount": 6,
            "intersectionDensityPerMile": 18,
            "utilityDensity": "high",
            "trafficSensitivity": "high",
            "rowWidthFt": 82,
            "urbanCore": true,
            "nightWorkOnly": false,
            "floodRisk": "low"
          },
          "community": {
            "populationCatchment": 13500,
            "jobCatchment": 9200,
            "zeroCarHouseholdsPct": 16,
            "transferConnectivityScore": 8,
            "heatExposureScore": 7,
            "activityNodeImportance": 9
          }
        }
      ]
    }
  ]
}
```

## Scoring Model

The scoring engine should be deterministic and transparent.

### Core Equations

For each segment:

- concrete volume:
  - `volumeCy = lengthFt * slabWidthFt * (slabThicknessIn / 12) / 27`
- rebar quantity:
  - `rebarLb = volumeCy * rebarLbPerCy`
- fiber quantity:
  - `fiberLb = volumeCy * steelFiberLbPerCy`

Segment carbon is the sum of:

- concrete carbon
- rebar carbon
- fiber carbon
- rail/fastener/trackwork adder
- segment-type construction adder

Segment cost is the sum of:

- concrete material cost
- reinforcement material cost
- installation cost by segment type
- disruption premium by context

Segment duration is based on:

- production rate by segment type and section family
- context penalties for utilities, traffic, or night work

Segment disruption score should be driven by:

- traffic intensity
- intersection density
- urban core
- utility density
- traffic sensitivity
- segment type

Maintenance risk should reflect:

- service life target vs section family
- more complex segment type
- lower durability assumptions

Buildability score should reflect:

- right-of-way width
- utility density
- traffic intensity
- flood risk
- segment type

Community benefit score should reflect:

- population catchment
- job catchment
- transit dependency
- transfer connectivity
- station and activity-node value
- heat exposure penalty

Not every factor should affect every metric.

- traffic should mainly change cost, duration, disruption, and buildability
- population and jobs should mainly change community benefit
- utilities and right-of-way should mainly change buildability, cost, and duration
- heat exposure should mainly change station quality and community benefit

## Suggested Constants

Keep all constants in a single editable module so the team can tune them quickly.

Recommended constant groups:

- `MIX_PRESETS`
- `SECTION_PRESETS`
- `SEGMENT_TYPE_FACTORS`
- `CONTEXT_MULTIPLIERS`
- `BUILDABILITY_FACTORS`
- `COMMUNITY_BENEFIT_FACTORS`
- `SCORING_WEIGHTS`

## Initial Heuristics

Use explicit placeholder heuristics and label them as conceptual.

### Concrete Mix Presets

- `standard_15_scm`
  - `concreteKgCo2ePerCy`: 320
  - `concreteCostPerCy`: 185
- `low_carbon_35_scm`
  - `concreteKgCo2ePerCy`: 255
  - `concreteCostPerCy`: 195
- `fiber_mix_15_scm`
  - `concreteKgCo2ePerCy`: 315
  - `concreteCostPerCy`: 200

### Material Factors

- `rebarKgCo2ePerLb`: 0.75
- `steelFiberKgCo2ePerLb`: 1.15
- `rebarCostPerLb`: 0.55
- `steelFiberCostPerLb`: 0.85

### Segment Adders

- `at_grade_median_running`
  - lower installation premium
  - sensitive to traffic control and median width
- `embedded_urban_street_section`
  - medium installation premium
  - highest utility and business disruption sensitivity
- `station_zone`
  - higher installation premium
  - medium duration penalty
- `elevated_crossing`
  - highest installation premium
  - highest carbon adder
- `bridge_approach`
  - high structure and drainage complexity
  - higher cost and schedule uncertainty

### Production Rates

Use simple linear production assumptions for MVP:

- conventional at-grade: `35 lf/day`
- fiber-reduced at-grade: `55 lf/day`
- low-cement conventional: `32 lf/day`
- embedded urban street section: multiply base rate by `0.7`
- station zone: multiply base rate by `0.6`
- elevated crossing: multiply base rate by `0.5`
- bridge approach: multiply base rate by `0.55`

## UI Principles

- speak to communities and project teams, not one individual
- always show tradeoffs, not only a single "best" answer
- use plain language next to technical metrics
- make the engineering logic visible through section cards and metric breakdowns
- make community value visible next to engineering feasibility

## Technical Architecture

### Frontend

- `src/frontend/src/App.jsx`
- `src/frontend/src/api.js`
- `src/frontend/src/components/*`
- `MapLibre GL JS` for map rendering
- `Terra Draw` for sketching corridor alternatives
- `Turf` for GeoJSON geometry helpers on the client where appropriate

### Backend Analysis

- `src/backend/analysis/transitCarbonEngine.js`
- `src/backend/analysis/transitConstants.js`
- `src/backend/analysis/transitScenarioPresets.js`
- `Turf` for geometry helpers if analysis needs corridor buffers or spatial checks
- `H3` for corridor and station catchment scoring
- `node-gtfs` for optional transit network context and transfer scoring

### API

- `netlify/functions/analyze.js`

## Demo Story

The strongest demo story is:

1. open Phoenix
2. show 3 conceptual corridor alternatives
3. compare an at-grade baseline against a fiber-reduced and low-cement option
4. show that one option serves more people and jobs, another lowers disruption, and one gives the best overall balance
5. explain why the recommendation matters for agencies and communities

## Success At Demo Time

- the map renders a city preset
- the team can edit corridor alternatives live
- clicking analyze returns a stable result in under 2 seconds with local heuristics
- the results are easy to understand without reading code

## Open Risks

- scope creep from trying to do real route optimization
- overclaiming engineering rigor
- weak constants without clear labeling
- false precision in population or traffic-derived scores

## Risk Response

- keep optimization conceptual, not code-check level
- label all factors as heuristic and editable
- prioritize transparency over false precision
