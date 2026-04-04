# Feature Spec: Transit Analysis API
Date: 2026-04-04
Layer: netlify-function

## What We're Building

A Netlify Function endpoint that accepts scenario payloads from the frontend, runs the deterministic analysis engine, and returns ranked corridor results in the standard project response format.

The function should keep the contract simple:

- receive scenario JSON
- validate and normalize it
- call the engine
- return analysis results

## Inputs / Outputs

- Input: `POST /api/analyze` with scenario payload JSON
- Output: `{ statusCode, body: JSON.stringify({ ...analysis }) }`

## Files to Create or Edit

- `netlify/functions/analyze.js` - request validation, engine call, and response formatting
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
  "meta": {},
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

## Implementation Steps

1. [ ] Create `netlify/functions/analyze.js`
2. [ ] Import the analysis engine from `src/backend/analysis/transitCarbonEngine.js`
3. [ ] Add method guard for `POST`
4. [ ] Parse `event.body`
5. [ ] If body is empty, load the Phoenix starter scenario
6. [ ] Validate required fields
7. [ ] Call `analyzeScenario(payload)`
8. [ ] Return Netlify-standard JSON response
9. [ ] Return clear error messages for bad input

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
