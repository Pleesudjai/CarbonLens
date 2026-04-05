# Feature Spec: Transit Analysis API
Date: 2026-04-04
Layer: netlify-function

## What We're Building

A Netlify Function endpoint that accepts scenario payloads from the frontend, optionally enriches them with live public-data context, runs the deterministic analysis engine, and returns ranked corridor results in the standard project response format.

The function should keep the contract simple:

- receive scenario JSON
- validate and normalize it
- enrich geometry-aware context where a public source is available
- call the engine
- return analysis results

This spec also defines the background-overlay endpoint that supports carbon-focused planning layers on the map.

## Inputs / Outputs

- Input: `POST /api/analyze` with scenario payload JSON
- Output: `{ statusCode, body: JSON.stringify({ ...analysis }) }`

## Files to Create or Edit

- `netlify/functions/analyze.js` - request validation, engine call, and response formatting
- `netlify/functions/background-overlays.js` - live or cached public-data overlays for the map
- `netlify/functions/package.json` - edit only if a runtime dependency is truly required

## Request Contract

The request body should support:

```json
{
  "cityId": "phoenix",
  "projectName": "West Phoenix Connector",
  "planningGoal": "lowest carbon with manageable disruption",
  "corridorAlternatives": [
    {
      "id": "alt-a",
      "name": "Alt A - Median Running",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-112.099, 33.509],
          [-112.099, 33.465]
        ]
      },
      "segments": [
        {
          "id": "seg-1",
          "segmentType": "at_grade_median_running",
          "lengthFt": 2800,
          "sectionFamily": "fiber_reduced",
          "context": {
            "trafficAadt": 42000,
            "laneCount": 6,
            "intersectionDensityPerMile": 18,
            "utilityDensity": "medium",
            "rowWidthFt": 88,
            "trafficSensitivity": "high",
            "urbanCore": false,
            "nightWorkOnly": false,
            "floodRisk": "low"
          },
          "community": {
            "populationCatchment": 12000,
            "jobCatchment": 9500,
            "zeroCarHouseholdsPct": 14,
            "transferConnectivityScore": 7,
            "heatExposureScore": 8,
            "activityNodeImportance": 8
          }
        }
      ]
    }
  ]
}
```

If the frontend sends no body, the API may fall back to the Phoenix preset for demo convenience.

## Response Contract

Success:

```json
{
  "meta": {
    "liveContext": {}
  },
  "corridorResults": [],
  "recommendation": {}
}
```

Failure:

```json
{
  "error": "Missing corridorAlternatives"
}
```

Return codes:

- `200` for success
- `400` for invalid payload
- `405` for unsupported method
- `500` for unexpected errors

## Background Overlay Contract

Request:

- `GET /api/background-overlays?city=phoenix`

Target stable layer ids:

- `roadCo2Pressure`
- `modeShiftOpportunity`
- `constructionCarbonPenalty`
- `delayEmissionsHotspots`

Migration rule:

- the API may keep temporary aliases for currently shipped layer ids
- `aadt` may alias `roadCo2Pressure`
- `population` may alias `modeShiftOpportunityLite`

Suggested success shape:

```json
{
  "cityId": "phoenix",
  "meta": {
    "mode": "live",
    "overlayVersion": "carbon-v2",
    "sourceSummary": "Live ADOT traffic workbook plus Census population context plus TIGER road-network delay proxy.",
    "legend": {
      "roadCo2Pressure": {
        "unit": "vehicles / day"
      },
      "modeShiftOpportunity": {
        "unit": "index 0-100"
      },
      "delayEmissionsHotspots": {
        "unit": "index 0-100"
      }
    }
  },
  "layers": {
    "roadCo2Pressure": { "type": "FeatureCollection", "features": [] },
    "modeShiftOpportunity": { "type": "FeatureCollection", "features": [] },
    "delayEmissionsHotspots": { "type": "FeatureCollection", "features": [] }
  }
}
```

Phase rules:

- Phase 1:
  - serve `roadCo2Pressure` from live ADOT AADT
  - serve `modeShiftOpportunityLite` from population plus transit-gap starter logic
- Phase 2:
  - upgrade to full `modeShiftOpportunity`
- Phase 3:
  - expose `constructionCarbonPenalty` metadata when the engine can support it
- Phase 4:
  - add `delayEmissionsHotspots` from a defendable live proxy built from ADOT AADT plus TIGER road-network complexity

## Validation Rules

- method must be `POST`
- payload must be valid JSON
- `cityId` must exist
- `corridorAlternatives` must be an array with at least one item
- each corridor must have:
  - `id`
  - `name`
  - `segments`
- each segment must have:
  - `id`
  - `segmentType`
  - `lengthFt`
  - `sectionFamily` or `sectionInputs`
- `context` and `community` may be partial, but the API should fill missing optional fields with defaults from the analysis layer
- `geometry` is optional but strongly preferred for live context enrichment
- when corridor geometry is present, the API should be allowed to derive or overwrite selected segment factors from public data

## Live Context Enrichment

For the current implementation pass, `/api/analyze` should enrich `Construction Carbon Penalty` inputs with:

- corridor line geometry
- segment slicing derived from the corridor line and declared segment lengths
- live FEMA NFHL flood context for each segment
- live Census TIGERweb transportation context for each segment

The API should:

- keep the deterministic engine pure
- perform live public-data fetches before calling the engine
- fall back to the scenario's existing flood setting if live FEMA enrichment fails
- derive constructability proxies such as `intersectionDensityPerMi`, `urbanCore`, `constrainedRow`, and `utilityDensityHigh` from live road-network context when possible
- report enrichment status in `meta.liveContext`

## Implementation Steps

1. [ ] Create `netlify/functions/analyze.js`
2. [ ] Import the analysis engine from `src/backend/analysis/transitCarbonEngine.js`
3. [ ] Add method guard for `POST`
4. [ ] Parse `event.body`
5. [ ] If body is empty, load the Phoenix starter scenario
6. [ ] Validate required fields
7. [ ] If corridor geometry is present, enrich segment flood context from FEMA NFHL before analysis
8. [ ] Call `analyzeScenario(enrichedPayload)`
9. [ ] Attach live enrichment metadata to the response
10. [ ] Return Netlify-standard JSON response
11. [ ] Return clear error messages for bad input
12. [ ] Keep overlay metadata and legend units stable so the frontend does not guess
13. [ ] Prefer backend-side joins for public datasets instead of direct browser calls

## Demo Test

These cases should work:

1. POST with the Phoenix starter scenario returns a ranked result set
2. POST with one corridor and one segment still returns valid totals
3. POST with partial context or community inputs still returns valid totals through defaults
4. GET returns `405`
5. malformed JSON returns `400`

## Out of Scope

- authentication
- persistent storage
- project save/load
- AI-generated narrative from Anthropic
