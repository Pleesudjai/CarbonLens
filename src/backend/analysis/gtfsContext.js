/**
 * gtfsContext.js — Optional GTFS feed loading and connectivity helpers.
 * Defaults to preset data when no feed is imported.
 * Uses node-gtfs for real feed support.
 */
import { importGtfs, getStops, getRoutes } from 'gtfs'

// GTFS loading state
let feedLoaded = false
let feedConfig = null

/**
 * Load a GTFS feed from a local zip or directory.
 * Call once at startup or when a user imports a feed.
 * @param {{ agencies: [{ path: string }] }} config - node-gtfs config
 */
export async function loadFeed(config) {
  feedConfig = config
  await importGtfs(config)
  feedLoaded = true
}

/**
 * Check whether a real GTFS feed is loaded.
 * @returns {boolean}
 */
export function isFeedLoaded() {
  return feedLoaded
}

/**
 * Get transit stops, optionally filtered by bounding box.
 * Falls back to preset stop data if no feed is loaded.
 * @param {{ bbox?: [number,number,number,number] }} opts
 * @returns {Array<{ stop_id: string, stop_name: string, stop_lat: number, stop_lon: number }>}
 */
export function getTransitStops(opts = {}) {
  if (!feedLoaded) return getPresetStops(opts.bbox)
  const stops = getStops()
  if (opts.bbox) {
    const [minLng, minLat, maxLng, maxLat] = opts.bbox
    return stops.filter(
      (s) => s.stop_lat >= minLat && s.stop_lat <= maxLat && s.stop_lon >= minLng && s.stop_lon <= maxLng
    )
  }
  return stops
}

/**
 * Get transit routes from the loaded feed.
 * Returns empty array if no feed is loaded.
 * @returns {Array<{ route_id: string, route_short_name: string, route_long_name: string, route_type: number }>}
 */
export function getTransitRoutes() {
  if (!feedLoaded) return []
  return getRoutes()
}

/**
 * Count the number of unique transit stops within a bounding box.
 * Useful for transfer-connectivity scoring.
 * @param {[number,number,number,number]} bbox - [minLng, minLat, maxLng, maxLat]
 * @returns {number}
 */
export function countStopsInBbox(bbox) {
  return getTransitStops({ bbox }).length
}

// --- Preset fallback data ---

/**
 * Minimal preset stops for Phoenix light rail when no GTFS is loaded.
 * These are real Valley Metro Rail station locations.
 */
const PHOENIX_PRESET_STOPS = [
  { stop_id: 'VMR_01', stop_name: '19th Ave/Montebello', stop_lat: 33.5150, stop_lon: -112.0990 },
  { stop_id: 'VMR_02', stop_name: '19th Ave/Camelback', stop_lat: 33.5094, stop_lon: -112.0990 },
  { stop_id: 'VMR_03', stop_name: '7th Ave/Camelback', stop_lat: 33.5094, stop_lon: -112.0827 },
  { stop_id: 'VMR_04', stop_name: 'Central/Camelback', stop_lat: 33.5094, stop_lon: -112.0740 },
  { stop_id: 'VMR_05', stop_name: 'Central/Indian School', stop_lat: 33.4947, stop_lon: -112.0740 },
  { stop_id: 'VMR_06', stop_name: 'Central/Osborn', stop_lat: 33.4849, stop_lon: -112.0740 },
  { stop_id: 'VMR_07', stop_name: 'Central/Thomas', stop_lat: 33.4806, stop_lon: -112.0740 },
  { stop_id: 'VMR_08', stop_name: 'Encanto/Central', stop_lat: 33.4733, stop_lon: -112.0740 },
  { stop_id: 'VMR_09', stop_name: 'Central/McDowell', stop_lat: 33.4651, stop_lon: -112.0740 },
  { stop_id: 'VMR_10', stop_name: 'Roosevelt/Central', stop_lat: 33.4589, stop_lon: -112.0740 },
  { stop_id: 'VMR_11', stop_name: 'Van Buren/Central', stop_lat: 33.4516, stop_lon: -112.0740 },
  { stop_id: 'VMR_12', stop_name: 'Washington/Central', stop_lat: 33.4489, stop_lon: -112.0740 },
  { stop_id: 'VMR_13', stop_name: 'Jefferson/1st Ave', stop_lat: 33.4477, stop_lon: -112.0770 },
  { stop_id: 'VMR_14', stop_name: '3rd St/Washington', stop_lat: 33.4489, stop_lon: -112.0690 },
  { stop_id: 'VMR_15', stop_name: '12th St/Washington', stop_lat: 33.4489, stop_lon: -112.0570 },
  { stop_id: 'VMR_16', stop_name: '24th St/Washington', stop_lat: 33.4489, stop_lon: -112.0300 },
  { stop_id: 'VMR_17', stop_name: '38th St/Washington', stop_lat: 33.4489, stop_lon: -112.0090 },
  { stop_id: 'VMR_18', stop_name: '44th St/Washington', stop_lat: 33.4489, stop_lon: -111.9990 },
  { stop_id: 'VMR_19', stop_name: 'Priest Dr/Washington', stop_lat: 33.4489, stop_lon: -111.9590 },
  { stop_id: 'VMR_20', stop_name: 'Mill Ave/3rd St', stop_lat: 33.4260, stop_lon: -111.9400 },
]

function getPresetStops(bbox) {
  if (!bbox) return PHOENIX_PRESET_STOPS
  const [minLng, minLat, maxLng, maxLat] = bbox
  return PHOENIX_PRESET_STOPS.filter(
    (s) => s.stop_lat >= minLat && s.stop_lat <= maxLat && s.stop_lon >= minLng && s.stop_lon <= maxLng
  )
}
