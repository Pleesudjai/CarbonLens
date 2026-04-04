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
  denver: {
    name: 'Denver, CO',
    center: [-104.9903, 39.7392],
    zoom: 11.5,
    bbox: [-105.15, 39.60, -104.80, 39.90],
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
