# Transit Project Repo Shortlist

Last checked: 2026-04-04

This shortlist is tailored to the active project direction:

`GreenRoute Transit - Embodied Carbon Transit Design Assistant`

The goal is not to collect every transit repo. The goal is to identify the repos that actually help this MVP:

- corridor map and drawing
- transit data ingestion
- public transport planning logic
- corridor catchment and demand analysis
- embodied-carbon / LCA reference methods

## Best Repos For This MVP

## 1. maplibre/maplibre-gl-js

- Link: https://github.com/maplibre/maplibre-gl-js
- Best for: the map foundation
- Why it helps:
  - already matches the project stack in `CLAUDE.md`
  - supports interactive corridor visualization
  - works well with GeoJSON layers for corridor lines, stations, and segment highlighting
- Why it is a strong fit:
  - actively maintained
  - large ecosystem
  - open-source replacement for Mapbox GL JS
- MVP use:
  - city presets
  - corridor alternatives
  - segment highlighting
  - station markers

## 2. JamesLMilner/terra-draw

- Link: https://github.com/JamesLMilner/terra-draw
- Best for: drawing corridors and segment geometry on the map
- Why it helps:
  - supports MapLibre directly
  - gives a Google-Maps-like drawing workflow without forcing Google Maps into the stack
  - useful for sketching corridor alternatives, station extents, or planning zones
- MVP use:
  - draw or edit conceptual rail alignments
  - sketch corridor alternatives
  - capture geometry before sending scenario payloads to the analysis engine

## 3. Turfjs/turf

- Link: https://github.com/Turfjs/turf
- Best for: frontend and backend geospatial calculations
- Why it helps:
  - ideal for buffer, length, centroid, intersection, distance, and corridor catchment operations
  - works very well with GeoJSON and JavaScript
- MVP use:
  - segment length checks
  - station catchment buffers
  - corridor overlap or intersection logic
  - simplified access and coverage analysis

## 4. uber/h3-js

- Link: https://github.com/uber/h3-js
- Best for: population and jobs catchment analysis
- Why it helps:
  - gives a clean hex-grid approach to corridor and station influence areas
  - much easier to reason about than arbitrary polygons for scoring demand
- MVP use:
  - score population and jobs served around a corridor
  - compare corridor alternatives consistently
  - build transparent community-benefit metrics

## 5. BlinkTagInc/node-gtfs

- Link: https://github.com/BlinkTagInc/node-gtfs
- Best for: getting GTFS into a usable local database fast
- Why it helps:
  - imports GTFS into SQLite
  - supports querying routes, stops, times, fares, and GeoJSON output
  - can also work with GTFS-Realtime
- MVP use:
  - use local transit feeds for context
  - identify transfer points and nearby routes
  - support station-zone and network-connectivity scoring

## 6. MobilityData/gtfs-validator

- Link: https://github.com/MobilityData/gtfs-validator
- Best for: making sure GTFS inputs are not garbage
- Why it helps:
  - canonical validator for GTFS schedule feeds
  - avoids building on top of bad or incomplete feed data
- MVP use:
  - validate any GTFS feed before importing it
  - useful if the team demos with a real city feed

## 7. MobilityData/mobility-database-catalogs

- Link: https://github.com/MobilityData/mobility-database-catalogs
- Best for: finding official GTFS feeds
- Why it helps:
  - catalog of mobility data sources
  - easier way to locate usable feeds for Phoenix or any comparison city
- MVP use:
  - quickly find candidate GTFS sources
  - support city presets with real transit feeds

## Strong Methodology / Future-Phase Repos

## 8. conveyal/r5

- Link: https://github.com/conveyal/r5
- Best for: advanced accessibility and multimodal travel-time analysis
- Why it helps:
  - built for scenario planning and accessibility indicators
  - much closer to planning analysis than a simple route finder
- Why it is not first for MVP:
  - heavier Java stack
  - more powerful than the hackathon MVP needs
- Best use:
  - methodology inspiration
  - future upgrade for access-based community-benefit scoring

## 9. opentripplanner/OpenTripPlanner

- Link: https://github.com/opentripplanner/OpenTripPlanner
- Best for: full multimodal trip planning and itinerary generation
- Why it helps:
  - mature open-source transit planner
  - strong reference for how network-based trip planning is structured
- Why it is not first for MVP:
  - too large and heavy for a weekend build
- Best use:
  - future expansion
  - reference for itinerary and transfer logic

## 10. conveyal/transitive.js

- Link: https://github.com/conveyal/transitive.js
- Best for: stylized transit visualization
- Why it helps:
  - transit-focused visualization patterns
  - good reference for explaining routes and journeys visually
- Why it is not first for MVP:
  - older release cadence
  - your project needs planning and scoring more than stylized itinerary rendering
- Best use:
  - inspiration for a later polished transit view

## 11. valhalla/valhalla

- Link: https://github.com/valhalla/valhalla
- Best for: routing, isochrones, matrices, and road-network context
- Why it helps:
  - powerful routing engine on OpenStreetMap
  - useful if you later want drive-access, walk-access, or travel sheds around stations
- Why it is not first for MVP:
  - infrastructure-heavy for a hackathon
- Best use:
  - later phase for stronger corridor access modeling

## 12. GreenDelta/olca-app

- Link: https://github.com/GreenDelta/olca-app
- Best for: rigorous LCA methodology
- Why it helps:
  - strong open-source reference for life-cycle assessment
  - useful for grounding the carbon logic in accepted LCA structure
- Why it is not first for MVP:
  - too heavy to integrate directly
- Best use:
  - methodology reference
  - credibility for embodied carbon assumptions

## Recommended Stack For This Project

If the team wants the highest return with the least pain, use this combination:

### Must-use

- `maplibre/maplibre-gl-js`
- `JamesLMilner/terra-draw`
- `Turfjs/turf`
- `uber/h3-js`

### Use if you want real transit feeds

- `BlinkTagInc/node-gtfs`
- `MobilityData/gtfs-validator`
- `MobilityData/mobility-database-catalogs`

### Use as reference, not as weekend dependencies

- `conveyal/r5`
- `opentripplanner/OpenTripPlanner`
- `valhalla/valhalla`
- `GreenDelta/olca-app`

## Best Practical Recommendation

For the hackathon MVP, the most helpful repos are:

1. `maplibre/maplibre-gl-js`
2. `JamesLMilner/terra-draw`
3. `Turfjs/turf`
4. `uber/h3-js`
5. `BlinkTagInc/node-gtfs`

That combination gives you:

- map interaction
- corridor drawing
- geometry analysis
- catchment and density scoring
- optional real transit feed support

## Key Takeaway

The repos that benefit this project most are not generic "public transportation apps." The best ones are the ones that help us:

- draw corridor alternatives
- score real planning factors
- attach real transit network context
- keep carbon and community-benefit logic transparent
