# Feature Spec: Transit Map Scenario Builder
Date: 2026-04-04
Layer: frontend

## What We're Building

A map-first scenario builder that lets the team choose a city preset, review a conceptual rail corridor on the map, define up to 3 corridor alternatives, edit segment properties, attach real planning factors, and send the scenario to the analysis API.

Important implementation note:

Use `MapLibre GL JS` because it is already in the project stack. The user experience should feel like a Google Maps planning workflow, but do not add Google Maps API dependency in the MVP.

Chosen library direction for this spec:

- `MapLibre GL JS` for the base map
- `Terra Draw` for corridor sketching and editing
- `Turf` for geometry helpers such as length and buffer calculations
- `H3` only if lightweight client-side catchment feedback is useful
- `node-gtfs` stays backend-side and should not be loaded directly in the browser

## Inputs / Outputs

- Input: city preset selection, corridor alternative form state, segment form state
- Output: normalized scenario payload sent to `src/frontend/src/api.js`

## Files to Create or Edit

- `src/frontend/src/App.jsx` - main page layout and top-level state
- `src/frontend/src/api.js` - add scenario analysis request helper if needed
- `src/frontend/src/components/TransitHero.jsx` - title, positioning, and intro copy
- `src/frontend/src/components/CitySelector.jsx` - city preset picker
- `src/frontend/src/components/CorridorMap.jsx` - MapLibre map and corridor rendering
- `src/frontend/src/components/CorridorPanel.jsx` - corridor alternative list and controls
- `src/frontend/src/components/SegmentEditor.jsx` - edit segment geometry, type, and section family
- `src/frontend/src/components/AnalyzeActions.jsx` - analyze button, loading state, reset state
- `src/frontend/src/components/CommunitySummaryCard.jsx` - plain-language scenario framing
- `src/frontend/src/components/cityPresets.js` - city preset data
- `src/frontend/src/components/defaultScenario.js` - starter scenario data or scenario factory
- `src/frontend/src/components/mapUtils.js` - MapLibre and Turf helpers
- `src/frontend/src/components/drawUtils.js` - Terra Draw integration helpers

## Frontend Requirements

### Layout

The main screen should contain:

- a strong header explaining the concept
- a left-side or top control area for scenario input
- a large map area
- a placeholder area for results that can be populated later

### City Selector

Support at least:

- Phoenix
- Seattle
- Portland

Each city preset should include:

- label
- longitude and latitude center
- zoom
- default starter scenario

### Corridor Alternatives

Support:

- up to 3 alternatives
- editable alternative name
- editable planning note or goal
- add or remove segments

### Segment Editing

Each segment should allow:

- label
- segment type
- length in feet
- section family
- slab width
- slab thickness
- SCM percent
- rebar quantity
- steel fiber quantity
- traffic AADT
- lane count
- intersection density
- utility density
- right-of-way width
- traffic sensitivity
- urban core flag
- night work flag
- flood risk
- population catchment
- job catchment
- zero-car households percentage
- transfer connectivity score
- heat exposure score
- activity-node importance

### Real Planning Factor Input

For MVP, these factors should be entered manually or loaded from city presets.

Do not block the build on live APIs for:

- traffic
- census
- GTFS
- utility mapping

The product should still feel realistic because the fields are explicit and editable.

### Map Behavior

For MVP:

- show the selected city
- render alternative corridors as colored lines
- highlight the currently selected corridor
- optionally show segment labels or endpoints
- show lightweight corridor badges or side-panel summaries for:
  - traffic intensity
  - population/jobs served
  - right-of-way constraint
- use Terra Draw if drawing/editing is turned on in the first build

Do not attempt advanced drawing plugins unless they are trivial to implement.

## State Shape

Frontend state should match the API contract as closely as possible so `App.jsx` stays simple.

## Copy Guidance

Use collaborative language:

- `communities`
- `planners`
- `agencies`
- `project teams`

Avoid product copy that implies one person alone changes transit.

## Implementation Steps

1. [ ] Replace the placeholder `App.jsx` layout with a transit planning shell
2. [ ] Create a `cityPresets.js` module with 3 presets
3. [ ] Create a starter scenario factory for Phoenix
4. [ ] Build `CitySelector.jsx`
5. [ ] Build `CorridorPanel.jsx`
6. [ ] Build `SegmentEditor.jsx`
7. [ ] Ensure segment editing includes engineering fields plus planning-context fields
8. [ ] Create lightweight `mapUtils.js` and `drawUtils.js` helpers
9. [ ] Build `CorridorMap.jsx` with MapLibre and Terra Draw integration points
10. [ ] Add `AnalyzeActions.jsx` with loading and disabled states
11. [ ] Wire the scenario payload to `api.js`
12. [ ] Keep all components under 150 lines by splitting concerns early

## Demo Test

At demo time the team should be able to:

1. open the app and immediately see Phoenix
2. switch between city presets
3. rename corridor alternatives
4. change at least one segment from conventional to fiber-reduced
5. change at least one real-world factor such as traffic or population catchment
6. click analyze and send the scenario payload successfully

## Out of Scope

- real geocoding
- full route drawing tools
- GIS snapping to roads
- live parcel or utility overlays
- live traffic or census ingestion
- account-based project management
