import { useState } from 'react'

const SEGMENT_TYPES = [
  ['at_grade_median', 'At-Grade Median'],
  ['embedded_urban_street', 'Embedded Urban Street'],
  ['station_zone', 'Station Zone'],
  ['elevated_crossing', 'Elevated Crossing'],
  ['bridge_approach', 'Bridge Approach'],
]

const SECTION_FAMILIES = [
  ['conventional_rc', 'Conventional RC'],
  ['fiber_reduced', 'Steel-Fiber (Thinner)'],
  ['low_cement_rc', 'Low-Cement SCM'],
]

const CONTEXTS = [
  ['suburban', 'Suburban'],
  ['urban_arterial', 'Urban Arterial'],
  ['urban_core', 'Urban Core'],
  ['industrial', 'Industrial'],
]

const SEGMENT_TYPE_LABELS = Object.fromEntries(SEGMENT_TYPES)
const CONTEXT_LABELS = Object.fromEntries(CONTEXTS)
const FLOOD_LABELS = { low: 'Low', moderate: 'Moderate', high: 'High' }

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-gray-400">{label}</span>
      {children}
    </label>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  )
}

function StaticField({ label, value, source }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-gray-400">{label}</span>
      <div className="rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs text-gray-800">{value}</div>
      {source && <span className="text-[10px] text-gray-400">{source}</span>}
    </div>
  )
}

function SourceChip({ children }) {
  return (
    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-500">
      {children}
    </span>
  )
}

function Flag({ active, label, source }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div
        className={`rounded border px-2 py-1 text-[11px] ${
          active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-100 text-gray-500'
        }`}
      >
        {label}: {active ? 'Detected' : 'Clear'}
      </div>
      <span className="text-[10px] text-gray-400">{source}</span>
    </div>
  )
}

export default function SegmentEditor({ segment, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false)

  const set = (path, val) => {
    const s = structuredClone(segment)
    const parts = path.split('.')
    let obj = s
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
    obj[parts[parts.length - 1]] = val
    onUpdate(s)
  }

  const f = segment.factors || {}
  const cm = segment.community || {}

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-2.5">
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(!open)} className="text-xs text-gray-400">
          {open ? 'v' : '>'}
        </button>
        <input
          value={segment.label || ''}
          onChange={(e) => set('label', e.target.value)}
          className="flex-1 bg-transparent text-xs font-medium text-gray-800 focus:outline-none"
          placeholder="Segment label"
        />
        <span className="text-[10px] text-gray-400">{(segment.lengthFt || 0).toLocaleString()} ft</span>
        <button onClick={onRemove} className="text-xs text-gray-400 hover:text-red-500">
          x
        </button>
      </div>

      {open && (
        <div className="mt-2 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StaticField
              label="Type"
              value={SEGMENT_TYPE_LABELS[segment.segmentType] || segment.segmentType}
              source="Auto-classified from alignment + roadway context"
            />
            <Field label="Section">
              <Select value={segment.sectionFamily} onChange={(e) => set('sectionFamily', e.target.value)} options={SECTION_FAMILIES} />
            </Field>
            <StaticField
              label="Length (ft)"
              value={(segment.lengthFt || 0).toLocaleString()}
              source="Derived from map geometry"
            />
            <StaticField
              label="Context"
              value={CONTEXT_LABELS[segment.context] || segment.context}
              source="AZDOT / local roadway classification"
            />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Planning Factors</p>
          <p className="text-[11px] text-gray-500">These are public-data inputs, not manual design choices.</p>
          <div className="grid grid-cols-2 gap-2">
            <StaticField
              label="Traffic AADT"
              value={(f.trafficAadt ?? 0).toLocaleString()}
              source="ADOT traffic counts"
            />
            <StaticField
              label="Intersections/mi"
              value={f.intersectionDensityPerMi ?? 0}
              source="Road centerlines / intersections"
            />
            <StaticField
              label="Flood Risk"
              value={FLOOD_LABELS[f.floodRisk || 'low']}
              source="FEMA NFHL"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Flag active={!!f.utilityDensityHigh} label="Utility conflict" source="Utility GIS overlay" />
            <Flag active={!!f.trafficSensitivityHigh} label="Traffic sensitive" source="Traffic / activity overlay" />
            <Flag active={!!f.constrainedRow} label="Constrained ROW" source="ROW width + parcel context" />
            <Flag active={!!f.urbanCore} label="Urban core" source="Land-use / urban form layer" />
            <Flag active={!!f.nightWorkOnly} label="Night work" source="Operational constraint rules" />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Community Factors</p>
          <p className="text-[11px] text-gray-500">
            Community and equity metrics should come from public demographic and transit datasets.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StaticField
              label="Population (1-10)"
              value={cm.populationCatchment ?? 0}
              source="Census ACS catchment score"
            />
            <StaticField label="Jobs (1-10)" value={cm.jobCatchment ?? 0} source="LEHD / LODES jobs score" />
            <StaticField
              label="Zero-car HH %"
              value={cm.zeroCarHouseholdsPct ?? 0}
              source="Census ACS households"
            />
            <StaticField
              label="Transfer conn. (1-10)"
              value={cm.transferConnectivity ?? 0}
              source="GTFS stop + route graph"
            />
            <StaticField
              label="Activity nodes (1-10)"
              value={cm.activityNodeImportance ?? 0}
              source="Station-area destinations"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Flag active={!!cm.heatExposureHigh} label="High heat" source="NOAA heat / climate layer" />
            <Flag active={!!cm.stationTransferStrong} label="Strong transfer" source="GTFS network connectivity" />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <SourceChip>ADOT traffic</SourceChip>
            <SourceChip>FEMA flood</SourceChip>
            <SourceChip>Census ACS</SourceChip>
            <SourceChip>LEHD LODES</SourceChip>
            <SourceChip>GTFS</SourceChip>
            <SourceChip>NOAA heat</SourceChip>
          </div>
        </div>
      )}
    </div>
  )
}
