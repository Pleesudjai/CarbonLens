# Winning Checklist

Updated: 2026-04-04

Project: `CarbonLens / GreenRoute Transit`

Purpose:
- Judge-facing readiness checklist for `Innovation Hacks 2.0`
- Marked from current repo evidence, not wishful thinking

Basis reviewed:
- `CLAUDE.md`
- `specs/README.md`
- `specs/transit-carbon-overlay-roadmap.md`
- `docs/decisions.md`
- `docs/handoff.md`
- `src/frontend/src/App.jsx`
- `src/frontend/src/components/RecommendationPanel.jsx`
- `src/frontend/src/components/BackgroundLayerControl.jsx`

Legend:
- `[x]` strong and already evidenced in the repo
- `[-]` partially done or still risky for judging
- `[ ]` not yet evidenced in the repo

## Quick Scorecard

- `Innovation`: `[x]`
- `Technical Execution`: `[x]`
- `Environmental Impact`: `[-]`
- `Feasibility`: `[x]`
- `Submission Readiness`: `[ ]`

## Problem And Story

- `[x]` The project has a clear problem: rail corridors are often compared on cost and schedule before carbon and buildability are made visible.
- `[x]` The product is well positioned for the sponsor theme: lower carbon footprint, measurable environmental impact, and community-scale action.
- `[x]` The project is differentiated from generic trip planners and generic carbon calculators.
- `[x]` The strongest differentiator is real civil engineering logic: slab/section tradeoffs, construction carbon, disruption, and buildability.
- `[x]` The Phoenix / Valley Metro context gives the demo a believable real-world anchor.
- `[-]` The final 1-sentence pitch is strong in docs, but it still needs to be fully memorized and used consistently by the team.

## Working Product And Technical Depth

- `[x]` There is a real interactive prototype, not just a concept note.
- `[x]` The app compares multiple corridor alternatives and returns ranked results.
- `[x]` The analysis engine is deterministic and transparent, which is much stronger for judges than black-box output.
- `[x]` The app includes background overlays tied to the carbon story:
  - `Road CO2 Pressure`
  - `Mode-Shift Opportunity`
  - `Delay Emissions Hotspots`
- `[x]` The results side includes `Construction Carbon Penalty`, so the embodied-carbon story is not only a map visualization.
- `[x]` The app uses live public-data sources in the workflow:
  - `ADOT`
  - `Census`
  - `LEHD / LODES`
  - `FEMA NFHL`
  - `U.S. Census Bureau TIGERweb Transportation`
- `[x]` The UI exposes numeric legends and live source badges, which improves technical credibility.
- `[x]` The existing Valley Metro network is shown as a real baseline instead of treating the city as empty space.
- `[-]` The app is strong as a conceptual planning tool, but the team must be careful not to overstate it as final engineering design software.

## Environmental Impact

- `[x]` Embodied carbon is visible in corridor comparison and segment tradeoffs.
- `[x]` The project covers both construction-side carbon and operating-emissions pressure.
- `[x]` The corridor framing makes environmental impact easier to explain than a generic city dashboard would.
- `[-]` The current operating-emissions layers are still proxy-based and should be presented that way.
- `[-]` A tight headline impact claim for judges is still needed, such as:
  - `lower build carbon than a heavier corridor option`
  - `higher mode-shift opportunity in underserved areas`
  - `less disruption and less concrete-intensive structure`
- `[ ]` A single memorable headline metric for the final pitch is not yet documented in the repo.

## Feasibility And Adoption

- `[x]` The user group is credible: agencies, consultants, contractors, and community-facing planning teams.
- `[x]` The workflow is plausible for early corridor screening and alternative comparison.
- `[x]` The reliance on public datasets improves realism and future scalability.
- `[x]` The app clearly supports actionable decisions today, not only long-term research.
- `[-]` A short go-to-market or adoption path should still be stated plainly in the pitch:
  - who uses it first
  - what meeting or decision it helps with
  - why they would trust it
- `[ ]` A business or scaling slide is not yet evidenced in the repo.

## Demo Readiness

- `[x]` Phoenix is a strong default demo city.
- `[x]` Valley Metro gives the team a concrete local transit story.
- `[x]` The recommendation panel gives judges an immediate answer instead of raw tables only.
- `[x]` The results show multiple lenses and tradeoffs, which helps different judges connect with the project.
- `[x]` The demo already has live-data credibility moments that are good for judging.
- `[-]` The local demo has had proxy/dev-server fragility, so a backup plan is still necessary.
- `[ ]` A final 2-minute live demo script is not yet documented in this repo.
- `[ ]` Backup screenshots or a backup video path are not yet documented in this repo.
- `[ ]` A final hosted public demo URL is not yet documented in this repo.

## Submission Assets

- `[ ]` Final pitch deck in repo
- `[ ]` Final submission writeup in repo
- `[ ]` Final demo script in repo
- `[ ]` Final demo video script or storyboard in repo
- `[ ]` Final team list in repo
- `[ ]` Final deployment / public URL in repo
- `[ ]` Final methodology note for assumptions and limitations in repo

## Judge-Facing Winning Moves

- `[x]` Lead with the idea that most transit tools stop at routing or sketching, while this one helps compare what is lower-carbon and more buildable to construct.
- `[x]` Show the live public-data badges early to establish credibility.
- `[x]` Use the Valley Metro baseline to prove the team understands a real system, not a fictional map.
- `[x]` Emphasize that the project combines:
  - corridor planning
  - embodied carbon
  - section optimization
  - buildability
  - community benefit
- `[-]` The pitch should clearly say that delay and mode-shift layers are planning proxies, not exact measured emissions.
- `[-]` The team should avoid spending too much demo time inside low-level UI controls instead of showing the recommendation and decision logic.

## Biggest Risks Before Final Judging

- `[-]` The app could be misunderstood as a generic transit planner if the engineering story is not front and center.
- `[-]` The app could be misunderstood as overclaiming operational CO2 precision if proxy layers are not explained carefully.
- `[-]` The project still needs polished submission assets, not just strong code and specs.
- `[-]` Local-only demo reliability is still a risk unless a public deploy or backup recording is prepared.

## What Already Looks Strongest

- `[x]` The concept is genuinely differentiated.
- `[x]` The repo shows real technical build-out, not just planning notes.
- `[x]` The live public-data integration makes the project feel serious.
- `[x]` The civil/structural engineering angle is the most defensible moat.
- `[x]` The project fits the sponsor theme while still standing out from typical sustainability hackathon ideas.

## Final Winning Checklist

- `[x]` Clear problem and sponsor fit
- `[x]` Novel and defensible product angle
- `[x]` Working prototype with real interaction
- `[x]` Deterministic scoring and comparison logic
- `[x]` Live public-data credibility
- `[x]` Real local case-study grounding
- `[x]` Clear recommendation output
- `[-]` Memorable headline impact claim
- `[-]` Crisp 2-minute demo flow
- `[-]` Explicit limitations / assumptions language for judges
- `[ ]` Hosted public demo link
- `[ ]` Final pitch deck
- `[ ]` Final submission copy
- `[ ]` Backup screenshots or video
- `[ ]` Final team / speaker roles

## Bottom Line

This project already looks like a `strong hackathon contender`, especially on `innovation`, `technical execution`, and `feasibility`.

The biggest gap is no longer the product itself. The biggest gap is `final-mile judging prep`:
- tighten the impact claim
- lock the 2-minute demo story
- deploy or prepare a backup demo
- finish submission assets

If those are closed well, this project has a very real chance to feel like one of the more serious and differentiated entries in the track.
