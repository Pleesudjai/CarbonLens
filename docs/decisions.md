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
