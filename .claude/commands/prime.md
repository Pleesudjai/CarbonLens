# /prime — Session Initialization

Run this at the START of every new Claude Code session.

## Steps

1. **Read global rules:**
   Read `CLAUDE.md` — has the full architecture, stack, APIs, and coding standards.

2. **Check decisions:**
   Read `docs/decisions.md` — running log of what was built and why.

3. **Check last handoff:**
   Read `docs/handoff.md` — last session's completed work, broken items, and next steps.

4. **Check TODO list:**
   Read `TODO.md` if it exists — outstanding tasks and priorities.

5. **Scan current source:**
   List files in:
   - `netlify/functions/` — serverless API handlers
   - `src/frontend/src/` — React components
   - `src/backend/` — GEE scripts and analysis modules

6. **Check git log:**
   ```bash
   git log --oneline -10
   ```

7. **Report back — 5 bullets:**
   - Project: What stage are we at?
   - What is fully working (end-to-end tested)?
   - What is built but untested or broken?
   - What still needs to be built?
   - Any open blockers (API key, CORS, deploy issue)?
