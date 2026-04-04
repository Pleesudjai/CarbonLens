# Transit Repo Stack Shortlist

> **Purpose**: Reusable GitHub repo shortlist for the active `GreenRoute Transit` concept, focused on map interaction, corridor drawing, geospatial analysis, density scoring, GTFS context, and embodied-carbon methodology support.
> **When to use**: When choosing libraries, justifying the MVP stack, planning integrations, or deciding which transit/planning repos to study versus avoid during the hackathon.
> **Source**: Live GitHub repo review performed on 2026-04-04, with detailed notes also saved in `Github_repo/transit_project_repo_shortlist.md`.
> **Size**: ~150 lines - load directly when planning implementation stack or integration choices.

---

## Best Repos For The MVP

### 1. maplibre/maplibre-gl-js

- Best map foundation
- Already matches the project stack
- Actively maintained
- Best use:
  - base map rendering
  - corridor alternatives
  - segment highlighting
  - station markers

### 2. JamesLMilner/terra-draw

- Best for sketching corridor alternatives directly on the map
- Best use:
  - draw conceptual alignments
  - edit corridor alternatives
  - support a Google-Maps-like planning workflow without switching away from MapLibre

### 3. Turfjs/turf

- Best for corridor geometry math
- Best use:
  - buffers
  - catchments
  - intersections
  - segment calculations
  - length and centroid logic

### 4. uber/h3-js

- Best for transparent population and job-density scoring around corridors and stations
- Best use:
  - catchment indexing
  - corridor density scoring
  - station-area comparison
  - community-benefit calculations

### 5. BlinkTagInc/node-gtfs

- Best for bringing real transit feeds into SQLite and querying stops, routes, and shapes quickly
- Best use:
  - optional real transit-feed context
  - transfer and connectivity support
  - route and stop lookup

## Best Supporting Repos

### MobilityData/gtfs-validator

- Validate GTFS before using it
- Best use:
  - avoid bad feed data
  - improve trust in demo data inputs

### MobilityData/mobility-database-catalogs

- Find official GTFS feeds for Phoenix or other cities
- Best use:
  - city preset sourcing
  - GTFS feed discovery

### conveyal/r5

- Strong future-phase accessibility and scenario-analysis reference
- Best use:
  - borrow methodology
  - future upgrade path

### opentripplanner/OpenTripPlanner

- Strong future reference for full multimodal trip planning
- Best use:
  - learn itinerary and transfer logic
  - future expansion reference

### GreenDelta/olca-app

- Best methodology reference for stronger embodied-carbon and LCA framing
- Best use:
  - methodology support
  - credibility for carbon assumptions

## Strongest Recommendation For What To Actually Use Now

Use:

- `MapLibre`
- `Terra Draw`
- `Turf`
- `H3`
- `node-gtfs`

This combination fits the current app and gives:

- corridor drawing
- geospatial analysis
- density and catchment scoring
- optional real transit-feed integration

## Recommendation Boundaries

Do use directly:

- `maplibre/maplibre-gl-js`
- `JamesLMilner/terra-draw`
- `Turfjs/turf`
- `uber/h3-js`
- `BlinkTagInc/node-gtfs`

Borrow concepts only:

- `MobilityData/gtfs-validator`
- `MobilityData/mobility-database-catalogs`
- `GreenDelta/olca-app`

Too heavy for the first hackathon build unless only used as references:

- `conveyal/r5`
- `opentripplanner/OpenTripPlanner`

## Why Not Start With R5 Or OpenTripPlanner

- They are powerful
- They are strong references
- But they are too heavy for the first weekend MVP
- They are better for future expansion or for borrowing planning logic, not as first-build dependencies

## Sources

- `maplibre/maplibre-gl-js`
- `JamesLMilner/terra-draw`
- `Turfjs/turf`
- `uber/h3-js`
- `BlinkTagInc/node-gtfs`
- `MobilityData/gtfs-validator`
- `MobilityData/mobility-database-catalogs`
- `conveyal/r5`
- `opentripplanner/OpenTripPlanner`
- `GreenDelta/olca-app`

## Cross References

- Detailed shortlist:
  - `Github_repo/transit_project_repo_shortlist.md`
- Active specs:
  - `specs/transit-geospatial-foundation.md`
  - `specs/transit-carbon-assistant-product-spec.md`
  - `specs/README.md`

## Key Takeaway

The most useful repos for this project are not generic public transportation apps. The best repos are the ones that help the team:

- draw corridor alternatives
- score real planning factors
- attach real transit-network context
- keep carbon and community-benefit logic transparent
