# Frontend Inspiration Without Copying

> **Purpose**: UI direction note for `GreenRoute Transit` that captures what to learn from strong transit-planning interfaces without cloning another project.
> **When to use**: When designing the frontend, writing Stitch prompts, planning component structure, or checking whether the interface still feels original.
> **Source**: Design reflection on adjacent transit-planning interfaces reviewed on 2026-04-04, especially `evanzyang91/transit-planner`.
> **Size**: Short reference note for future frontend and product sessions.

---

## Core Rule

Be inspired by the `workflow`, not the `surface design`.

Safe to borrow:

- interaction patterns
- information hierarchy
- map-first planning flow
- comparison behavior
- context layer toggles

Do not copy:

- layout proportions line-for-line
- card shapes or panel composition exactly
- color palette
- typography choices
- wording, labels, and branding
- the exact page structure

## What We Like About The Adjacent Interface

These patterns are strong and worth learning from:

- full-screen map as the main working canvas
- side panel for route or corridor controls
- draw-first, evaluate-second workflow
- clear alternative comparison
- click-to-inspect details for stations, segments, or locations
- visible contextual overlays such as density, traffic, or ridership

These are good product patterns, not ownership of a visual style.

## How GreenRoute Transit Should Feel Different

The interface should feel like a `planning studio` for communities, agencies, and project teams.

The differentiators should be visible in the UI:

- `embodied carbon`
- `buildability`
- `section optimization`
- `civil engineering context`
- `community benefit`

The app should not feel like a generic rider planner or a clone of a subway sandbox.

## Original Frontend Direction

### Main Workspace

- full-screen map with corridor drawing and segment highlighting
- stronger engineering overlays than a normal transit app
- toggle layers for:
  - traffic
  - population/jobs
  - utilities risk
  - flood or geotechnical risk
  - station catchments

### Right Panel

The right panel should feel like a decision studio, not a trip planner.

Suggested sections:

- corridor alternatives
- segment breakdown
- buildability warnings
- embodied carbon summary
- community benefit summary
- section-family comparison

### Segment Detail Experience

Clicking a segment should show:

- segment type
- why that segment type fits the corridor context
- traffic and disruption concerns
- right-of-way or utility constraints
- section-family options
- carbon, cost, and duration tradeoffs

### Section Comparison Area

This is one of the strongest original features.

Show side-by-side options such as:

- conventional reinforced slab
- steel-fiber-reinforced thinner slab
- lower-cement SCM-rich slab

For each option, show:

- carbon
- cost
- construction duration
- maintenance risk
- constructability notes

## Visual Language Guidance

To avoid feeling derivative:

- use a more engineering-oriented visual system
- prefer structured tags, warnings, status chips, and comparison bars
- use map overlays and segment badges as key visual elements
- keep the tone civic and professional, not consumer-app styled

## Good Design Test

The interface is working if someone can say:

`This feels like a rail corridor planning tool with civil engineering intelligence`

and not:

`This looks like another transit route app`

## Best Summary

The right move is:

- borrow the best interaction ideas
- build a different visual identity
- make the engineering logic visible
- let the product feel original because the workflow centers on corridor buildability and section decisions
