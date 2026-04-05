function formatTonnes(value) {
  if (!Number.isFinite(value)) return '--'
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function widthPct(value, maxValue) {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) return 0
  return Math.max(0, Math.min(100, (value / maxValue) * 100))
}

export default function StructureCarbonBar({
  embodiedT,
  constructionT,
  totalT,
  maxTotalT,
  compact = false,
  scaleLabel = 'Comparison scale max',
  helperText,
}) {
  const embodiedWidth = widthPct(embodiedT, maxTotalT)
  const constructionWidth = widthPct(constructionT, maxTotalT)
  const totalWidth = widthPct(totalT, maxTotalT)
  const constructionShare = totalT > 0 ? Math.round((constructionT / totalT) * 100) : 0

  return (
    <div className={compact ? 'space-y-2' : 'space-y-2.5'}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
          Material: {formatTonnes(embodiedT)} t/mi
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-700">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          During Build: {formatTonnes(constructionT)} t/mi
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
          Total: {formatTonnes(totalT)} t/mi CO2e
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400">
          <span>Carbon per mile</span>
          <span>{constructionShare}% from build work</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <div className="flex h-full" style={{ width: `${totalWidth}%` }}>
            <div className="h-full bg-emerald-600" style={{ width: `${embodiedWidth}%` }} />
            <div className="h-full bg-amber-500" style={{ width: `${constructionWidth}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>0 t/mi</span>
          <span>{scaleLabel}: {formatTonnes(maxTotalT)} t/mi</span>
        </div>
        {!compact && (
          <p className="text-[10px] leading-relaxed text-gray-400">
            {helperText || 'Gray background = unused space up to the comparison scale max. During build = traffic delay, detours, and construction equipment.'}
          </p>
        )}
      </div>
    </div>
  )
}
