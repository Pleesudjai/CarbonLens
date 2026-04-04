---
paths:
  - "src/backend/gee/**/*"
---

# Google Earth Engine Conventions

## Stack
GEE JavaScript API for satellite imagery analysis

## Key Datasets
- Sentinel-2 (optical), VIIRS nighttime lights, Landsat (land use change)

## Rules
- Always filter by date range and cloud cover
- Prefer server-side computation (ee.Image, ee.Reducer) over client-side
- Cache expensive computations where possible
- Document band selections and index formulas

## Anti-patterns
- Never pull full images client-side — use getThumbURL or export
- Never skip cloud masking on optical imagery
