# Feature Spec: CarbonLens UI Polish (4 Enhancements)
Date: 2026-04-04
Layer: frontend

## What We're Building

Four UI enhancements inspired by competitive transit-planner UX that make CarbonLens feel production-grade for demo day: letter-grade corridor badges, map stats overlay, collapsible sidebar, and stakeholder lens toggle. No new dependencies. All components stay under 150 lines.

## Inputs / Outputs

- Input: existing `results` state from analysis API, `activeCorridorId`, scenario state
- Output: richer visual feedback, better demo flow, stakeholder-aware decision support

## Implementation Phases

### Phase 1: Letter-Grade Badges on Corridor Cards

Add A/B/C grades to each corridor card after analysis runs.

- Rank corridors by `compositeScore` (lower = better): best gets A, next B, last C
- Colored pill badge: A = emerald, B = blue, C = amber
- Only visible when `corridorResults` exist

**Files:**
- `src/frontend/src/components/CorridorPanel.jsx` — add `corridorResults` prop, grade logic, badge render (~20 lines added)
- `src/frontend/src/App.jsx` — pass `corridorResults={results?.corridorResults}` to CorridorPanel (+1 line)

### Phase 2: Map Corridor Stats Overlay

Floating white card on the map showing active corridor key stats.

- Shows: total length, carbon (tonnes), cost ($M), buildability score
- Updates when user clicks different corridors
- Only renders when results exist
- Positioned absolute bottom-left of map with `z-10`

**Files:**
- `src/frontend/src/components/MapStatsOverlay.jsx` — NEW (~65 lines)
- `src/frontend/src/App.jsx` — add import + render inside map container (+2 lines)

### Phase 3: Collapsible Sidebar + Header Extract

Toggle sidebar visibility so map can go full-width during presentation.

- Extract header into `Header.jsx` to free App.jsx line budget
- `sidebarOpen` state with toggle button in header
- When collapsed: sidebar hidden, map takes full width
- `FloatingAnalyzeButton` appears bottom-right when sidebar hidden

**Files:**
- `src/frontend/src/components/Header.jsx` — NEW (~30 lines)
- `src/frontend/src/components/FloatingAnalyzeButton.jsx` — NEW (~35 lines)
- `src/frontend/src/App.jsx` — extract header, add sidebarOpen state, conditional sidebar

### Phase 4: Stakeholder Lens Toggle

Three perspectives that highlight different metrics: Planner, Contractor, Community.

- Planner highlights: carbon, duration, community benefit
- Contractor highlights: cost, buildability, duration
- Community highlights: community benefit, disruption
- Same data, different emphasis — highlighted rows get emerald tint + bold
- Contextual note in RecommendationPanel

**Files:**
- `src/frontend/src/components/StakeholderLensToggle.jsx` — NEW (~40 lines)
- `src/frontend/src/components/ResultsSummaryCards.jsx` — add `lens` prop, row highlighting (+10 lines)
- `src/frontend/src/components/RecommendationPanel.jsx` — add `lens` prop, context note (+8 lines)
- `src/frontend/src/App.jsx` — add `lens` state, pass to components (+5 lines)

## Files Summary

### New Files
| File | Est. Lines |
|------|-----------|
| `MapStatsOverlay.jsx` | ~65 |
| `FloatingAnalyzeButton.jsx` | ~35 |
| `StakeholderLensToggle.jsx` | ~40 |
| `Header.jsx` | ~30 |

### Modified Files
| File | Current | Est. Final |
|------|---------|-----------|
| `App.jsx` | 136 | ~144 |
| `CorridorPanel.jsx` | 56 | ~76 |
| `ResultsSummaryCards.jsx` | 52 | ~62 |
| `RecommendationPanel.jsx` | 30 | ~38 |

## Demo Test

1. Load app — see Phoenix map, 3 corridors in sidebar (no grades yet)
2. Click Analyze — grades (A/B/C) appear on corridor cards, map overlay shows active corridor stats
3. Click different corridors — overlay updates with that corridor's carbon/cost/buildability
4. Toggle sidebar closed — map goes full-width, floating analyze button appears
5. Toggle Planner/Contractor/Community lens — highlighted metrics change in results table
6. Switch city — results clear, grades and overlay disappear cleanly

## Out of Scope

- Animated transitions (CSS transitions are fine, no spring/framer-motion)
- New npm dependencies
- Changes to the analysis engine or API
- Mobile responsive layout
- Dark mode toggle
