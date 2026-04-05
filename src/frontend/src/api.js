const API_BASE = '/api'

/**
 * Send a scenario payload to the analysis API and return ranked results.
 * @param {object} payload - scenario with cityId, corridors, etc.
 * @returns {Promise<object>} analysis result
 */
export async function analyzeScenario(payload) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `API error: ${res.status}`)
  }

  return res.json()
}

/**
 * Load the default Phoenix preset analysis (sends empty body).
 * The API falls back to the built-in Phoenix scenario.
 * @returns {Promise<object>} analysis result
 */
export async function analyzePreset() {
  return analyzeScenario({})
}

/**
 * Load live background overlay data for the map.
 * @param {string} cityId
 * @returns {Promise<object>}
 */
export async function getBackgroundOverlays(cityId = 'phoenix') {
  const res = await fetch(`${API_BASE}/background-overlays?city=${encodeURIComponent(cityId)}&refresh=1`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.message || err.error || `API error: ${res.status}`)
  }

  return res.json()
}

/**
 * Ask the secure backend Claude advisor to interpret deterministic corridor results.
 * @param {{scenario?: object, analysis: object, lens?: string}} payload
 * @returns {Promise<object>}
 */
export async function getAiCorridorAdvisor(payload) {
  const res = await fetch(`${API_BASE}/ai-corridor-advisor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || err.message || `API error: ${res.status}`)
  }

  return res.json()
}
