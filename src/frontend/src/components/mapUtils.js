/**
 * mapUtils.js — City presets and MapLibre GeoJSON layer helpers.
 * All map-layer logic lives here so components stay thin.
 */

// City presets: center [lng, lat], zoom, bounding box for corridor context
export const CITY_PRESETS = {
  phoenix: {
    name: 'Phoenix, AZ',
    center: [-112.074, 33.4484],
    zoom: 11.5,
    bbox: [-112.35, 33.28, -111.80, 33.65],
  },
  seattle: {
    name: 'Seattle, WA',
    center: [-122.3321, 47.6062],
    zoom: 11.5,
    bbox: [-122.45, 47.50, -122.22, 47.72],
  },
  portland: {
    name: 'Portland, OR',
    center: [-122.6765, 45.5152],
    zoom: 11.5,
    bbox: [-122.85, 45.40, -122.50, 45.65],
  },
}

// Corridor color palette (up to 3 corridors)
const CORRIDOR_COLORS = ['#10b981', '#3b82f6', '#f59e0b']
const EXISTING_TRANSIT_SOURCE = 'existing-transit'
export const EXISTING_TRANSIT_LAYER = 'existing-transit-line'
const EXISTING_STATIONS_SOURCE = 'existing-transit-stations'
export const EXISTING_STATIONS_LAYER = 'existing-transit-stations-circle'
const ROAD_CO2_PRESSURE_SOURCE = 'background-road-co2-pressure'
const ROAD_CO2_PRESSURE_HEATMAP_LAYER = 'background-road-co2-pressure-heatmap'
const ROAD_CO2_PRESSURE_POINTS_LAYER = 'background-road-co2-pressure-points'
const MODE_SHIFT_OPPORTUNITY_SOURCE = 'background-mode-shift-opportunity'
const MODE_SHIFT_OPPORTUNITY_HEATMAP_LAYER = 'background-mode-shift-opportunity-heatmap'
const MODE_SHIFT_OPPORTUNITY_POINTS_LAYER = 'background-mode-shift-opportunity-points'

function setLayerVisibility(map, layerId, visible) {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
  }
}

function ensureGeojsonSource(map, sourceId, data) {
  const safeData = data || { type: 'FeatureCollection', features: [] }
  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(safeData)
  } else {
    map.addSource(sourceId, { type: 'geojson', data: safeData })
  }
}

/**
 * Add or update a corridor line layer on the map.
 * @param {maplibregl.Map} map
 * @param {{ id: string, geojson: GeoJSON.FeatureCollection }} corridor
 * @param {number} index - corridor index for color assignment
 */
export function addCorridorLayer(map, corridor, index) {
  const sourceId = `corridor-${corridor.id}`
  const layerId = `corridor-line-${corridor.id}`
  const color = CORRIDOR_COLORS[index % CORRIDOR_COLORS.length]

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(corridor.geojson)
  } else {
    map.addSource(sourceId, { type: 'geojson', data: corridor.geojson })
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': color,
        'line-width': 4,
        'line-opacity': 0.85,
      },
    })
  }
}

/**
 * Add or update the existing transit network overlay.
 * @param {maplibregl.Map} map
 * @param {GeoJSON.FeatureCollection} geojson
 */
export function addExistingTransitLayer(map, geojson) {
  if (map.getSource(EXISTING_TRANSIT_SOURCE)) {
    map.getSource(EXISTING_TRANSIT_SOURCE).setData(geojson)
    return
  }

  map.addSource(EXISTING_TRANSIT_SOURCE, { type: 'geojson', data: geojson })
  map.addLayer({
    id: EXISTING_TRANSIT_LAYER,
    type: 'line',
    source: EXISTING_TRANSIT_SOURCE,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'color'], '#64748b'],
      'line-width': 5.5,
      'line-opacity': 0.95,
    },
  })
}

/**
 * Add or update the existing transit stations overlay.
 * @param {maplibregl.Map} map
 * @param {GeoJSON.FeatureCollection} geojson
 */
export function addExistingTransitStationsLayer(map, geojson) {
  if (map.getSource(EXISTING_STATIONS_SOURCE)) {
    map.getSource(EXISTING_STATIONS_SOURCE).setData(geojson)
    return
  }

  map.addSource(EXISTING_STATIONS_SOURCE, { type: 'geojson', data: geojson })
  map.addLayer({
    id: EXISTING_STATIONS_LAYER,
    type: 'circle',
    source: EXISTING_STATIONS_SOURCE,
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        8, 2,
        10, 3.25,
        12, 5,
        15, 6.5,
      ],
      'circle-color': '#ffffff',
      'circle-stroke-color': '#111111',
      'circle-stroke-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        8, 1,
        12, 1.5,
        15, 2,
      ],
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        8, 0.72,
        10, 0.82,
        12, 0.92,
        15, 1,
      ],
    },
  })
}

