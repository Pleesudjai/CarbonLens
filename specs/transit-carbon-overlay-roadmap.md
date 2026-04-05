# Feature Spec: Transit Carbon Overlay Roadmap
Date: 2026-04-04
Layer: product-reference | frontend | backend-module | netlify-function

## What We're Building

A carbon-focused overlay system that helps planners understand three different questions:

1. Where roadway travel likely produces the most operating emissions now
2. Where new rail could shift the most trips out of private vehicles
3. Where new rail would be most carbon-intensive to construct

This spec replaces the idea of a generic `community heatmap` with a more defensible carbon decision stack.

## Product Framing

Use overlays to support carbon-related planning decisions, not to decorate the map.

Each overlay should answer one clear question:

- `Road CO2 Pressure`
  - where private-vehicle activity is likely highest today
- `Mode-Shift Opportunity`
  - where rail investment could displace the most car travel
- `Construction Carbon Penalty`
  - where building rail is likely to require more carbon-intensive structure or mitigation
- `Delay Emissions Hotspots`
  - optional future layer for corridors where congestion and unreliability likely increase emissions

## FHWA Alignment

This roadmap is aligned with FHWA guidance that emphasizes:

- mobility and access
- reliability
- scenario planning
- performance-based comparison of alternatives

The overlay system should help the app compare corridor alternatives in a way that is understandable to agencies and community stakeholders.

## Chosen Overlay Stack

### 1. Road CO2 Pressure

Purpose:

- show where current roadway demand likely creates the highest operating-emissions pressure

Primary data:

- ADOT AADT workbook
- ADOT traffic-section geometry

Phase 1 formula:

- `roadCo2Pressure = normalized trafficAadt`

Future refinement:

- add roadway class
- add truck share if available
- optionally convert to estimated daily on-road CO2e if defendable factors are available

Display type:

- background heatmap plus supporting point or line layer

Legend:

- primary legend unit: `vehicles / day`
- optional future subtitle: `proxy for roadway operating emissions pressure`

Frontend label:

- `Road CO2 Pressure`

Implementation note:

- this is a rename and reframing of the existing live AADT overlay, not a brand-new data connector

### 2. Mode-Shift Opportunity

Purpose:

- show where a rail extension could remove the most car travel by serving dense population, employment, and transit gaps

Primary data:

- Census population
- LEHD / LODES jobs
- GTFS stop, route, and service context

Phase 1 formula:

- `modeShiftOpportunityLite = 0.65 * populationNorm + 0.35 * transitGapNorm`

Phase 2 formula:

- `modeShiftOpportunity = 0.40 * populationNorm + 0.35 * jobsNorm + 0.25 * transitGapNorm`

Optional later modifier:

- boost cells with stronger zero-car-household share if the team wants a combined carbon-plus-equity view

Transit gap should consider:

- low frequency
- weak transfer connectivity
- poor access to existing rail, streetcar, or airport people-mover service

Display type:

- H3 hex fill or smooth heatmap

Legend:

- Phase 1 unit: `index 0-100`
- Phase 2 can keep the same index for readability even when more inputs are added

Frontend label:

- `Mode-Shift Opportunity`

Implementation note:

- this should replace the generic `Population Gradient` framing

### 3. Construction Carbon Penalty

Purpose:

- show where rail is more expensive in embodied carbon because the corridor likely needs more structure, mitigation, or heavy civil work

Primary data:

- segment type
- corridor geometry
- FEMA flood risk
- right-of-way constraint
- structure triggers such as elevated crossing or bridge approach
- section family

Phase 3 starting formula:

- `constructionCarbonPenalty = weighted index from segmentType + floodRisk + rowConstraint + structureTrigger + sectionFamily`

Suggested first normalized weights:

- `0.35 segment structure demand`
- `0.20 flood / drainage penalty`
- `0.20 right-of-way / staging penalty`
- `0.15 section-family embodied-carbon premium`
- `0.10 utility or urban-core complexity`

Display type:

- start as corridor and segment cards, not a citywide background layer

Legend:

- first version: `index 1-10`
- later version: `kg CO2e / ft` or `kg CO2e / segment`

Frontend label:

- `Construction Carbon Penalty`

Implementation note:

- do not fake a citywide raster before the corridor engine can support it honestly

### 4. Delay Emissions Hotspots

Purpose:

- show where stop-and-go delay and unreliability likely increase operational emissions

Primary data:

- congestion or reliability data if available
- future probe-speed or travel-time data if the team can get it

Phase:

- optional Phase 4 only

Display type:

- corridor line intensity, bottleneck markers, or focused heatmap

Legend:

- delay index or reliability index

Frontend label:

- `Delay Emissions Hotspots`

Implementation note:

- this is useful, but it should come after the first three overlays

## MVP Build Order

### Phase 1

Implement:

- `Road CO2 Pressure`
- `Mode-Shift Opportunity Lite`

Deliverables:

- relabel existing AADT overlay
- replace generic population framing with mode-shift framing
- show numeric legends and live source badges

### Phase 2

Upgrade:

- `Mode-Shift Opportunity` to include jobs and GTFS-based transit-gap logic

Deliverables:

- backend support for jobs data
- GTFS-derived service-gap scoring
- stable 0-100 index

### Phase 3

Add:

- `Construction Carbon Penalty`

Deliverables:

- corridor-level and segment-level carbon-penalty indicators
- clear explanation of why a corridor is structurally carbon-heavy

### Phase 4

Optional:

- `Delay Emissions Hotspots`

Deliverables:

- reliability or delay-informed emissions overlay if a defendable source is available

## Data Source Plan

- `Road CO2 Pressure`
  - ADOT traffic monitoring workbook
  - ADOT traffic-section geometry service
- `Mode-Shift Opportunity`
  - Census block group or tract population
  - LEHD / LODES jobs
  - GTFS stop, route, and frequency context
- `Construction Carbon Penalty`
  - scenario geometry and segment selections
  - FEMA NFHL
  - local right-of-way and context heuristics
- `Delay Emissions Hotspots`
  - future congestion or reliability source only if available and defendable

## API Direction

The public overlay endpoint should move toward these stable layer ids:

- `roadCo2Pressure`
- `modeShiftOpportunity`
- `constructionCarbonPenalty`
- `delayEmissionsHotspots`

For migration safety, the app may temporarily keep legacy aliases:

- `aadt` -> `roadCo2Pressure`
- `population` -> `modeShiftOpportunityLite`

The endpoint should also return:

- source summary
- live or fallback mode
- overlay version
- legend metadata

## UI Rules

- keep overlays interpretable with numeric legends
- do not show two similar red gradients at once without clear labels
- use source badges to show whether data is live or cached
- keep the overlay control focused on planning questions, not raw dataset names
- show corridor and segment carbon signals next to the map so background overlays connect to decisions

## Recommendation Language

When the app explains a corridor, use the overlay stack like this:

- `Road CO2 Pressure` explains where emissions pressure exists now
- `Mode-Shift Opportunity` explains where rail can remove more driving
- `Construction Carbon Penalty` explains what it costs in embodied carbon to build there

This creates a clear three-part carbon story:

- current operating emissions
- future mode-shift potential
- embodied-carbon cost of construction

## Out Of Scope For The First Build

- exact citywide operational-emissions modeling
- lifecycle carbon forecasts by household
- claimed CO2 savings without transparent assumptions
- citywide construction-carbon raster before corridor logic is mature

## References For Future Use

- FHWA PlanWorks performance measures
- FHWA mobility and access guidance
- FHWA scenario planning for TSMO
- ADOT traffic monitoring data
- Census population data
- LEHD / LODES employment data
- FEMA NFHL
