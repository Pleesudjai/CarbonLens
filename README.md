# CarbonLens

**Transit Corridor Partner**

CarbonLens is a transit corridor planning tool that compares rail alternatives by embodied carbon, construction emissions, cost, buildability, and community benefit using live public data — helping agencies choose the lowest-carbon, most buildable route.

Built for **Innovation Hacks 2.0** — Amazon Sustainability Track (April 2026).

🌐 **Live demo:** [regal-faloodeh-9fd58e.netlify.app](https://regal-faloodeh-9fd58e.netlify.app/)

---

## Screenshots

| Map Workspace | Report View |
|---|---|
| ![Map](pics/02.png) | ![Report](pics/04.png) |

| Corridor Comparison | Section Tradeoffs |
|---|---|
| ![Comparison](pics/03.png) | ![Tradeoffs](pics/01.png) |

---

## What it does

1. **Draw** rail corridor alternatives directly on the map
2. **Enrich** each segment with live public data (traffic, population, jobs, flood risk, road network)
3. **Analyze** embodied carbon, during-build carbon, cost, duration, disruption, buildability, and community benefit
4. **Compare** corridors with three stakeholder lenses — Planner, Contractor, Community
5. **Advise** with optional Claude AI narrative grounded in deterministic results

## Carbon Model

$$C_{\text{total}} = C_{\text{material}} + C_{\text{construction}}$$

- **Material carbon** — concrete, rebar, and fiber volumes per segment
- **During-build carbon** — traffic delay, detours, and equipment emissions during construction

Two routes can have similar material carbon but very different total carbon because during-build carbon follows traffic exposure and construction duration, not just structure.

## Live Public Data Sources

| Source | Data |
|---|---|
| ADOT Traffic Sections | AADT and roadway geometry |
| U.S. Census TIGERweb | Block-group population and road network density |
| Census ACS 2023 | Zero-vehicle household share |
| LEHD / LODES | Workplace jobs by block group |
| FEMA NFHL | Flood hazard zones |
| TIGERweb Transportation | Road-network constructability proxy |
| GTFS-derived context | Fixed-guideway stop and route connectivity |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts |
| Maps | MapLibre GL JS |
| Backend | Netlify Functions (Node.js) |
| Analysis | Deterministic JavaScript engine |
| AI Layer | Anthropic Claude API (advisory only) |
| Deploy | Netlify |

## Getting Started

```bash
# Install frontend dependencies
cd src/frontend && npm install

# Install function dependencies
cd ../../netlify/functions && npm install

# Run dev server
cd ../.. && npx netlify dev
```

The app runs at `http://localhost:8888`.

## Project Structure

```
├── CLAUDE.md                     # Project rules and architecture
├── netlify.toml                  # Build and deploy config
├── netlify/functions/            # Serverless API endpoints
│   ├── analyze.js                # Deterministic corridor analysis
│   ├── background-overlays.js    # Live public data overlays
│   └── ai-corridor-advisor.js    # Claude AI narrative advisor
├── src/
│   ├── frontend/src/
│   │   ├── App.jsx               # Main layout
│   │   ├── api.js                # API client
│   │   └── components/           # React components
│   ├── backend/analysis/
│   │   ├── transitCarbonEngine.js    # Core analysis engine
│   │   ├── transitConstants.js       # Editable rates and factors
│   │   └── transitScenarioPresets.js # City presets
│   └── shared/
│       └── fixedGuidewayAnchors.js   # Phoenix transit network model
├── docs/                         # Decisions, handoff, project story
├── specs/                        # Feature specifications
└── pics/                         # Screenshots and media
```

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Optional | Enables Claude AI advisor narrative |

## Team

Built by ASU students at Innovation Hacks 2.0.

## License

MIT
