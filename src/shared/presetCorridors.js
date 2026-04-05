export const PHOENIX_CORRIDOR_COORDINATES = {
  'alt-a': [
    [-112.099, 33.509],
    [-112.099, 33.494],
    [-112.099, 33.48],
    [-112.099, 33.465],
  ],
  'alt-b': [
    [-112.074, 33.509],
    [-112.074, 33.494],
    [-112.074, 33.48],
    [-112.074, 33.459],
  ],
  'alt-c': [
    [-112.099, 33.53],
    [-112.074, 33.53],
    [-112.05, 33.53],
    [-112.03, 33.53],
  ],
}

export function getPresetCorridorCoordinates(cityId, corridorId) {
  if (cityId === 'phoenix') return PHOENIX_CORRIDOR_COORDINATES[corridorId] || []
  return []
}

export function buildCorridorLineGeometry(cityId, corridorId) {
  const coordinates = getPresetCorridorCoordinates(cityId, corridorId)
  if (coordinates.length < 2) return null
  return {
    type: 'LineString',
    coordinates,
  }
}

export function buildCorridorFeatureCollection(cityId, corridorId) {
  const geometry = buildCorridorLineGeometry(cityId, corridorId)
  if (!geometry) return { type: 'FeatureCollection', features: [] }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry,
        properties: { id: corridorId },
      },
    ],
  }
}
