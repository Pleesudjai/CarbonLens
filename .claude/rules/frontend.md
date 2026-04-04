---
paths:
  - "src/frontend/**/*.jsx"
  - "src/frontend/**/*.js"
  - "src/frontend/**/*.css"
---

# Frontend Conventions

## Stack
React 18 + Vite 5 + Tailwind 3 + Recharts + MapLibre GL JS

## Rules
- Keep components under 150 lines
- All API calls go through `src/frontend/src/api.js`
- Use functional components with hooks only
- Responsive design — mobile-first

## Anti-patterns
- Never put fetch/axios calls directly in components
- Never inline Tailwind classes longer than ~10 utilities — extract to a class
