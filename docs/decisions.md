# Decision Log

## 2026-04-04 — Project scaffold initialized
**What:** Created full WISC project structure with React 18 + Vite 5 + Tailwind 3 frontend, Netlify Functions backend, GEE integration stubs, and 5 slash commands.
**Why:** Replicating the winning SiteSense hackathon scaffold to move fast on Innovation Hacks 2.0.
**Files changed:** All initial files (25 files)
**Next:** Choose product direction and start building features.

## 2026-04-04 — GitHub repo research completed
**What:** Researched 15+ open-source repos relevant to the Amazon Sustainability track. Created a ranked shortlist and 3 product direction combos.
**Why:** Need prior art and reusable patterns to build a strong MVP in a weekend.
**Files changed:** Github_repo/README.md, Github_repo/repo_pool.md
**Next:** Pick a product direction with the team and write the first feature spec.

## 2026-04-04 — Product pivot to GreenRoute Transit + full spec suite
**What was built:** Pivoted from generic sustainability scaffold to GreenRoute Transit (Embodied Carbon Transit Design Assistant). Wrote 5 feature specs, updated all WISC commands and domain rules for transit context, created Valley Metro FRC case study doc, and updated CLAUDE.md with full product scope and modeling guidance.
**Why this approach:** The team's strongest differentiator is real civil engineering knowledge (slab optimization, buildability, FRC). A transit corridor comparison tool leverages that expertise while directly addressing Amazon's sustainability challenge with quantifiable CO2e impact metrics.
**Files changed:** CLAUDE.md, package.json, src/frontend/index.html, App.jsx, api.js, all .claude/commands/*.md, all .claude/rules/*.md, .claude/docs/valley-metro-frc-case-study.md, Github_repo/, docs/, specs/ (6 spec files)
**Next:** Execute specs in order — analysis engine first, then API, map, dashboard.

## 2026-04-04 — Geospatial foundation layer
**What was built:** Installed MapLibre GL JS, Terra Draw, Turf, H3, and node-gtfs. Created utility boundary files for map rendering, corridor drawing, geometry/catchment analysis, and optional GTFS context. Wired CorridorMap into App.jsx with city preset selector and map+sidebar layout.
**Why this approach:** The spec calls for thin utility boundaries so later specs (analysis engine, map builder, dashboard) consume stable helpers instead of scattering library calls. Phoenix/Denver/Portland presets and 20 Valley Metro Rail fallback stops ship without any external feed dependency.
**Files changed:** src/frontend/src/components/CorridorMap.jsx, mapUtils.js, drawUtils.js (new), src/backend/analysis/geospatialUtils.js, gtfsContext.js (new), src/frontend/src/App.jsx (updated), src/frontend/package.json, netlify/functions/package.json
**Next:** Execute transit-analysis-engine.md — deterministic scoring module that everything else depends on.

## 2026-04-04 — Transit analysis engine (deterministic scoring)
**What was built:** Pure JavaScript analysis engine with 3 section family presets (conventional RC, fiber-reduced, low-cement SCM), 5 segment types, context multipliers, and 7 output metrics (carbon, cost, duration, disruption, maintenance, buildability, community benefit). Phoenix scenario seed with 3 corridor alternatives (7 segments) produces differentiated rankings — Alt C best composite, Alt B lowest carbon + highest community, no single corridor wins everything.
**Why this approach:** Engine is fully deterministic with no API dependencies. All constants are editable in transitConstants.js. Formulas follow the spec exactly (volume, carbon, cost, duration, disruption, buildability, community, maintenance, composite). Output shape matches the API contract spec for direct frontend consumption.
**Files changed:** src/backend/analysis/transitConstants.js (new), transitScenarioPresets.js (new), transitCarbonEngine.js (new)
**Next:** Execute transit-analysis-api.md — wire the engine to a Netlify function so the frontend can call it.

## 2026-04-04 — Transit analysis API (Netlify function)
**What was built:** POST `/api/analyze` Netlify function that validates scenario payloads, normalizes `corridorAlternatives`/`corridors` key, runs the deterministic engine, and returns ranked results. Falls back to Phoenix preset on empty body. Returns 405 for non-POST, 400 for bad JSON, 500 for unexpected errors. Frontend api.js updated with `analyzePreset()` helper.
**Why this approach:** Thin function layer keeps the contract simple — receive JSON, validate, call engine, return results. Accepts both `corridorAlternatives` and `corridors` so frontend and API spec stay flexible. Empty-body fallback makes demo instant without frontend form wiring.
**Files changed:** netlify/functions/analyze.js (new), src/frontend/src/api.js (updated)
**Next:** Execute transit-map-scenario-builder.md — MapLibre corridor drawing + city presets.

## 2026-04-04 — Map scenario builder (frontend UI)
**What was built:** Full map-first scenario builder with CitySelector (Phoenix/Seattle/Portland), CorridorPanel (add/remove/rename up to 3 corridors), collapsible SegmentEditor (type, section family, planning factors, community factors), AnalyzeActions (button + spinner), and representative corridor geometries on MapLibre. App.jsx rewired with complete scenario state management — state shape matches API contract directly. All components at or under 150 lines.
**Why this approach:** Spec calls for a Google Maps-style planning workflow. Collapsible segment editors keep the sidebar usable with many fields. State shape mirrors the API payload so analyze sends scenario directly without transformation. Representative line geometries on the map give visual context without requiring full drawing tools for MVP.
**Files changed:** App.jsx (rewritten), defaultScenario.js (new), CitySelector.jsx (new), CorridorPanel.jsx (new), SegmentEditor.jsx (new), AnalyzeActions.jsx (new), mapUtils.js (Seattle added)
**Next:** Execute transit-results-dashboard.md — comparison charts, rankings, and recommendation display.

## 2026-04-04 — Results dashboard (final spec)
**What was built:** 6 dashboard components: RecommendationPanel (best overall + 6 category badges), ResultsSummaryCards (side-by-side metric table), CorridorComparisonChart (Recharts bar chart for carbon/cost/duration + radar chart for disruption/maintenance/buildability/community), SegmentBreakdownTable (expandable per-corridor segment view), SectionTradeoffCard (section family comparison + auto-generated engineering insights about FRC/SCM/production), CommunityImpactNote (plain-language narrative for stakeholders). Results scroll below map while sidebar stays accessible.
**Why this approach:** The spec requires making civil engineering intelligence obvious — not just showing a winner, but showing why it won. Auto-generated insights explain thinner slab volume savings, SCM cement reduction, and buildability constraints from traffic/utilities. Radar chart makes score tradeoffs visually immediate. All 6 components under 150 lines each.
**Files changed:** RecommendationPanel.jsx (new), ResultsSummaryCards.jsx (new), CorridorComparisonChart.jsx (new), SegmentBreakdownTable.jsx (new), SectionTradeoffCard.jsx (new), CommunityImpactNote.jsx (new), App.jsx (updated)
**Next:** All 5 specs complete. Next priorities: deploy to Netlify, create GitHub repo, polish demo flow, tune presets.
