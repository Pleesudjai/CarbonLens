# Feature Spec: Transit Results Dashboard
Date: 2026-04-04
Layer: frontend

## What We're Building

A results layer that shows corridor comparison, section tradeoffs, real-world planning factors, and a clear recommendation after the analysis API returns data.

This view must make the civil engineering intelligence obvious. The key is not only showing a winner, but showing why it won.

## Inputs / Outputs

- Input: analysis result payload from `/api/analyze`
- Output: charts, summary cards, segment breakdown, and recommendation text

## Files to Create or Edit

- `src/frontend/src/App.jsx` - mount results state and pass props
- `src/frontend/src/components/ResultsSummaryCards.jsx` - top-line metrics
- `src/frontend/src/components/CorridorComparisonChart.jsx` - carbon, cost, duration, disruption chart
- `src/frontend/src/components/SegmentBreakdownTable.jsx` - segment-by-segment view
- `src/frontend/src/components/SectionTradeoffCard.jsx` - explain section family changes
- `src/frontend/src/components/RecommendationPanel.jsx` - best overall, lowest carbon, fastest
- `src/frontend/src/components/CommunityImpactNote.jsx` - plain-language summary for stakeholders

## Required Metrics To Display

- total embodied carbon
- carbon per linear foot
- conceptual cost
- conceptual duration
- disruption score
- maintenance risk score
- buildability score
- community benefit score
- best overall corridor
- lowest-carbon corridor
- highest-community-benefit corridor
- fastest corridor
- corridor context signals for:
  - road CO2 pressure
  - mode-shift opportunity
  - construction carbon penalty

## Chart Requirements

Use `Recharts`.

At minimum show:

- corridor comparison bar chart for:
  - carbon
  - cost
  - duration
- grouped or radar chart for:
  - disruption
  - maintenance
  - buildability
  - community benefit

## Recommendation Requirements

The recommendation panel should show:

- best overall option
- lowest carbon option
- lowest cost option
- fastest option
- highest community benefit option
- short narrative explaining the tradeoff

The recommendation narrative should be able to reference carbon-context layers such as:

- where roadway emissions pressure is high today
- where rail could shift more trips out of cars
- where structure or flood constraints raise embodied-carbon cost

The tone should be:

- collaborative
- transparent
- decision-support oriented

## Section Tradeoff Explanation

Each corridor result should include enough metadata for the frontend to explain:

- why a thinner slab lowered carbon
- whether fiber or SCM changes affected cost
- whether duration improved because of higher assumed production rate
- whether a corridor became harder to build because of traffic, utilities, or right-of-way limits
- whether a corridor scored higher in community value because of population, jobs, or transfer access

Do not hide the engineering story behind only aggregate numbers.

## UX Requirements

- results should appear without page navigation
- the user should still see the scenario builder while reviewing results
- the user should be able to compare corridors side by side
- the best overall recommendation should be visually prominent but not the only view
- the dashboard should connect map overlays to corridor results instead of treating them as separate systems

## Implementation Steps

1. [ ] Add results state to `App.jsx`
2. [ ] Build summary cards for top metrics
3. [ ] Build corridor comparison chart using Recharts
4. [ ] Build segment breakdown table
5. [ ] Build recommendation panel
6. [ ] Build a plain-language community summary block
7. [ ] Add carbon-context chips or summary rows for road pressure, mode-shift opportunity, and construction carbon penalty
8. [ ] Ensure the loading, success, and error states are all visible and clear

## Demo Test

Use the Phoenix starter scenario. The results view should make it easy to say:

- which corridor is lowest carbon
- which corridor is fastest
- which corridor serves more people and stronger transit connections
- which corridor is best balanced
- what changed at the section level to produce that result
- what changed in traffic or density factors to produce that result
- how the carbon-focused map overlays support that recommendation

## Out of Scope

- PDF export
- multi-scenario save history
- AI chat mode
- collaboration comments
