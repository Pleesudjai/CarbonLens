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

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
      {children}
    </label>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange}
      className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

function Num({ value, onChange, min, max, step }) {
  return (
    <input type="number" value={value ?? ''} min={min} max={max} step={step}
      onChange={onChange}
      className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white" />
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] text-gray-400">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-emerald-500" />
      {label}
    </label>
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
    <div className="rounded border border-gray-700 bg-gray-800/50 p-2.5">
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(!open)} className="text-xs text-gray-500">{open ? '▾' : '▸'}</button>
        <input value={segment.label || ''} onChange={(e) => set('label', e.target.value)}
          className="flex-1 bg-transparent text-xs font-medium text-white focus:outline-none"
          placeholder="Segment label" />
        <span className="text-[10px] text-gray-500">{(segment.lengthFt || 0).toLocaleString()} ft</span>
        <button onClick={onRemove} className="text-xs text-gray-500 hover:text-red-400">x</button>
      </div>

      {open && (
        <div className="mt-2 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Type"><Select value={segment.segmentType} onChange={(e) => set('segmentType', e.target.value)} options={SEGMENT_TYPES} /></Field>
            <Field label="Section"><Select value={segment.sectionFamily} onChange={(e) => set('sectionFamily', e.target.value)} options={SECTION_FAMILIES} /></Field>
            <Field label="Length (ft)"><Num value={segment.lengthFt} onChange={(e) => set('lengthFt', +e.target.value)} min={100} step={100} /></Field>
            <Field label="Context"><Select value={segment.context} onChange={(e) => set('context', e.target.value)} options={CONTEXTS} /></Field>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Planning Factors</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Traffic AADT"><Num value={f.trafficAadt} onChange={(e) => set('factors.trafficAadt', +e.target.value)} step={1000} /></Field>
            <Field label="Intersections/mi"><Num value={f.intersectionDensityPerMi} onChange={(e) => set('factors.intersectionDensityPerMi', +e.target.value)} /></Field>
            <Field label="Flood Risk">
              <Select value={f.floodRisk || 'low'} onChange={(e) => set('factors.floodRisk', e.target.value)}
                options={[['low', 'Low'], ['moderate', 'Moderate'], ['high', 'High']]} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-3">
            <Toggle checked={f.utilityDensityHigh} onChange={(e) => set('factors.utilityDensityHigh', e.target.checked)} label="Utility conflict" />
            <Toggle checked={f.trafficSensitivityHigh} onChange={(e) => set('factors.trafficSensitivityHigh', e.target.checked)} label="Traffic sensitive" />
            <Toggle checked={f.constrainedRow} onChange={(e) => set('factors.constrainedRow', e.target.checked)} label="Constrained ROW" />
            <Toggle checked={f.urbanCore} onChange={(e) => set('factors.urbanCore', e.target.checked)} label="Urban core" />
            <Toggle checked={f.nightWorkOnly} onChange={(e) => set('factors.nightWorkOnly', e.target.checked)} label="Night work" />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Community Factors</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Population (1-10)"><Num value={cm.populationCatchment} onChange={(e) => set('community.populationCatchment', +e.target.value)} min={1} max={10} /></Field>
            <Field label="Jobs (1-10)"><Num value={cm.jobCatchment} onChange={(e) => set('community.jobCatchment', +e.target.value)} min={1} max={10} /></Field>
            <Field label="Zero-car HH %"><Num value={cm.zeroCarHouseholdsPct} onChange={(e) => set('community.zeroCarHouseholdsPct', +e.target.value)} min={1} max={10} /></Field>
            <Field label="Transfer conn. (1-10)"><Num value={cm.transferConnectivity} onChange={(e) => set('community.transferConnectivity', +e.target.value)} min={1} max={10} /></Field>
            <Field label="Activity nodes (1-10)"><Num value={cm.activityNodeImportance} onChange={(e) => set('community.activityNodeImportance', +e.target.value)} min={1} max={10} /></Field>
          </div>
          <div className="flex flex-wrap gap-3">
            <Toggle checked={cm.heatExposureHigh} onChange={(e) => set('community.heatExposureHigh', e.target.checked)} label="High heat" />
            <Toggle checked={cm.stationTransferStrong} onChange={(e) => set('community.stationTransferStrong', e.target.checked)} label="Strong transfer" />
          </div>
        </div>
      )}
    </div>
  )
}
