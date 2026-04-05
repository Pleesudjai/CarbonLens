/**
 * defaultScenario.js — Starter scenarios and corridor geometry for city presets.
 * State shape matches the API contract so App.jsx can send it directly.
 */

import { buildCorridorFeatureCollection, buildCorridorLineGeometry, getPresetCorridorCoordinates } from '../../../shared/presetCorridors.js'

function seg(id, label, segmentType, sectionFamily, lengthFt, context, factors, community) {
  return {
    id, label, segmentType, sectionFamily, lengthFt, context,
    factors: {
      trafficAadt: 20000, intersectionDensityPerMi: 6,
      utilityDensityHigh: false, trafficSensitivityHigh: false,
      constrainedRow: false, floodRisk: 'low',
      urbanCore: false, nightWorkOnly: false,
      ...factors,
    },
    community: {
      populationCatchment: 5, jobCatchment: 5,
      zeroCarHouseholdsPct: 5, transferConnectivity: 4,
      activityNodeImportance: 5, heatExposureHigh: false,
      stationTransferStrong: false,
      ...community,
    },
  }
}

export function hasPresetGeometry(corridorId, cityId) {
  return getPresetCorridorCoordinates(cityId, corridorId).length >= 2
}

export function corridorGeojson(corridorId, cityId) {
  return buildCorridorFeatureCollection(cityId, corridorId)
}

export function createPhoenixScenario() {
  return {
    cityId: 'phoenix',
    projectName: 'West Phoenix Light Rail Extension',
    planningGoal: 'lowest carbon with manageable disruption',
    corridors: [
      {
        id: 'alt-a', name: 'Alt A - 19th Ave Median Running',
        geometry: buildCorridorLineGeometry('phoenix', 'alt-a'),
        segments: [
          seg('a-1', '19th Ave at-grade', 'at_grade_median', 'conventional_rc', 8400, 'urban_arterial',
            { trafficAadt: 28000 }, { populationCatchment: 7, jobCatchment: 5, zeroCarHouseholdsPct: 6, heatExposureHigh: true }),
          seg('a-2', 'I-17 elevated crossing', 'elevated_crossing', 'conventional_rc', 1800, 'urban_arterial',
            { trafficAadt: 35000, utilityDensityHigh: true, trafficSensitivityHigh: true, constrainedRow: true, nightWorkOnly: true },
            { populationCatchment: 3, jobCatchment: 4, zeroCarHouseholdsPct: 5, heatExposureHigh: true }),
          seg('a-3', 'Thomas Rd station', 'station_zone', 'conventional_rc', 1200, 'urban_arterial',
            { trafficAadt: 22000, intersectionDensityPerMi: 10 },
            { populationCatchment: 8, jobCatchment: 6, zeroCarHouseholdsPct: 7, transferConnectivity: 6, activityNodeImportance: 7, heatExposureHigh: true, stationTransferStrong: true }),
        ],
      },
      {
        id: 'alt-b', name: 'Alt B - Central Ave FRC Option',
        geometry: buildCorridorLineGeometry('phoenix', 'alt-b'),
        segments: [
          seg('b-1', 'Central Ave embedded', 'embedded_urban_street', 'fiber_reduced', 10500, 'urban_core',
            { trafficAadt: 32000, intersectionDensityPerMi: 12, utilityDensityHigh: true, trafficSensitivityHigh: true, constrainedRow: true, floodRisk: 'moderate', urbanCore: true, nightWorkOnly: true },
            { populationCatchment: 9, jobCatchment: 9, zeroCarHouseholdsPct: 8, transferConnectivity: 8, activityNodeImportance: 9, heatExposureHigh: true, stationTransferStrong: true }),
          seg('b-2', 'Roosevelt station', 'station_zone', 'fiber_reduced', 1000, 'urban_core',
            { utilityDensityHigh: true, constrainedRow: true, urbanCore: true },
            { populationCatchment: 9, jobCatchment: 8, zeroCarHouseholdsPct: 9, transferConnectivity: 9, activityNodeImportance: 8, heatExposureHigh: true, stationTransferStrong: true }),
        ],
      },
      {
        id: 'alt-c', name: 'Alt C - Suburban Low-Cement',
        geometry: buildCorridorLineGeometry('phoenix', 'alt-c'),
        segments: [
          seg('c-1', 'Bethany Home at-grade', 'at_grade_median', 'low_cement_rc', 8500, 'suburban',
            { trafficAadt: 18000, intersectionDensityPerMi: 4 }, { populationCatchment: 5, jobCatchment: 3, zeroCarHouseholdsPct: 4 }),
          seg('c-2', '35th Ave bridge approach', 'bridge_approach', 'low_cement_rc', 900, 'suburban',
            { floodRisk: 'moderate' }, { populationCatchment: 3, jobCatchment: 2, zeroCarHouseholdsPct: 3, transferConnectivity: 1, activityNodeImportance: 2 }),
          seg('c-3', '35th Ave station', 'station_zone', 'low_cement_rc', 1100, 'suburban',
            {}, { populationCatchment: 6, jobCatchment: 4 }),
        ],
      },
    ],
  }
}

export function createDefaultScenario(cityId = 'phoenix') {
  if (cityId === 'phoenix') return createPhoenixScenario()
  // Placeholder for other cities — return a minimal starter
  return {
    cityId,
    projectName: `${cityId.charAt(0).toUpperCase() + cityId.slice(1)} Transit Study`,
    planningGoal: '',
    corridors: [{
      id: 'alt-a', name: 'Alt A',
      geometry: null,
      segments: [seg('a-1', 'Segment 1', 'at_grade_median', 'conventional_rc', 5000, 'suburban', {}, {})],
    }],
  }
}
