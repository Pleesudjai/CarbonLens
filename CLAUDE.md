# Innovation Hacks 2.0 — Amazon Sustainability Track

## Event
- **Hackathon:** Innovation Hacks 2.0
- **Track:** Amazon's Sustainability Challenge
- **Date:** April 4–6, 2026 (weekend hackathon)

## Project: GreenRoute

**Sustainable Supply Chain Intelligence — Powered by Google Earth Engine**

Use Google Earth Engine (GEE) + JavaScript to analyze satellite imagery of logistics activity (warehouses, ports, highways) and develop smarter supply chain planning that directly reduces net emissions. Intersection of space tech and global supply chains.

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
| **Innovation** | Novel approach — not just another carbon calculator. Creative use of technology or framing. |
| **Technical Execution** | Working prototype, clean code, solid architecture. Demonstrate it works, not just a slide deck. |
| **Environmental Impact** | Quantifiable or clearly arguable positive environmental outcome. Show the "so what?" |
| **Feasibility** | Could this realistically be adopted? Consider cost, user behavior, infrastructure, and scaling path. |

## Strategy Notes

- Amazon is the sponsor — solutions that touch **e-commerce, supply chain, packaging, delivery logistics, or consumer purchasing** are likely to resonate well.
- A strong submission should have a **live demo** and a clear **impact metric** (e.g., "X kg CO2 saved per user per month").
- Balance ambition with a working MVP — judges reward execution over slide-ware.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind 3 |
| Maps | MapLibre GL JS |
| Charts | Recharts |
| Satellite Data | Google Earth Engine (Sentinel-2, VIIRS nighttime lights, Landsat) |
| Backend | Netlify Functions (Node.js) |
| AI Insights | Claude API (Anthropic) |
| Deploy | Netlify |

## File Structure

```
02 Innovation Hacks 2.0/
├── CLAUDE.md                      ← This file — project rules & architecture
├── .gitignore
├── netlify.toml                   ← Build & deploy config
├── package.json                   ← Root
├── .claude/
│   ├── commands/                  ← /commit, /execute, /handoff, /plan-feature, /prime
│   ├── rules/                     ← frontend.md, backend.md, gee-layer.md
│   └── docs/
├── specs/                         ← Feature specs (write before building)
├── scripts/                       ← Automation & build scripts
├── docs/                          ← decisions.md, handoff.md
├── src/
│   ├── frontend/                  ← React + Vite app
│   │   ├── src/
│   │   │   ├── components/        ← React components (<150 lines each)
│   │   │   ├── App.jsx            ← Main layout
│   │   │   ├── api.js             ← All API calls go here
│   │   │   ├── main.jsx           ← Entry point
│   │   │   └── index.css          ← Tailwind imports
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── tailwind.config.js
│   └── backend/
│       ├── gee/                   ← Google Earth Engine scripts
│       ├── analysis/              ← Supply chain & emissions calculations
│       └── requirements.txt
└── netlify/
    └── functions/                 ← Serverless API endpoints
```

## Coding Standards

- **Components:** Max 150 lines. One concern per file.
- **API calls:** All go through `src/frontend/src/api.js`.
- **Netlify Functions:** Return `{ statusCode, body: JSON.stringify({...}) }`.
- **GEE:** Prefer server-side computation. Always filter by date + cloud cover.
- **Commits:** Use `/commit` command. Types: feat, fix, data, deploy, refactor, docs.

## Session Workflow

1. **Start:** Run `/prime` to load context
2. **Plan:** Run `/plan-feature` before building anything new
3. **Build:** Run `/execute` with a spec file
4. **Save:** Run `/commit` after each meaningful change
5. **End:** Run `/handoff` to capture state for next session

## Team
*(Add team members here)*
