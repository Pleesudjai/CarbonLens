# Session Handoff
Date: 2026-04-05 (Day 2, evening)
Focus: Netlify deployment, build fixes, live data fallback, Claude AI advisor activation

## Completed
- Committed large uncommitted batch (38 files, 3,479 insertions): report view, AI advisor, lens recommendations, metric tooltips, section figures, lazy loading, error boundary
- Fixed Vite production build — replaced broken inline `import('/src/main.jsx')` with standard `<script type="module">` tag
- Pre-computed Phoenix overlay data (4.5 MB static JSON with 6,656 features) as fallback for Netlify's 10-second function timeout
- Updated `api.js` to silently fall back to `/overlays/phoenix.json` when the live API returns 502
- Fixed Netlify build command to install function dependencies (`cd netlify/functions && npm install`)
- Added `[functions]` config to `netlify.toml` with esbuild bundler and `included_files` for `src/shared/`
- Fixed Claude AI advisor model ID — cycled through retired models until landing on `claude-haiku-4-5-20251001`
- Pushed to GitHub (Pleesudjai/CarbonLens) — 8 commits this session
- Netlify site is live and fully functional

## Current State
### Working end-to-end
- Map workspace with MapLibre (Carto Voyager light theme)
- Corridor drawing (click-to-draw with haversine measurement)
- Sidebar with corridor panel + segment editor + planning factors + community factors
- Background data overlays: Road CO2 Pressure, Mode-Shift Opportunity, Delay Emissions Hotspots (via pre-computed fallback)
- Segment preview auto-population from background overlay data (AADT, population, jobs, transit connectivity)
- Deterministic analysis engine (7 metrics: carbon, cost, duration, disruption, maintenance, buildability, community)
- Construction-phase carbon (traffic idle + detour + equipment emissions)
- 3 stakeholder lenses (Planner / Contractor / Community) with weighted recommendation scoring
- Recommendation panel with category badges
- Claude AI advisor narrative (summary, construction insight, risks, next steps)
- Results summary table with metric hover tooltips
- Corridor comparison charts (bar + radar)
- Segment breakdown table
- Section tradeoff card with engineering insights
- Report view toggle (clean read-only layout)
- Resizable map/results split panel
- Lazy loading for heavy components
- Error boundary with boot screen
- Live FEMA Flood + TIGER Roads enrichment

### Built but untested
- Seattle and Portland city presets (geometry exists, no pre-computed overlay data)
- CommunityImpactNote component (exists but may not be rendered in current layout)

### Broken / Incomplete
- App.jsx is 977 lines (should be <150 per coding standards) — works but is a maintenance risk
- SectionTradeoffCard.jsx (427 lines) and SegmentEditor.jsx (362 lines) also over limit
- `docs/handoff.md` and `docs/decisions.md` were stale until this update
- Netlify build credits are limited — avoid unnecessary redeploys
- `presentation-brief.md` has uncommitted changes

## Next Steps (priority order)
1. **Demo rehearsal** — follow the 2-minute demo script in `docs/top-5-actions-before-judging.md`
2. **Presentation slides** — finalize for judging (check `docs/presentation-brief.md`)
3. **App.jsx decomposition** — extract geometry helpers, state management, and report view into separate files (code quality for judges who may glance at repo)
4. **Add 2nd/3rd corridor presets** — demo is stronger when corridors have different winners per category (currently Alt A wins everything)
5. **Commit remaining changes** — `presentation-brief.md` and any other loose files

## Deploy Status
- Netlify live: https://regal-faloodeh-9fd58e.netlify.app/
- GitHub repo: https://github.com/Pleesudjai/CarbonLens
- API keys set in Netlify: [x] ANTHROPIC_API_KEY (claude-haiku-4-5-20251001)
- Last successful deploy: 2026-04-05 (commit 707f4e8)
- Netlify build credits: LIMITED — minimize redeploys

## Open Questions / Blockers
- [ ] Devansh may have a different Anthropic API key — check if newer models (Sonnet 4.5/4.6) are accessible
- [ ] Netlify free tier credits are running low — consider whether remaining deploys are needed
- [ ] Demo scenario tuning — current Phoenix preset has Alt A winning every category; more interesting demo if corridors have different strengths

## Files Modified This Session
- `src/frontend/index.html` — replaced inline dynamic import with script module tag
- `src/frontend/src/api.js` — added static fallback for background overlays
- `src/frontend/src/App.jsx` — committed prior session's large rewrite (report view, resize, geometry, preview)
- `src/frontend/src/main.jsx` — committed error boundary and boot screen
- `src/frontend/src/recommendationUtils.js` — NEW: lens-aware weighted recommendation engine
- `src/frontend/src/components/StructureCarbonBar.jsx` — NEW: stacked embodied+construction carbon bar
- `src/frontend/src/components/*.jsx` — all components updated (report view, tooltips, lens support)
- `src/frontend/public/overlays/phoenix.json` — NEW: pre-computed 4.5 MB overlay data
- `netlify/functions/ai-corridor-advisor.js` — NEW: Claude-powered narrative advisor
- `netlify/functions/background-overlays.js` — updated overlay logic
- `netlify.toml` — added function dep install, esbuild bundler config
- `scripts/precompute-overlays.js` — NEW: script to regenerate static overlay data
- `docs/top-5-actions-before-judging.md` — NEW: demo prep checklist
- `docs/winning-checklist.md` — NEW: judge-facing readiness checklist
- `docs/presentation-brief.md` — NEW: presentation outline
- `specs/carbon-calculation-cross-check.md` — NEW: carbon formula verification
- `pics/` and `src/frontend/public/section-figures/` — FRC and RC cross-section images

## Context for Next Session
The app is live, fully functional, and demo-ready at https://regal-faloodeh-9fd58e.netlify.app/. The strongest demo move is to tune the Phoenix scenario so different corridors win different categories (carbon vs. cost vs. community benefit) — right now Alt A sweeps everything which undersells the tradeoff analysis. The Claude AI advisor is working with Haiku 4.5. Netlify credits are limited so batch any remaining changes into a single push.

**Recommended first action:** Run `/prime`, then tune the default Phoenix scenario presets so Alt A, Alt B, and Alt C each have different strengths.
