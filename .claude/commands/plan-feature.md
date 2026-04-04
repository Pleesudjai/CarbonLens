# /plan-feature — Feature Planning

Use BEFORE implementing any new feature. Creates a spec in `specs/` to guide a clean implementation session.

## Feature Areas (for context)
- **Map / Visualization** — MapLibre + satellite imagery overlay + logistics corridors
- **GEE Data** — Google Earth Engine satellite analysis (Sentinel-2, nighttime lights, NDVI, land use)
- **Supply Chain Analysis** — Warehouse detection, port activity, highway logistics density
- **Emissions Engine** — Carbon footprint calculation from logistics activity patterns
- **AI Insights** — Claude-powered interpretation and recommendations
- **Netlify Functions** — Serverless API endpoints

## Steps

1. **Clarify the feature:**
   - What exactly needs to change or be added?
   - Which layer: frontend component / Netlify function / backend module / GEE script?
   - What does success look like at demo time?

2. **Research (sub-agents only — never dump raw content into main context):**
   - For GEE: check dataset availability, band info, temporal coverage
   - For emissions: check EPA/DEFRA emission factor sources
   - For UI: check existing components in `src/frontend/src/components/`

3. **Write spec to `specs/[feature-name].md`:**

   ```markdown
   # Feature Spec: [Name]
   Date: [today]
   Layer: frontend | netlify-function | backend-module | gee-script

   ## What We're Building
   [1-2 sentences]

   ## Inputs / Outputs
   - Input: [what comes in]
   - Output: [what goes out]

   ## Files to Create or Edit
   - `[path]` — [why]

   ## Implementation Steps
   1. [ ] Step 1
   2. [ ] Step 2

   ## Demo Test
   [How will we verify this works in the demo?]

   ## Out of Scope
   - [What we are NOT doing]
   ```

4. **Review with user** before coding starts.

5. **Hand off:** "Open a fresh session, run /prime, then /execute with this spec."