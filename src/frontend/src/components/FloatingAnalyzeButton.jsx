export default function FloatingAnalyzeButton({ onAnalyze, loading, visible }) {
  if (!visible) return null
  return (
    <button
      onClick={onAnalyze}
      disabled={loading}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Analyzing...
        </span>
      ) : (
        'Analyze Corridors'
      )}
    </button>
  )
}
