const CORRIDOR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500']
const CORRIDOR_DOTS = ['text-emerald-400', 'text-blue-400', 'text-amber-400']

export default function CorridorPanel({
  corridors, activeCorridorId, onSelectCorridor, onRenameCorridor,
  onAddCorridor, onRemoveCorridor, onAddSegment,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Corridors</h3>
        {corridors.length < 3 && (
          <button onClick={onAddCorridor}
            className="rounded bg-gray-700 px-2 py-1 text-xs text-emerald-400 hover:bg-gray-600">
            + Add
          </button>
        )}
      </div>

      {corridors.map((c, i) => {
        const active = c.id === activeCorridorId
        return (
          <div key={c.id}
            className={`rounded-lg border p-3 transition-colors cursor-pointer ${
              active ? 'border-emerald-500 bg-gray-700/60' : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
            onClick={() => onSelectCorridor(c.id)}
          >
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${CORRIDOR_COLORS[i]}`} />
              <input
                value={c.name}
                onChange={(e) => onRenameCorridor(c.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent text-sm font-medium text-white focus:outline-none"
              />
              {corridors.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); onRemoveCorridor(c.id) }}
                  className="text-xs text-gray-500 hover:text-red-400">x</button>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
              <span>{c.segments.length} segment{c.segments.length !== 1 ? 's' : ''}</span>
              <span>{c.segments.reduce((s, seg) => s + (seg.lengthFt || 0), 0).toLocaleString()} ft</span>
            </div>
            {active && (
              <button onClick={(e) => { e.stopPropagation(); onAddSegment(c.id) }}
                className="mt-2 rounded bg-gray-600 px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-500">
                + Add Segment
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
