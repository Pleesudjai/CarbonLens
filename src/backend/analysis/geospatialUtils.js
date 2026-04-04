/**
 * geospatialUtils.js — Turf + H3 helpers for the analysis engine.
 * All geometry math and catchment indexing lives here.
 */
import * as turf from '@turf/turf'
import { latLngToCell, gridDisk, cellToLatLng, cellArea, UNITS } from 'h3-js'

// Default H3 resolution for corridor catchment analysis
const DEFAULT_H3_RES = 8 // ~460 m edge length — good for station-area scoring

/**
 * Calculate the total length of a corridor LineString in kilometers.
 * @param {GeoJSON.Feature<LineString>} line
 * @returns {number} length in km
 */
export function corridorLength(line) {
  return turf.length(line, { units: 'kilometers' })
}

/**
 * Create a buffer around a corridor line.
 * @param {GeoJSON.Feature<LineString>} line
 * @param {number} distanceKm - buffer distance in km
 * @returns {GeoJSON.Feature<Polygon>}
 */
export function corridorBuffer(line, distanceKm = 0.8) {
  return turf.buffer(line, distanceKm, { units: 'kilometers' })
}

/**
 * Get the centroid of a geometry (useful for labeling).
 * @param {GeoJSON.Feature} feature
 * @returns {GeoJSON.Feature<Point>}
 */
export function centroid(feature) {
  return turf.centroid(feature)
}

/**
 * Split a corridor line at equal intervals and return segment midpoints.
 * Useful for placing stations or scoring segments individually.
 * @param {GeoJSON.Feature<LineString>} line
 * @param {number} segmentCount
 * @returns {GeoJSON.Feature<Point>[]}
 */
export function segmentMidpoints(line, segmentCount) {
  const totalLen = turf.length(line, { units: 'kilometers' })
  const step = totalLen / segmentCount
  const points = []
  for (let i = 0; i < segmentCount; i++) {
    const dist = step * (i + 0.5)
    points.push(turf.along(line, dist, { units: 'kilometers' }))
  }
  return points
}

/**
 * Index a corridor buffer polygon into H3 cells.
 * Returns the set of H3 cell indices that intersect the catchment area.
 * @param {GeoJSON.Feature<Polygon>} bufferPolygon
 * @param {number} resolution - H3 resolution (default 8)
 * @returns {string[]} array of H3 cell indices
 */
export function catchmentCells(bufferPolygon, resolution = DEFAULT_H3_RES) {
  const center = turf.centroid(bufferPolygon)
  const [lng, lat] = center.geometry.coordinates
  const centerCell = latLngToCell(lat, lng, resolution)

  // Estimate ring size from buffer area
  const areaKm2 = turf.area(bufferPolygon) / 1e6
  const cellAreaKm2 = cellArea(centerCell, UNITS.km2)
  const estimatedCells = Math.ceil(areaKm2 / cellAreaKm2)
  const ringSize = Math.ceil(Math.sqrt(estimatedCells))

  const ring = gridDisk(centerCell, ringSize)

  // Filter to cells whose center falls within the buffer
  return ring.filter((cell) => {
    const [clat, clng] = cellToLatLng(cell)
    const pt = turf.point([clng, clat])
    return turf.booleanPointInPolygon(pt, bufferPolygon)
  })
}

/**
 * Score catchment cells using a value lookup.
 * @param {string[]} cells - H3 cell indices
 * @param {Record<string, number>} valueLookup - cell index -> value (e.g., population)
 * @returns {number} total value within catchment
 */
export function scoreCatchment(cells, valueLookup) {
  return cells.reduce((sum, cell) => sum + (valueLookup[cell] || 0), 0)
}

/**
 * Calculate the number of intersections between a corridor and a set of cross-streets.
 * @param {GeoJSON.Feature<LineString>} corridor
 * @param {GeoJSON.FeatureCollection<LineString>} streets
 * @returns {number}
 */
export function countIntersections(corridor, streets) {
  let count = 0
  for (const street of streets.features) {
    const pts = turf.lineIntersect(corridor, street)
    count += pts.features.length
  }
  return count
}
