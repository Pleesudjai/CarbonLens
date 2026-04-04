# Google Earth Engine Rules

- Use GEE JavaScript API for satellite imagery analysis
- Key datasets: Sentinel-2 (optical), VIIRS nighttime lights, Landsat (land use change)
- Always filter by date range and cloud cover
- Prefer server-side computation (ee.Image, ee.Reducer) over client-side
- Cache expensive computations where possible
- Document band selections and index formulas
