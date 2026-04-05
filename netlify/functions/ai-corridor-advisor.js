import Anthropic from '@anthropic-ai/sdk'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals
  return Math.round((Number(value) || 0) * factor) / factor
}

function extractTextContent(message) {
  return (message?.content || [])
    .filter((block) => block?.type === 'text')
    .map((block) => block.text || '')
    .join('\n')
    .trim()
}

function safeJsonParse(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

function summarizeCorridor(corridor) {
  const totals = corridor?.totals || {}
  const segments = corridor?.segmentResults || []
  const worstSegment = [...segments]
    .sort((a, b) => (b?.metrics?.constructionPhaseCarbonKg || 0) - (a?.metrics?.constructionPhaseCarbonKg || 0))[0]

  return {
    id: corridor.id,
    name: corridor.name,
    lengthMi: round(totals.lengthMi, 2),
    totalCarbonTons: round((totals.totalCarbonKg || 0) / 1000, 1),
    totalCarbonPerMi: round((totals.totalCarbonKgPerMi || 0) / 1000, 1),
    materialCarbonPerMi: round((totals.carbonKgCo2ePerMi || 0) / 1000, 1),
    duringBuildCarbonPerMi: round((totals.constructionPhaseCarbonKgPerMi || 0) / 1000, 1),
    costMillionUsd: round((totals.costUsd || 0) / 1e6, 2),
    durationDays: round(totals.durationDays, 1),
    disruptionScore: round(totals.disruptionScore, 1),
    buildabilityScore: round(totals.buildabilityScore, 1),
    communityBenefitScore: round(totals.communityBenefitScore, 1),
    constructionPenaltyScore: round(totals.constructionCarbonPenaltyScore, 1),
    affectedTrafficShareAvgPct: round((totals.affectedTrafficShareAvg || 0) * 100, 1),
    detourTrafficShareAvgPct: round((totals.detourTrafficShareAvg || 0) * 100, 1),
    stagedConstructionFactorAvg: round(totals.stagedConstructionFactorAvg, 2),
    dominantConstructionSegment: worstSegment
      ? {
          label: worstSegment.label,
          type: worstSegment.segmentType,
          context: worstSegment.context,
          floodRisk: worstSegment?.liveContext?.flood?.risk || worstSegment?.factors?.floodRisk || 'unknown',
          duringBuildCarbonTons: round((worstSegment?.metrics?.constructionPhaseCarbonKg || 0) / 1000, 1),
          affectedTrafficSharePct: round(((worstSegment?.metrics?.constructionPhaseAssumptions?.affectedTrafficShare || 0) * 100), 1),
          stagedConstructionFactor: round(worstSegment?.metrics?.constructionPhaseAssumptions?.stagedConstructionFactor, 2),
        }
      : null,
  }
}

function buildPrompt({ scenario, analysis, lens }) {
  const recommendation = analysis?.recommendation || {}
  const payload = {
    cityId: analysis?.meta?.cityId || scenario?.cityId || 'unknown',
    projectName: analysis?.meta?.projectName || scenario?.projectName || 'Untitled Scenario',
    planningGoal: analysis?.meta?.planningGoal || scenario?.planningGoal || '',
    lens: lens || 'planner',
    recommendation,
    liveContext: analysis?.meta?.liveContext || null,
    corridors: (analysis?.corridorResults || []).map(summarizeCorridor),
  }

  return [
    'Use the deterministic corridor results below as the source of truth.',
    'Do not invent metrics, new calculations, or fake certainty.',
    'Return strict JSON only with this shape:',
    '{',
    '  "summary": "1 short paragraph",',
    '  "decision": "1 sentence on which corridor currently looks strongest and why",',
    '  "risks": ["risk 1", "risk 2", "risk 3"],',
    '  "nextSteps": ["next step 1", "next step 2", "next step 3"],',
    '  "constructionInsight": "1-2 sentences explaining during-build carbon using affected traffic share, staged construction, and corridor type in plain language"',
    '}',
    '',
    'Write in scientific but easy language for planners and normal people.',
    'If one corridor has much higher total carbon mainly because of during-build traffic exposure, say that directly.',
    '',
    JSON.stringify(payload, null, 2),
  ].join('\n')
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed. Use POST.' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonResponse(200, {
      available: false,
      error: 'ANTHROPIC_API_KEY is not configured for this environment.',
    })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON in request body' })
  }

  const { scenario, analysis, lens = 'planner' } = body
  if (!analysis?.corridorResults?.length) {
    return jsonResponse(400, { error: 'analysis.corridorResults is required.' })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 700,
      temperature: 0.2,
      system:
        'You are a transit corridor planning advisor. You sit on top of a deterministic engineering model and must not change or recalculate the model outputs. You explain the tradeoffs clearly and conservatively.',
      messages: [
        {
          role: 'user',
          content: buildPrompt({ scenario, analysis, lens }),
        },
      ],
    })

    const text = extractTextContent(message)
    const advisor = safeJsonParse(text)

    if (!advisor) {
      return jsonResponse(502, {
        available: false,
        error: 'Claude returned a response that could not be parsed as JSON.',
        rawText: text,
      })
    }

    return jsonResponse(200, {
      available: true,
      model: DEFAULT_MODEL,
      advisor,
      usage: message.usage || null,
    })
  } catch (error) {
    return jsonResponse(502, {
      available: false,
      error: 'Claude advisor request failed.',
      message: error.message,
    })
  }
}
