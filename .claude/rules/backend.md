---
paths:
  - "netlify/functions/**/*.js"
  - "src/backend/**/*.js"
  - "src/backend/**/*.py"
---

# Backend Conventions

## Stack
Netlify Functions (Node.js), Python for analysis modules

## Rules
- Return format: `{ statusCode: 200, body: JSON.stringify({...}) }`
- Keep modules focused — one file per concern
- Handle errors gracefully with meaningful status codes
- Validate inputs at function entry points

## Anti-patterns
- Never hardcode API keys — use env vars
- Never return raw error stack traces to the client
