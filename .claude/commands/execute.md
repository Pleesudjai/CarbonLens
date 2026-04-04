# /execute - Implementation

Use in a FRESH session to implement a spec. Load only: `CLAUDE.md` + the spec file.

## Before Coding
- Confirm which spec file we're executing (`specs/[name].md`)
- Confirm which layer: frontend / netlify-function / backend-module / gee-script
- Load the relevant domain rule:
  - Frontend work -> read `.claude/rules/frontend.md`
  - Netlify function / backend -> read `.claude/rules/backend.md`
  - GEE / legacy map-data work -> read `.claude/rules/gee-layer.md`

## Layer Guide

### Netlify Functions (netlify/functions/)
- Serverless API endpoints (Node.js)
- Return format: `{"statusCode": 200, "body": JSON.stringify({...})}`
- Test locally: `netlify dev` from project root

### Backend (src/backend/)
- `analysis/` -> transit corridor carbon, buildability, and community-benefit calculations
- `gee/` -> legacy exploration area only when a spec explicitly requires it
- Keep modules focused - one file per concern

### Frontend (src/frontend/src/components/)
- API calls go through `src/frontend/src/api.js`
- Keep components under 150 lines

## Implementation Rules
- Follow spec steps in order - check off each as done
- Report blockers immediately - don't spend >5 min stuck
- After each file: manually verify it doesn't break existing flow

## When Done
Run `/commit` to log decisions and git commit.
