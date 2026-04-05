# Feature Spec: Transit Geospatial Foundation
Date: 2026-04-04
Layer: frontend | backend-module

## What We're Building

A thin foundation layer that formalizes the selected MVP libraries and defines where each one is used:

- `MapLibre GL JS`
- `Terra Draw`
- `Turf`
- `H3`
- `node-gtfs`

This spec is intentionally about setup boundaries and utility roles, not full feature implementation. Its purpose is to keep later specs aligned and prevent ad hoc library choices.

## Inputs / Outputs

- Input: city presets, corridor GeoJSON, segment form state, optional GTFS feed config
- Output: reusable map, drawing, geometry, density, and GTFS utility boundaries for the rest of the app

## Selected Libraries And Roles

### MapLibre GL JS

- base map rendering
- city preset navigation
- corridor and station GeoJSON layers
- segment highlighting
- background overlays and legends for carbon-related planning layers

### Terra Draw

- conceptual corridor sketching
- editable line geometry
- future support for station or zone polygons if needed

### Turf

- line length
- buffers
- centroids
- intersections
- nearest-point style utilities if needed later

### H3

- corridor catchment indexing
- station-area indexing
- population and jobs scoring on a consistent grid
- transparent community-benefit calculations
- mode-shift opportunity indexing for carbon-focused map overlays

### node-gtfs

- import GTFS to SQLite
- query routes, stops, shapes, and transfers
- provide optional real network context for station connectivity scoring
- provide transit-gap context for mode-shift-opportunity calculations

## Implementation Guidance

Keep these libraries behind simple utilities instead of scattering them directly through the app.

### Frontend Boundary

- `MapLibre GL JS` and `Terra Draw` belong in frontend components and small map utility modules
- `Turf` may be used in frontend for lightweight geometry helpers

### Backend Boundary

- `H3` scoring helpers can live in `src/backend/analysis/` or shared utility modules
- `node-gtfs` should not block the first analysis engine implementation
- GTFS support should be optional and default to preset data if no feed is loaded

## Files to Create or Edit

- `src/frontend/src/components/CorridorMap.jsx` - MapLibre map host
- `src/frontend/src/components/mapUtils.js` - small GeoJSON and map helper functions
- `src/frontend/src/components/drawUtils.js` - Terra Draw setup and editing helpers
- `src/frontend/src/components/BackgroundLayerControl.jsx` - overlay switcher and numeric legends
- `src/frontend/src/components/LiveDataBadge.jsx` - live or fallback source state
- `src/frontend/src/components/backgroundOverlayData.js` - fallback snapshots and overlay metadata
- `src/backend/analysis/geospatialUtils.js` - Turf and H3 helper functions used by analysis
- `src/backend/analysis/gtfsContext.js` - optional GTFS loading and connectivity helper
- `netlify/functions/background-overlays.js` - live or cached overlay payloads
- `src/frontend/package.json` - add frontend mapping and geometry dependencies
- `netlify/functions/package.json` or root package config - add GTFS dependency only where it will actually run

## Package Direction

Expected packages:

- frontend:
  - `maplibre-gl`
  - `terra-draw`
  - `@turf/turf` or selected Turf modules
  - `h3-js` if needed client-side
- backend:
  - `gtfs` from `node-gtfs`
  - `h3-js` if scoring is backend-side

Prefer keeping GTFS ingestion on the backend side.

## Design Rules

- `MapLibre` is the only base map library for MVP
- `Terra Draw` is the preferred drawing layer if drawing is implemented
- `Turf` is the default geometry utility, not handwritten geometry math where Turf already solves it cleanly
- `H3` is the default density/catchment indexing approach
- `node-gtfs` is optional for the first demo but should be treated as the chosen path for real feed support
- carbon-focused overlay ids and labels should be stable across frontend and backend before visual tuning begins

## Implementation Steps

1. [ ] Confirm package installation targets for frontend vs backend
2. [ ] Create a small map utility boundary instead of calling every library directly from `App.jsx`
3. [ ] Create a small analysis utility boundary for Turf/H3 helpers
4. [ ] Define how GTFS context enters the app:
   - preset-only
   - optional imported feed
   - optional future realtime
5. [ ] Define a stable boundary for background overlays:
   - live backend connectors
   - frontend fallback snapshots
   - numeric legend metadata
6. [ ] Ensure later specs reference these libraries instead of inventing alternatives

## Demo Test

The foundation is successful if later implementation can do all of this without changing libraries:

- render a city preset in MapLibre
- sketch or edit a corridor with Terra Draw
- calculate corridor length or buffer with Turf
- score a corridor catchment using H3
- optionally attach transit-stop or route context from node-gtfs

## Out of Scope

- fully implementing all later features in this spec
- real-time GTFS-Realtime integration
- replacing the deterministic analysis engine with external routing engines
