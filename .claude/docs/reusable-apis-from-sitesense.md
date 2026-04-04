# Reusable APIs From SiteSense

> **Purpose**: Quick decision note on which APIs and implementation patterns from the older `SiteSense` project can be reused safely in `GreenRoute Transit`.
> **When to use**: When deciding whether to borrow map/search/buildability data sources from `01 Hackathon Claude ASU 2026` without destabilizing the current stack.
> **Source**: Local review of `01 Hackathon Claude ASU 2026/CLAUDE.md`, `src/frontend/src/components/MapView.jsx`, and `src/frontend/package.json` on 2026-04-04.
> **Size**: Short reference note for future Claude sessions.

---

## Short Answer

Borrowing selected APIs from `SiteSense` will not ruin the current stack if they are treated as:

- data sources
- search helpers
- optional buildability overlays

They should not replace the current core stack:

- `MapLibre`
- `Terra Draw`
- `Turf`
- `H3`
- `node-gtfs`

## Safe To Adopt

### 1. Nominatim / OpenStreetMap

- Best use:
  - city search
  - origin/destination search
  - station lookup
  - address-to-map navigation
- Why it is safe:
  - works cleanly with `MapLibre`
  - does not conflict with `Terra Draw`
  - fits the existing transit-planning workflow

### 2. Esri World Imagery

- Best use:
  - satellite basemap option
  - visual inspection of medians, ROW width, intersections, and urban context
- Why it is safe:
  - it is just a raster tile source for `MapLibre`
  - no architecture change is required

### 3. USGS 3DEP

- Best use:
  - elevation
  - slope
  - bridge approach context
  - grade transition screening
- Why it is safe:
  - it can stay a backend or analysis-layer input
  - it strengthens buildability scoring without changing the frontend stack

### 4. USDA SoilWeb

- Best use:
  - conceptual geotechnical context
  - shrink-swell risk
  - caliche or soil-behavior flags
  - pavement, slab, and guideway screening inputs
- Why it is safe:
  - it supports your civil engineering differentiator
  - it can remain optional and conceptual in the analysis layer

### 5. FEMA NFHL

- Best use:
  - floodplain screening
  - wash or low-area conflict checks
  - drainage and schedule-risk inputs
- Why it is safe:
  - it adds corridor context, not a new platform dependency

## Useful Later, Not Required For MVP

### USGS NSHM

- Useful for:
  - broader hazard context
  - future national-scale buildability adjustments
- Why it is not first priority:
  - less important than traffic, density, utilities, and ROW for the MVP

### USFWS NWI

- Useful for:
  - environmental constraint screening
  - permitting-awareness outside the Phoenix-first MVP
- Why it is not first priority:
  - not central to the first demo story

## Avoid For Now

### 1. `@mapbox/mapbox-gl-draw`

- Do not import this from the old project
- Reason:
  - the current spec already chose `Terra Draw`
  - mixing both draw systems would create confusion and unnecessary integration risk

### 2. Copying The Old Map Component Structure Directly

- Do not clone `SiteSense` map logic wholesale
- Reason:
  - that project was built around parcel selection and hazard screening
  - this project is built around corridor sketching, segment analysis, and transit scoring

### 3. Loading Too Many Hazard APIs Into The MVP At Once

- Do not let hazard overlays dominate the first build
- Reason:
  - the corridor workflow must work first
  - hazard and geotechnical layers should support the buildability story, not replace it

## Compatibility Rule

Safe rule for future implementation:

- keep `MapLibre + Terra Draw + Turf + H3 + node-gtfs` as the foundation
- add external APIs only for:
  - search
  - imagery
  - buildability overlays
  - conceptual engineering context

If an imported tool tries to replace map rendering, drawing, geometry, density scoring, or GTFS context, it should be treated as a stack conflict.

## Best Practical Borrowing Order

1. `Nominatim`
2. `Esri World Imagery`
3. `USGS 3DEP`
4. `USDA SoilWeb`
5. `FEMA NFHL`

## Key Takeaway

The old project contains useful APIs, but they should be borrowed selectively.

The APIs are mostly safe.
The risky part is borrowing old library choices or old interaction patterns that conflict with the transit MVP architecture.
