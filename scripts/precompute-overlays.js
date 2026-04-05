/**
 * Pre-compute background overlay data for demo day.
 * Runs the same logic as the Netlify function but saves the result as a static JSON file.
 *
 * Usage: node scripts/precompute-overlays.js
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Dynamically import the handler
const { handler } = await import('../netlify/functions/background-overlays.js')

async function main() {
  console.log('Fetching Phoenix overlay data from live APIs...')
  console.log('This may take 30-60 seconds.\n')

  const event = {
    httpMethod: 'GET',
    queryStringParameters: { city: 'phoenix' },
  }

  const response = await handler(event)

  if (response.statusCode !== 200) {
    console.error('Function returned error:', response.statusCode)
    console.error(response.body)
    process.exit(1)
  }

  const outputDir = resolve(__dirname, '../src/frontend/public/overlays')
  mkdirSync(outputDir, { recursive: true })

  const outputPath = resolve(outputDir, 'phoenix.json')
  writeFileSync(outputPath, response.body, 'utf8')

  const sizeKb = Math.round(Buffer.byteLength(response.body) / 1024)
  console.log(`Saved ${sizeKb} KB to ${outputPath}`)

  const data = JSON.parse(response.body)
  const roadCount = data?.layers?.roadCo2Pressure?.features?.length || 0
  const modeShiftCount = data?.layers?.modeShiftOpportunity?.features?.length || 0
  const delayCount = data?.layers?.delayEmissionsHotspots?.features?.length || 0
  console.log(`  Road CO2 Pressure: ${roadCount} features`)
  console.log(`  Mode-Shift Opportunity: ${modeShiftCount} features`)
  console.log(`  Delay Emissions Hotspots: ${delayCount} features`)
  console.log('\nDone. The frontend will use this static file as fallback.')
}

main().catch((err) => {
  console.error('Failed:', err.message)
  process.exit(1)
})
