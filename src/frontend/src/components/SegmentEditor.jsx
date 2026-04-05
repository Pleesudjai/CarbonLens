import { useState } from 'react'

const SEGMENT_TYPES = [
  ['at_grade_median', 'At-Grade Median'],
  ['embedded_urban_street', 'Embedded Urban Street'],
  ['station_zone', 'Station Zone'],
  ['elevated_crossing', 'Elevated Crossing'],
  ['bridge_approach', 'Bridge Approach'],
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

function StatusBadge({ tone = 'default', label }) {
  const tones = {
    measured: 'border-sky-200 bg-sky-50 text-sky-700',
    live: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    default: 'border-amber-200 bg-amber-50 text-amber-700',
    design: 'border-violet-200 bg-violet-50 text-violet-700',
  }

  return (
    <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${tones[tone] || tones.default}`}>
      {label}
    </span>
  )
}

function FieldLabel({ label, statusTone, statusLabel }) {
  return (
    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-400">
      <span>{label}</span>
      {statusLabel && <StatusBadge tone={statusTone} label={statusLabel} />}
    </span>
  )
}

function SourceChip({ children }) {
  return (
    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-500">
      {children}
    </span>
  )
}

function ReadOnlyField({ label, value, source, statusTone, statusLabel }) {
  return (
    <div className="flex flex-col gap-0.5">
      <FieldLabel label={label} statusTone={statusTone} statusLabel={statusLabel} />
      <div className="rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs text-gray-800">{value}</div>
      {source && <span className="text-[10px] text-gray-400">{source}</span>}
    </div>
  )
}

function Flag({ active, label, source, statusTone, statusLabel }) {
  return (
    <div className="flex flex-col gap-0.5">
      <FieldLabel label={label} statusTone={statusTone} statusLabel={statusLabel} />
      <div
        className={`rounded border px-2 py-1 text-[11px] ${
          active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-100 text-gray-500'
        }`}
      >
        {active ? 'Detected' : 'Clear'}
      </div>
      <span className="text-[10px] text-gray-400">{source}</span>
    </div>
  )
}

function defaultSource(label) {
  return `${label} placeholder for now.`
}

function livePreviewSource(source, fallback) {
  return source ? `${source}.` : fallback
}

export default function SegmentEditor({ segment, previewSegment, resultSegment, onUpdate, onRemove }) {
  const [open, setOpen] = useState(true)

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
  const previewFactors = previewSegment?.factors || {}
  const previewCommunity = previewSegment?.community || {}
  const previewContext = previewSegment?.previewContext || {}
  const liveFactors = resultSegment?.factors || {}
  const liveFlood = resultSegment?.liveContext?.flood || null
  const liveConstructability = resultSegment?.liveContext?.constructability || null

  const hasLiveFlood = Boolean(liveFlood?.live)
  const hasLiveConstructability = Boolean(liveConstructability?.live)
  const hasPreviewTraffic = Boolean(previewContext.trafficAadt)
  const hasPreviewPopulation = Boolean(previewContext.populationCatchment)
  const hasPreviewJobs = Boolean(previewContext.jobCatchment)
  const hasPreviewZeroCar = Boolean(previewContext.zeroCarHouseholdsPct)
  const hasPreviewTransfer = Boolean(previewContext.transferConnectivity)
  const hasPreviewActivity = Boolean(previewContext.activityNodeImportance)
  const hasPreviewStrongTransfer = Boolean(previewContext.stationTransferStrong)

  const intersectionDensityValue = hasLiveConstructability
    ? liveFactors.intersectionDensityPerMi
    : f.intersectionDensityPerMi
  const floodRiskValue = hasLiveFlood ? liveFlood.risk : f.floodRisk
  const utilityConflictValue = hasLiveConstructability ? liveFactors.utilityDensityHigh : f.utilityDensityHigh
  const trafficSensitiveValue = hasLiveConstructability ? liveFactors.trafficSensitivityHigh : f.trafficSensitivityHigh
  const constrainedRowValue = hasLiveConstructability ? liveFactors.constrainedRow : f.constrainedRow
  const urbanCoreValue = hasLiveConstructability ? liveFactors.urbanCore : f.urbanCore
  const trafficAadtValue = hasPreviewTraffic ? previewFactors.trafficAadt : f.trafficAadt
  const populationValue = hasPreviewPopulation ? previewCommunity.populationCatchment : cm.populationCatchment
  const jobsValue = hasPreviewJobs ? previewCommunity.jobCatchment : cm.jobCatchment
  const zeroCarValue = hasPreviewZeroCar ? previewCommunity.zeroCarHouseholdsPct : cm.zeroCarHouseholdsPct
  const transferValue = hasPreviewTransfer ? previewCommunity.transferConnectivity : cm.transferConnectivity
  const activityValue = hasPreviewActivity ? previewCommunity.activityNodeImportance : cm.activityNodeImportance
  const strongTransferValue = hasPreviewStrongTransfer ? previewCommunity.stationTransferStrong : cm.stationTransferStrong

  const measuredSource = 'Measured from the line you drew on the map.'
  const liveFloodSource = hasLiveFlood
    ? `Live: ${liveFlood.source}.`
    : defaultSource('Flood risk')
  const liveConstructabilitySource = hasLiveConstructability
    ? `Live: ${liveConstructability.source}.`
    : defaultSource('Road-context constructability')
  const trafficSource = hasPreviewTraffic
    ? livePreviewSource(previewContext.trafficAadt?.source, 'Live traffic sample.')
    : 'Default AADT in the editor.'
  const populationSource = hasPreviewPopulation
    ? livePreviewSource(previewContext.populationCatchment?.source, 'Live population context.')
    : defaultSource('Population catchment')
  const jobsSource = hasPreviewJobs
    ? livePreviewSource(previewContext.jobCatchment?.source, 'Live jobs context.')
    : defaultSource('Jobs score')
  const zeroCarSource = hasPreviewZeroCar
    ? livePreviewSource(previewContext.zeroCarHouseholdsPct?.source, 'Live zero-car household share.')
    : defaultSource('Zero-car household score')
  const transferSource = hasPreviewTransfer
    ? livePreviewSource(previewContext.transferConnectivity?.source, 'Live transfer context.')
    : defaultSource('Transfer connectivity')
  const activitySource = hasPreviewActivity
    ? livePreviewSource(previewContext.activityNodeImportance?.source, 'Live activity-node context.')
    : defaultSource('Activity node score')
  const strongTransferSource = hasPreviewStrongTransfer
    ? livePreviewSource(previewContext.stationTransferStrong?.source, 'Live transfer-node context.')
    : defaultSource('Transfer strength flag')

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
          <div className="rounded border border-sky-100 bg-sky-50 px-2.5 py-2 text-[11px] text-sky-800">
            Measured = from your drawing. Live = public data. Default = placeholder until a live lookup is connected.
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ReadOnlyField
              label="Type"
              value={SEGMENT_TYPE_LABELS[segment.segmentType] || segment.segmentType}
              statusTone="default"
              statusLabel="Default"
              source="Default type for a new option."
            />
            <ReadOnlyField
              label="Section"
              value="Conventional RC"
              statusTone="default"
              statusLabel="Default"
              source="Default section in the editor."
            />
            <ReadOnlyField
              label="Length (ft)"
              value={(segment.lengthFt || 0).toLocaleString()}
              statusTone="measured"
              statusLabel="Measured"
              source={measuredSource}
            />
            <ReadOnlyField
              label="Context"
              value={CONTEXT_LABELS[segment.context] || segment.context}
              statusTone="default"
              statusLabel="Default"
              source="Default roadway context."
            />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Planning Factors</p>
          <p className="text-[11px] text-gray-500">Measured values come from your drawing. Live values come from public data.</p>
          <div className="grid grid-cols-2 gap-2">
            <ReadOnlyField
              label="Traffic AADT"
              value={(trafficAadtValue ?? 0).toLocaleString()}
              statusTone={hasPreviewTraffic ? 'live' : 'default'}
              statusLabel={hasPreviewTraffic ? 'Live' : 'Default'}
              source={trafficSource}
            />
            <ReadOnlyField
              label="Intersections/mi"
              value={intersectionDensityValue ?? 0}
              statusTone={hasLiveConstructability ? 'live' : 'default'}
              statusLabel={hasLiveConstructability ? 'Live' : 'Default'}
              source={liveConstructabilitySource}
            />
            <ReadOnlyField
              label="Flood Risk"
              value={FLOOD_LABELS[floodRiskValue || 'low']}
              statusTone={hasLiveFlood ? 'live' : 'default'}
              statusLabel={hasLiveFlood ? 'Live' : 'Default'}
              source={liveFloodSource}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Flag
              active={!!utilityConflictValue}
              label="Utility conflict"
              statusTone={hasLiveConstructability ? 'live' : 'default'}
              statusLabel={hasLiveConstructability ? 'Live' : 'Default'}
              source={liveConstructabilitySource}
            />
            <Flag
              active={!!trafficSensitiveValue}
              label="Traffic sensitive"
              statusTone={hasLiveConstructability ? 'live' : 'default'}
              statusLabel={hasLiveConstructability ? 'Live' : 'Default'}
              source={liveConstructabilitySource}
            />
            <Flag
              active={!!constrainedRowValue}
              label="Constrained ROW"
              statusTone={hasLiveConstructability ? 'live' : 'default'}
              statusLabel={hasLiveConstructability ? 'Live' : 'Default'}
              source={liveConstructabilitySource}
            />
            <Flag
              active={!!urbanCoreValue}
              label="Urban core"
              statusTone={hasLiveConstructability ? 'live' : 'default'}
              statusLabel={hasLiveConstructability ? 'Live' : 'Default'}
              source={liveConstructabilitySource}
            />
            <Flag
              active={!!f.nightWorkOnly}
              label="Night work"
              statusTone="default"
              statusLabel="Default"
              source="Default operating-rule assumption."
            />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Community Factors</p>
          <p className="text-[11px] text-gray-500">
            Population, jobs, transfer connectivity, activity nodes, and strong transfer use live map data when available. Anything still marked default is not connected yet.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ReadOnlyField
              label="Population (1-10)"
              value={populationValue ?? 0}
              statusTone={hasPreviewPopulation ? 'live' : 'default'}
              statusLabel={hasPreviewPopulation ? 'Live' : 'Default'}
              source={populationSource}
            />
            <ReadOnlyField
              label="Jobs (1-10)"
              value={jobsValue ?? 0}
              statusTone={hasPreviewJobs ? 'live' : 'default'}
              statusLabel={hasPreviewJobs ? 'Live' : 'Default'}
              source={jobsSource}
            />
            <ReadOnlyField
              label="Zero-car HH %"
              value={zeroCarValue ?? 0}
              statusTone={hasPreviewZeroCar ? 'live' : 'default'}
              statusLabel={hasPreviewZeroCar ? 'Live' : 'Default'}
              source={zeroCarSource}
            />
            <ReadOnlyField
              label="Transfer conn. (1-10)"
              value={transferValue ?? 0}
              statusTone={hasPreviewTransfer ? 'live' : 'default'}
              statusLabel={hasPreviewTransfer ? 'Live' : 'Default'}
              source={transferSource}
            />
            <ReadOnlyField
              label="Activity nodes (1-10)"
              value={activityValue ?? 0}
              statusTone={hasPreviewActivity ? 'live' : 'default'}
              statusLabel={hasPreviewActivity ? 'Live' : 'Default'}
              source={activitySource}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Flag
              active={!!cm.heatExposureHigh}
              label="High heat"
              statusTone="default"
              statusLabel="Default"
              source={defaultSource('Heat exposure flag')}
            />
            <Flag
              active={!!strongTransferValue}
              label="Strong transfer"
              statusTone={hasPreviewStrongTransfer ? 'live' : 'default'}
              statusLabel={hasPreviewStrongTransfer ? 'Live' : 'Default'}
              source={strongTransferSource}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <SourceChip>Measured from map geometry</SourceChip>
            <SourceChip>Default values in editor</SourceChip>
            {(hasPreviewTraffic || hasPreviewPopulation || hasPreviewJobs || hasPreviewZeroCar || hasPreviewTransfer || hasPreviewActivity || hasPreviewStrongTransfer) && (
              <SourceChip>Live map context</SourceChip>
            )}
            {hasLiveFlood && <SourceChip>Live FEMA after analysis</SourceChip>}
            {hasLiveConstructability && <SourceChip>Live TIGER after analysis</SourceChip>}
          </div>
        </div>
      )}
    </div>
  )
}
