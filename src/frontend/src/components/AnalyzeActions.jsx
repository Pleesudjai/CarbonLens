export default function AnalyzeActions({ onAnalyze, onReset, loading, hasResults }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <button
        onClick={onAnalyze}
        disabled={loading}
        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Analyzing...
          </span>
        ) : (
          'Analyze Corridors'
        )}
      </button>
      {hasResults && (
        <button
          onClick={onReset}
          className="rounded-lg border border-gray-600 px-3 py-2.5 text-sm text-gray-400 hover:border-gray-500 hover:text-white"
        >
          Reset
        </button>
      )}
    </div>
  )
}
