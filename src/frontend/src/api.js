const API_BASE = '/api'

export async function analyzeScenario(payload) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

// Backward-compatible alias while the frontend is being repointed.
export const analyzeRegion = analyzeScenario
