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
