# Backend Rules

- Netlify Functions handle all API endpoints (Node.js)
- Return format: `{ statusCode: 200, body: JSON.stringify({...}) }`
- Keep modules focused — one file per concern
- Handle errors gracefully with meaningful status codes
- GEE authentication via service account key (env var)
