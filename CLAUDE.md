# Innovation Hacks 2.0 - Amazon Sustainability Track

## Event
- **Hackathon:** Innovation Hacks 2.0
- **Track:** Amazon's Sustainability Challenge
- **Date:** April 4-6, 2026 (weekend hackathon)

## Project: GreenRoute Transit

**Embodied Carbon Transit Design Assistant**

GreenRoute Transit is a conceptual planning tool for agencies, consultants, contractors, and community-facing planning teams. It compares rail corridor alternatives using embodied carbon, cost, schedule, disruption, buildability, and community-benefit logic.

Core product message:

`Google Maps helps communities see the city. Our tool helps planners, agencies, and communities choose the lowest-carbon, most buildable rail corridor together.`

## Active Product Scope

The current MVP focuses on:

1. `Corridor planning`
   - choose a city preset
   - compare up to 3 conceptual rail corridors
   - split each corridor into segment types such as at-grade median running, embedded urban street section, station zone, elevated crossing, and bridge approach

2. `Section comparison`
   - compare slab and guideway section families such as:
     - conventional reinforced concrete
     - thinner steel-fiber-reinforced slab
     - lower-cement SCM-rich slab

3. `Transparent planning factors`
   - traffic intensity
   - intersection density
   - utility conflict risk
   - right-of-way width
   - population catchment
   - job catchment
   - transit dependency
   - transfer connectivity
   - heat exposure

4. `Decision support outputs`
   - embodied carbon
   - conceptual cost
   - conceptual duration
   - disruption
   - maintenance risk
   - buildability
   - community benefit

## Challenge Brief

**Theme:** The climate crisis demands creative, scalable solutions.

**Goal:** Build a project that helps individuals, businesses, or communities:
1. **Reduce waste**
2. **Lower their carbon footprint**
3. **Make more sustainable purchasing decisions**
4. **Measure their environmental impact**

**Key requirement:** Ideas must be **actionable today** and **scalable tomorrow**.

## Judging Criteria

| Criterion | What judges look for |
|---|---|
| **Innovation** | Novel approach - not just another carbon calculator. Creative use of technology or framing. |
| **Technical Execution** | Working prototype, clean code, solid architecture. Demonstrate it works, not just a slide deck. |
| **Environmental Impact** | Quantifiable or clearly arguable positive environmental outcome. Show the "so what?" |
| **Feasibility** | Could this realistically be adopted? Consider cost, user behavior, infrastructure, and scaling path. |

## Strategy Notes

- Amazon is the sponsor - solutions that touch infrastructure, logistics networks, mobility access, scalable planning, or construction feasibility can still resonate strongly.
- A strong submission should have a **live demo** and a clear **impact metric** such as `kg CO2e saved per corridor`, `construction days reduced`, or `community access improved`.
- Balance ambition with a working MVP - judges reward execution over slide-ware.
- The strongest differentiator is the team's real civil engineering knowledge, especially slab optimization, buildability constraints, and practical construction tradeoffs.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind 3 |
| Maps | MapLibre GL JS |
| Charts | Recharts |
| Analysis Engine | Deterministic JavaScript modules in `src/backend/analysis` |
| Backend | Netlify Functions (Node.js) |
| AI Insights | Claude API (optional narrative only after deterministic analysis works) |
| Deploy | Netlify |

## File Structure

```text
02 Innovation Hacks 2.0/
|-- CLAUDE.md                      <- This file - project rules and architecture
|-- .gitignore
|-- netlify.toml                   <- Build and deploy config
|-- package.json                   <- Root
|-- .claude/
|   |-- commands/                  <- /commit, /execute, /handoff, /plan-feature, /prime
|   |-- rules/                     <- frontend.md, backend.md, gee-layer.md
|   `-- docs/
|-- specs/                         <- Feature specs (write before building)
|-- scripts/                       <- Automation and build scripts
|-- docs/                          <- decisions.md, handoff.md
|-- src/
|   |-- frontend/                  <- React + Vite app
|   |   |-- src/
|   |   |   |-- components/        <- React components (<150 lines each)
|   |   |   |-- App.jsx            <- Main layout
|   |   |   |-- api.js             <- All API calls go here
|   |   |   |-- main.jsx           <- Entry point
|   |   |   `-- index.css          <- Tailwind imports
|   |   |-- package.json
|   |   |-- vite.config.js
|   |   `-- tailwind.config.js
|   `-- backend/
|       |-- gee/                   <- Legacy exploration area - not part of the active MVP unless a spec says so
|       |-- analysis/              <- Transit carbon, buildability, and community-benefit calculations
|       `-- requirements.txt
`-- netlify/
    `-- functions/                 <- Serverless API endpoints
```

## Coding Standards

- **Components:** Max 150 lines. One concern per file.
- **API calls:** All go through `src/frontend/src/api.js`.
- **Netlify Functions:** Return `{ statusCode, body: JSON.stringify({...}) }`.
- **Analysis engine:** Keep formulas deterministic, transparent, and easy to tune.
- **Heuristics:** Label conceptual factors clearly. Avoid false precision.
- **Commits:** Use `/commit` command. Types: feat, fix, data, deploy, refactor, docs.

## Active Data And Modeling Guidance

- Use editable presets and constants instead of hard-coding assumptions.
- Traffic should mainly affect disruption, duration, cost premiums, and buildability.
- Population, jobs, transfer access, and transit dependency should mainly affect community-benefit scoring.
- Utilities, right-of-way width, and flood risk should mainly affect buildability and schedule risk.
- Section choices should clearly affect concrete volume, steel quantities, duration, and embodied carbon.
- Treat all early scoring as conceptual planning support, not final design validation.

## Context Management (WISC Framework)

| Strategy | How we apply it |
|----------|----------------|
| **Write** | Externalize to `docs/decisions.md`, `docs/handoff.md`, git commits |
| **Isolate** | Sub-agents for research only - return 3-5 bullet summaries, never raw content |
| **Select** | `.claude/rules/*.md` auto-load by `paths:` frontmatter. Load only CLAUDE.md + one spec at a time |
| **Compress** | Run `/handoff` at ~50 messages, then start fresh with `/prime` |

### 3-Tier Context System

| Tier | Location | Loading |
|------|----------|---------|
| 1 - Global | `CLAUDE.md` | Always loaded (<500 lines) |
| 2 - Domain | `.claude/rules/*.md` | Auto-loaded when touching matching files |
| 3 - Reference | `.claude/docs/*.md` | Sub-agent scouts only - never auto-loaded |

## Session Workflow

1. **Start:** Run `/prime` to load context
2. **Plan:** Run `/plan-feature` before building anything new
3. **Build:** Run `/execute` with a spec file in a **fresh session**
4. **Save:** Run `/commit` after each meaningful change
5. **End:** Run `/handoff` to capture state for next session

## Active References

- `specs/README.md` - execution order and current spec set
- `specs/transit-carbon-assistant-product-spec.md` - product definition
- `.claude/docs/valley-metro-frc-case-study.md` - real FRC precedent and impact narrative
- `Github_repo/repo_pool.md` - broader repo inspiration pool

## Important Note On Legacy Files

If older references to supply chain, satellite analysis, or GEE appear elsewhere in the repo, treat them as legacy unless the current spec explicitly calls for them.

## Team
*(Add team members here)*
