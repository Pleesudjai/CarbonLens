# Specs Index

Last updated: 2026-04-04

This folder contains the planning specs for the active transit-focused concept:

`Embodied Carbon Transit Design Assistant`

Core positioning:

`Google Maps helps communities see the city. Our tool helps planners, agencies, and communities choose the lowest-carbon, most buildable rail corridor together.`

## Important Assumptions

- Keep the existing project stack from `CLAUDE.md`: React 18, Vite, Tailwind, MapLibre GL JS, Recharts, Netlify Functions.
- For MVP speed, implement a Google Maps-style planning workflow with `MapLibre GL JS`, not the Google Maps API.
- The selected supporting library stack for the MVP is:
  - `MapLibre GL JS` for the base map
  - `Terra Draw` for corridor sketching and editing
  - `Turf` for GeoJSON geometry math and corridor buffers
  - `H3` for transparent catchment and density scoring
  - `node-gtfs` for optional real transit-feed context
- The product is a `conceptual planning assistant`, not a stamped engineering design tool.
- The first demo should focus on `Phoenix` and at-grade transit sections because that is the strongest domain knowledge available.
- The deterministic analysis engine must work without Claude API help. AI narration is optional after the core math is working.
- Real public-transport planning factors should be sourced from public or agency datasets and modeled as transparent heuristics, not hidden assumptions.
- The first factor set should include traffic intensity, intersection density, utility conflict risk, right-of-way width, station catchment population, job density, transit dependency, transfer connectivity, and heat exposure.
- Carbon-related map overlays should prioritize decision support, not decoration.
- The carbon overlay roadmap for the active concept is:
  - `Road CO2 Pressure`
  - `Mode-Shift Opportunity`
  - `Construction Carbon Penalty`
  - `Delay Emissions Hotspots` as an optional later phase
- The first implementation pass should only ship the first 2 overlays as background layers.
- `Construction Carbon Penalty` should start as a corridor and segment metric before it becomes a citywide layer.

## Recommended Read Order

1. `transit-carbon-assistant-product-spec.md`
2. `transit-geospatial-foundation.md`
3. `transit-carbon-overlay-roadmap.md`
4. `transit-analysis-engine.md`
5. `transit-analysis-api.md`
6. `transit-map-scenario-builder.md`
7. `transit-results-dashboard.md`

## Recommended Execution Order

If Claude is building this in fresh sessions with `/execute`, use this order:

1. `specs/transit-geospatial-foundation.md`
2. `specs/transit-carbon-overlay-roadmap.md`
3. `specs/transit-analysis-engine.md`
4. `specs/transit-analysis-api.md`
5. `specs/transit-map-scenario-builder.md`
6. `specs/transit-results-dashboard.md`

Reason:
- the foundation spec locks the chosen libraries and utility boundaries
- the carbon overlay roadmap locks the planning meaning of the map layers before implementation details drift
- the analysis engine defines the payload and scoring logic
- the API stabilizes the contract
- the frontend can then wire to a known schema instead of guessing

## Conflict Check

- The core project context is now aligned to the transit concept in:
  - `CLAUDE.md`
  - `package.json`
  - `src/frontend/index.html`
  - `src/frontend/src/App.jsx`
  - `src/frontend/src/api.js`
  - `.claude/commands/plan-feature.md`
  - `.claude/commands/execute.md`
  - `.claude/commands/commit.md`
- The current stack still works well for the transit MVP:
  - React
  - MapLibre GL JS
  - Terra Draw
  - Turf
  - H3
  - node-gtfs
  - Recharts
  - Netlify Functions
- Remaining legacy areas:
  - `src/backend/gee/`
  - `.claude/rules/gee-layer.md`
  - older research notes that are intentionally being kept as references
- These are not active conflicts as long as the current spec does not call for GEE work.
- The transit specs themselves were checked for naming consistency after the update:
  - `bridge_approach` is now included
  - `embedded_urban_street_section` is used consistently
  - traffic, density, and community factors are now represented across product, engine, API, map, and results specs
  - the generic `community heatmap` idea is now superseded by a carbon-focused overlay roadmap

## Success Criteria For The Hackathon Demo

- A team member can choose a city preset and define a conceptual rail corridor.
- The app can compare at least 3 corridor alternatives.
- The map can explain carbon decisions through at least 2 background overlays with numeric legends and source-aware labels.
- Each corridor can contain multiple segment types with different section choices.
- The app returns embodied carbon, cost, schedule, disruption, maintenance, buildability, and community-benefit metrics.
- The app gives a clear recommendation in plain language for planners, agencies, and community stakeholders.
- The demo makes the civil engineering value obvious through slab and section tradeoffs, not just map visualization.

## Selected Libraries

These are the current default choices unless a later spec explicitly replaces them:

- `MapLibre GL JS`
  - render city presets, corridors, segments, and station markers
- `Terra Draw`
  - allow sketching and editing conceptual alignments
- `Turf`
  - calculate lengths, buffers, intersections, centroids, and simplified catchments
- `H3`
  - score population/jobs/coverage in a transparent hex-grid model
- `node-gtfs`
  - import local GTFS feed data for stops, routes, shapes, and connectivity context
