const CORRIDOR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500']

const GRADE_STYLES = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  B: 'bg-blue-100 text-blue-700 border-blue-300',
  C: 'bg-amber-100 text-amber-700 border-amber-300',
}
const GRADE_LETTERS = ['A', 'B', 'C']

function buildGradeMap(corridorResults) {
  if (!corridorResults?.length) return {}
  const sorted = [...corridorResults].sort((a, b) => a.totals.compositeScore - b.totals.compositeScore)
  const map = {}
  sorted.forEach((c, i) => { map[c.id] = GRADE_LETTERS[i] || 'C' })
  return map
}

export default function CorridorPanel({
  corridors, activeCorridorId, corridorResults, onSelectCorridor, onRenameCorridor,
  onAddCorridor, onRemoveCorridor, onAddSegment,
}) {
  const grades = buildGradeMap(corridorResults)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Corridors</h3>
        {corridors.length < 3 && (
          <button onClick={onAddCorridor}
            className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100">
            + Add
          </button>
        )}
      </div>

      {corridors.map((c, i) => {
        const active = c.id === activeCorridorId
        const grade = grades[c.id]
        return (
          <div key={c.id}
            className={`rounded-lg border p-3 transition-colors cursor-pointer ${
              active ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onSelectCorridor(c.id)}
          >
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${CORRIDOR_COLORS[i]}`} />
              <input
                value={c.name}
                onChange={(e) => onRenameCorridor(c.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent text-sm font-medium text-gray-800 focus:outline-none"
              />
              {grade && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${GRADE_STYLES[grade]}`}>
                  {grade}
                </span>
              )}
              {corridors.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); onRemoveCorridor(c.id) }}
                  className="text-xs text-gray-400 hover:text-red-500">x</button>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
              <span>{c.segments.length} segment{c.segments.length !== 1 ? 's' : ''}</span>
              <span>{c.segments.reduce((s, seg) => s + (seg.lengthFt || 0), 0).toLocaleString()} ft</span>
            </div>
            {active && (
              <button onClick={(e) => { e.stopPropagation(); onAddSegment(c.id) }}
                className="mt-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200">
                + Add Segment
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
