import { BACKGROUND_LAYER_OPTIONS } from './backgroundOverlayData'

const LEGEND_CONFIG = {
  roadCo2Pressure: {
    valueKey: 'aadt',
    unitLabel: 'vehicles / day',
    colors: ['#fef3c7', '#f59e0b', '#dc2626', '#7f1d1d'],
  },
  modeShiftOpportunity: {
    valueKey: 'modeShiftOpportunity',
    unitLabel: 'index 0-100',
    colors: ['#fee2e2', '#fca5a5', '#ef4444', '#7f1d1d'],
  },
  delayEmissionsHotspots: {
    valueKey: 'delayEmissionsHotspots',
    unitLabel: 'index 0-100',
    colors: ['#ede9fe', '#c4b5fd', '#8b5cf6', '#4c1d95'],
  },
}

function percentileIndex(values, percentile) {
  if (!values.length) return 0
  return Math.min(values.length - 1, Math.max(0, Math.round((values.length - 1) * percentile)))
}

function formatLegendValue(value) {
  if (!Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

function getLegendStats(layerId, backgroundData) {
  const config = LEGEND_CONFIG[layerId]
  if (!config) return null

  const features = backgroundData?.layers?.[layerId]?.features || []
  const uniqueValues = [...new Set(
    features
      .map((feature) => Number(feature?.properties?.[config.valueKey]))
      .filter((value) => Number.isFinite(value) && value > 0),
  )].sort((a, b) => a - b)

  if (!uniqueValues.length) return null

  return {
    unitLabel: config.unitLabel,
    colors: config.colors,
    low: uniqueValues[0],
    mid: uniqueValues[percentileIndex(uniqueValues, 0.5)],
    high: uniqueValues[uniqueValues.length - 1],
  }
}

export default function BackgroundLayerControl({
  city,
  value,
  onChange,
  hasData,
  loading = false,
  error = null,
  sourceSummary = '',
  backgroundData = null,
}) {
  const selectedIds = Array.isArray(value) ? value : value && value !== 'none' ? [value] : []
  const selectedOptions = BACKGROUND_LAYER_OPTIONS.filter((option) => selectedIds.includes(option.id))
  const legendOptions = selectedOptions.filter((option) => option.id !== 'none')

  const activeTitle = selectedOptions.length === 0
    ? 'No overlays selected'
    : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length} overlays active`

  const activeDescription = selectedOptions.length === 0
    ? 'Base map only'
    : selectedOptions.length === 1
      ? selectedOptions[0].description
      : 'Road CO2, mode-shift opportunity, and delay-emissions hotspots can be shown together.'

  const coverageText = loading
    ? 'Refreshing live public data for this city...'
    : error
      ? `Live API unavailable right now: ${error}. No overlay is shown until live public data returns.`
      : hasData
        ? sourceSummary || `Live public carbon-planning overlays are connected for ${city}.`
        : 'No overlay data is loaded for this city yet.'

  const toggleLayer = (layerId) => {
    if (layerId === 'none') {
      onChange([])
      return
    }

    if (selectedIds.includes(layerId)) {
      onChange(selectedIds.filter((id) => id !== layerId))
      return
    }

    onChange([...selectedIds, layerId])
  }

  return (
    <div className="absolute left-4 top-44 z-10 max-h-[calc(100%-12rem)] w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Carbon Overlay</p>
      <p className="mt-1 text-xs font-semibold text-gray-900">{activeTitle}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{activeDescription}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {BACKGROUND_LAYER_OPTIONS.map((option) => {
          const active = option.id === 'none' ? selectedIds.length === 0 : selectedIds.includes(option.id)
          return (
            <button
              key={option.id}
              onClick={() => toggleLayer(option.id)}
              className={`min-h-[2.5rem] rounded-xl px-3 py-2 text-left text-[11px] font-medium leading-tight transition-colors ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {legendOptions.length > 0 && (
        <div className="mt-3 space-y-2">
          {legendOptions.map((option) => {
            const legend = getLegendStats(option.id, backgroundData)
            if (!legend) return null

            return (
              <div key={option.id} className="rounded-lg border border-gray-200 bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{option.label}</p>
                  <p className="text-[10px] text-gray-500">{legend.unitLabel}</p>
                </div>
                <div
                  className="mt-2 h-3 rounded-full border border-gray-200"
                  style={{ background: `linear-gradient(90deg, ${legend.colors.join(', ')})` }}
                />
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-gray-700">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Low</p>
                    <p className="font-semibold">{formatLegendValue(legend.low)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Mid</p>
                    <p className="font-semibold">{formatLegendValue(legend.mid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">High</p>
                    <p className="font-semibold">{formatLegendValue(legend.high)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedIds.length > 1 && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Overlay Stack</p>
          <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">
            Multiple overlays are active, so colors can overlap on the map.
          </p>
        </div>
      )}

      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Coverage</p>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{coverageText}</p>
      </div>
    </div>
  )
}
