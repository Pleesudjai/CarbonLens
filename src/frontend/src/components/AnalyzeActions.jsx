export default function AnalyzeActions({ onAnalyze, onReset, loading, hasResults, disabled = false }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <button
        onClick={onAnalyze}
        disabled={loading || disabled}
        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Analyzing...
          </span>
        ) : disabled ? (
          'Add a Corridor First'
        ) : (
          'Analyze Corridors'
        )}
      </button>
      {hasResults && (
        <button
          onClick={onReset}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          Reset
        </button>
      )}
    </div>
  )
}