export function syncBackgroundOverlay(map, overlayId, roadCo2PressureGeojson, modeShiftOpportunityGeojson) {
  const beforeId = map.getLayer(EXISTING_TRANSIT_LAYER) ? EXISTING_TRANSIT_LAYER : undefined

  ensureGeojsonSource(map, ROAD_CO2_PRESSURE_SOURCE, roadCo2PressureGeojson)
  if (!map.getLayer(ROAD_CO2_PRESSURE_HEATMAP_LAYER)) {
    map.addLayer(
      {
        id: ROAD_CO2_PRESSURE_HEATMAP_LAYER,
        type: 'heatmap',
        source: ROAD_CO2_PRESSURE_SOURCE,
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'intensityNorm'],
            0, 0,
            1, 1,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.95,
            11, 1.3,
            13, 1.55,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(255,255,255,0)',
            0.15, 'rgba(254,240,138,0.28)',
            0.35, 'rgba(251,191,36,0.45)',
            0.6, 'rgba(249,115,22,0.62)',
            0.82, 'rgba(220,38,38,0.78)',
            1, 'rgba(127,29,29,0.88)',
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 16,
            11, 24,
            13, 34,
          ],
          'heatmap-opacity': 0.78,
        },
      },
      beforeId,
    )
  }

  if (!map.getLayer(ROAD_CO2_PRESSURE_POINTS_LAYER)) {
    map.addLayer(
      {
        id: ROAD_CO2_PRESSURE_POINTS_LAYER,
        type: 'circle',
        source: ROAD_CO2_PRESSURE_SOURCE,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'intensityNorm'],
            0, 2.5,
            1, 8,
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'intensityNorm'],
            0, '#fcd34d',
            0.65, '#f97316',
            1, '#991b1b',
          ],
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.06,
            11, 0.18,
            13, 0.4,
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 0.75,
        },
      },
      beforeId,
    )
  }

  ensureGeojsonSource(map, MODE_SHIFT_OPPORTUNITY_SOURCE, modeShiftOpportunityGeojson)
  if (!map.getLayer(MODE_SHIFT_OPPORTUNITY_HEATMAP_LAYER)) {
    map.addLayer(
      {
        id: MODE_SHIFT_OPPORTUNITY_HEATMAP_LAYER,
        type: 'heatmap',
        source: MODE_SHIFT_OPPORTUNITY_SOURCE,
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'intensityNorm'],
            0, 0,
            1, 1,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.8,
            11, 1.15,
            13, 1.45,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(255,255,255,0)',
            0.12, 'rgba(254,226,226,0.26)',
            0.32, 'rgba(252,165,165,0.42)',
            0.55, 'rgba(248,113,113,0.58)',
            0.78, 'rgba(220,38,38,0.72)',
            1, 'rgba(127,29,29,0.82)',
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 28,
            11, 44,
            13, 62,
          ],
          'heatmap-opacity': 0.72,
        },
      },
      beforeId,
    )
  }

  if (!map.getLayer(MODE_SHIFT_OPPORTUNITY_POINTS_LAYER)) {
    map.addLayer(
      {
        id: MODE_SHIFT_OPPORTUNITY_POINTS_LAYER,
        type: 'circle',
        source: MODE_SHIFT_OPPORTUNITY_SOURCE,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'intensityNorm'],
            0, 4,
            1, 11,
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'intensityNorm'],
            0, '#fca5a5',
            0.7, '#ef4444',
            1, '#7f1d1d',
          ],
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.08,
            11, 0.24,
            13, 0.5,
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.25,
        },
      },
      beforeId,
    )
  }

  setLayerVisibility(map, ROAD_CO2_PRESSURE_HEATMAP_LAYER, overlayId === 'roadCo2Pressure' || overlayId === 'aadt')
  setLayerVisibility(map, ROAD_CO2_PRESSURE_POINTS_LAYER, overlayId === 'roadCo2Pressure' || overlayId === 'aadt')
  setLayerVisibility(
    map,
    MODE_SHIFT_OPPORTUNITY_HEATMAP_LAYER,
    overlayId === 'modeShiftOpportunity' || overlayId === 'population',
  )
  setLayerVisibility(
    map,
    MODE_SHIFT_OPPORTUNITY_POINTS_LAYER,
    overlayId === 'modeShiftOpportunity' || overlayId === 'population',
  )
}

/**
 * Highlight a single segment on the map.
 * @param {maplibregl.Map} map
 * @param {{ geojson: GeoJSON.Feature } | null} segment
 */
export function addSegmentHighlight(map, segment) {
  const sourceId = 'segment-highlight'
  const layerId = 'segment-highlight-line'

  const emptyFC = { type: 'FeatureCollection', features: [] }
  const data = segment?.geojson || emptyFC

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(data)
  } else {
    map.addSource(sourceId, { type: 'geojson', data })
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#ef4444',
        'line-width': 6,
        'line-opacity': 0.9,
      },
    })
  }
}

/**
 * Remove all corridor layers from the map (useful on reset).
 * @param {maplibregl.Map} map
 * @param {string[]} corridorIds
 */
export function removeCorridorLayers(map, corridorIds) {
  corridorIds.forEach((id) => {
    const layerId = `corridor-line-${id}`
    const sourceId = `corridor-${id}`
    if (map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)
  })
}
