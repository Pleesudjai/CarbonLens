const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] }

export const BACKGROUND_LAYER_OPTIONS = [
  { id: 'none', label: 'None', description: 'Base map only' },
  { id: 'aadt', label: 'AADT Gradient', description: 'Traffic-volume clustering from the live ADOT feed' },
  { id: 'population', label: 'Population Gradient', description: 'Population concentration from the live Census geography feed' },
]

const PHOENIX_AADT_SEGMENTS = [
  { name: 'I-17', aadt: 188000, coordinates: [[-112.132, 33.534], [-112.123, 33.498], [-112.117, 33.459], [-112.111, 33.432]] },
  { name: '19th Ave', aadt: 32000, coordinates: [[-112.099, 33.545], [-112.099, 33.509], [-112.099, 33.480], [-112.098, 33.443]] },
  { name: '35th Ave', aadt: 36000, coordinates: [[-112.135, 33.542], [-112.135, 33.505], [-112.135, 33.468], [-112.135, 33.433]] },
  { name: 'Central Ave', aadt: 26000, coordinates: [[-112.074, 33.541], [-112.074, 33.505], [-112.074, 33.468], [-112.074, 33.432]] },
  { name: '7th Ave', aadt: 30000, coordinates: [[-112.082, 33.542], [-112.082, 33.506], [-112.082, 33.468], [-112.082, 33.432]] },
  { name: '7th St', aadt: 30000, coordinates: [[-112.065, 33.542], [-112.065, 33.506], [-112.065, 33.468], [-112.065, 33.432]] },
  { name: 'Camelback Rd', aadt: 47000, coordinates: [[-112.172, 33.509], [-112.122, 33.509], [-112.074, 33.509], [-112.02, 33.509]] },
  { name: 'Bethany Home Rd', aadt: 39000, coordinates: [[-112.172, 33.524], [-112.122, 33.524], [-112.074, 33.524], [-112.02, 33.524]] },
  { name: 'Thomas Rd', aadt: 52000, coordinates: [[-112.172, 33.48], [-112.122, 33.48], [-112.074, 33.48], [-112.02, 33.48]] },
  { name: 'McDowell Rd', aadt: 41000, coordinates: [[-112.172, 33.466], [-112.122, 33.466], [-112.074, 33.466], [-112.02, 33.466]] },
  { name: 'Van Buren St', aadt: 36000, coordinates: [[-112.17, 33.451], [-112.122, 33.451], [-112.074, 33.451], [-112.02, 33.451]] },
  { name: 'Grand Ave', aadt: 34000, coordinates: [[-112.15, 33.514], [-112.118, 33.493], [-112.09, 33.473], [-112.055, 33.446]] },
]

const PHOENIX_POPULATION_POINTS = [
  { name: 'Downtown Core', coordinates: [-112.074, 33.448], population: 9.5 },
  { name: 'Roosevelt', coordinates: [-112.077, 33.459], population: 8.7 },
  { name: 'Midtown', coordinates: [-112.074, 33.492], population: 8.1 },
  { name: 'Uptown', coordinates: [-112.074, 33.509], population: 7.4 },
  { name: 'Encanto', coordinates: [-112.094, 33.473], population: 7.3 },
  { name: 'West Thomas', coordinates: [-112.121, 33.48], population: 8.1 },
  { name: 'West Camelback', coordinates: [-112.118, 33.509], population: 7.2 },
  { name: 'South Phoenix', coordinates: [-112.074, 33.405], population: 8.6 },
  { name: 'Maryvale Edge', coordinates: [-112.162, 33.48], population: 6.9 },
  { name: 'Airport Gateway', coordinates: [-112.002, 33.435], population: 5.8 },
  { name: '44th Street', coordinates: [-111.986, 33.449], population: 6.5 },
  { name: 'Tempe Town Lake', coordinates: [-111.94, 33.434], population: 7.4 },
  { name: 'ASU Tempe', coordinates: [-111.937, 33.421], population: 9.8 },
  { name: 'Mill Avenue', coordinates: [-111.94, 33.426], population: 8.8 },
  { name: 'Mesa Main Street', coordinates: [-111.83, 33.414], population: 7.1 },
  { name: 'North Central Housing', coordinates: [-112.074, 33.53], population: 6.8 },
]

function sampleLinePoints(row, samplesPerSegment = 6) {
  const features = []
  const segments = row.coordinates.length - 1

  for (let s = 0; s < segments; s += 1) {
    const start = row.coordinates[s]
    const end = row.coordinates[s + 1]

    for (let i = 0; i <= samplesPerSegment; i += 1) {
      if (s > 0 && i === 0) continue
      const t = i / samplesPerSegment
      const lng = start[0] + (end[0] - start[0]) * t
      const lat = start[1] + (end[1] - start[1]) * t
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          corridor: row.name,
          aadt: row.aadt,
        },
      })
    }
  }

  return features
}

function toAadtPointFeatureCollection(rows) {
  const max = Math.max(...rows.map((row) => row.aadt))
  return {
    type: 'FeatureCollection',
    features: rows.flatMap((row) =>
      sampleLinePoints(row).map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          intensityNorm: row.aadt / max,
        },
      })),
    ),
  }
}

function toPopulationPointFeatureCollection(rows) {
  const max = Math.max(...rows.map((row) => row.population))
  return {
    type: 'FeatureCollection',
    features: rows.map((row) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: row.coordinates },
      properties: {
        name: row.name,
        population: row.population,
        intensityNorm: row.population / max,
      },
    })),
  }
}

export function getBackgroundOverlayFallback(city) {
  if (city !== 'phoenix') {
    return {
      cityId: city,
      meta: {
        mode: 'fallback',
        fetchedAt: new Date().toISOString(),
        sourceSummary: 'No built-in fallback snapshot available for this city.',
      },
      layers: {
        aadt: EMPTY_FEATURE_COLLECTION,
        population: EMPTY_FEATURE_COLLECTION,
      },
    }
  }

  return {
    cityId: city,
    meta: {
      mode: 'fallback',
      fetchedAt: new Date().toISOString(),
      sourceSummary: 'Using the built-in Phoenix fallback snapshot while live public data loads.',
    },
    layers: {
      aadt: toAadtPointFeatureCollection(PHOENIX_AADT_SEGMENTS),
      population: toPopulationPointFeatureCollection(PHOENIX_POPULATION_POINTS),
    },
  }
}

export function mergeBackgroundOverlayData(primary, fallback) {
  const primaryAadtCount = primary?.layers?.aadt?.features?.length || 0
  const primaryPopulationCount = primary?.layers?.population?.features?.length || 0

  const merged = {
    cityId: primary?.cityId || fallback?.cityId,
    meta: {
      ...(fallback?.meta || {}),
      ...(primary?.meta || {}),
    },
    layers: {
      aadt: primaryAadtCount > 0 ? primary.layers.aadt : fallback?.layers?.aadt || EMPTY_FEATURE_COLLECTION,
      population:
        primaryPopulationCount > 0
          ? primary.layers.population
          : fallback?.layers?.population || EMPTY_FEATURE_COLLECTION,
    },
  }

  if (primaryAadtCount === 0 && primaryPopulationCount > 0) {
    merged.meta.sourceSummary = `${primary?.meta?.sourceSummary || 'Live data loaded.'} AADT is temporarily using the local fallback snapshot because the live traffic payload came back empty.`
  }

  return merged
}
