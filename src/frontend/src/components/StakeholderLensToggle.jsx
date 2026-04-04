const LENSES = [
  { id: 'planner', label: 'Planner', desc: 'Carbon, schedule, community' },
  { id: 'contractor', label: 'Contractor', desc: 'Cost, buildability, schedule' },
  { id: 'community', label: 'Community', desc: 'Benefit, disruption, equity' },
]

export default function StakeholderLensToggle({ lens, onLensChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">View as</span>
      {LENSES.map((l) => (
        <button key={l.id} onClick={() => onLensChange(l.id)}
          title={l.desc}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            lens === l.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
          }`}>
          {l.label}
        </button>
      ))}
    </div>
  )
}
