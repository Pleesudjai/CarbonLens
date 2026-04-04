/**
 * analyze.js — Netlify Function for transit corridor analysis.
 * POST /api/analyze
 * Accepts scenario JSON, runs the deterministic engine, returns ranked results.
 */
import { analyzeScenario } from '../../src/backend/analysis/transitCarbonEngine.js'
import { PHOENIX_SCENARIO } from '../../src/backend/analysis/transitScenarioPresets.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

function validatePayload(payload) {
  const errors = []
  if (!payload.cityId) errors.push('Missing cityId')
  if (!Array.isArray(payload.corridors) || payload.corridors.length === 0) {
    errors.push('corridors must be a non-empty array')
  } else {
    payload.corridors.forEach((c, ci) => {
      if (!c.id) errors.push(`corridors[${ci}]: missing id`)
      if (!c.name) errors.push(`corridors[${ci}]: missing name`)
      if (!Array.isArray(c.segments) || c.segments.length === 0) {
        errors.push(`corridors[${ci}]: segments must be a non-empty array`)
      } else {
        c.segments.forEach((s, si) => {
          if (!s.id) errors.push(`corridors[${ci}].segments[${si}]: missing id`)
          if (!s.segmentType) errors.push(`corridors[${ci}].segments[${si}]: missing segmentType`)
          if (!s.lengthFt) errors.push(`corridors[${ci}].segments[${si}]: missing lengthFt`)
          if (!s.sectionFamily && !s.sectionInputs) {
            errors.push(`corridors[${ci}].segments[${si}]: missing sectionFamily or sectionInputs`)
          }
        })
      }
    })
  }
  return errors
}

/**
 * Normalize the request payload to the engine's expected shape.
 * Accepts both `corridorAlternatives` and `corridors` as the array key.
 */
function normalizePayload(raw) {
  return {
    cityId: raw.cityId,
    projectName: raw.projectName || 'Untitled Scenario',
    planningGoal: raw.planningGoal || '',
    corridors: raw.corridors || raw.corridorAlternatives || [],
  }
}

export async function handler(event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  // Method guard
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed. Use POST.' })
  }

  try {
    // Parse body — fall back to Phoenix preset if empty
    let payload
    if (!event.body || event.body.trim() === '' || event.body.trim() === '{}') {
      payload = PHOENIX_SCENARIO
    } else {
      let raw
      try {
        raw = JSON.parse(event.body)
      } catch {
        return jsonResponse(400, { error: 'Invalid JSON in request body' })
      }
      payload = normalizePayload(raw)
    }

    // Validate
    const errors = validatePayload(payload)
    if (errors.length > 0) {
      return jsonResponse(400, { error: 'Validation failed', details: errors })
    }

    // Run engine
    const result = analyzeScenario(payload)
    return jsonResponse(200, result)
  } catch (err) {
    return jsonResponse(500, { error: 'Internal analysis error', message: err.message })
  }
}
