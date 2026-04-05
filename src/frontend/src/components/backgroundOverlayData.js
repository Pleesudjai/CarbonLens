const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] }

export const BACKGROUND_LAYER_OPTIONS = [
  { id: 'none', label: 'None', description: 'Base map only' },
  {
    id: 'roadCo2Pressure',
    label: 'Road CO2 Pressure',
    description: 'Current roadway operating-emissions pressure, proxied by live ADOT traffic counts.',
  },
  {
    id: 'modeShiftOpportunity',
    label: 'Mode-Shift Opportunity',
    description: 'Where rail could replace the most car trips, combining population concentration and fixed-guideway transit gap.',
  },
]

function withLegacyLayerAliases(layers) {
  return {
    ...layers,
    aadt: layers.roadCo2Pressure || EMPTY_FEATURE_COLLECTION,
    population: layers.modeShiftOpportunity || EMPTY_FEATURE_COLLECTION,
  }
}

export function getEmptyBackgroundOverlayData(city, sourceSummary = 'Live overlay data has not loaded yet.') {
  return {
    cityId: city,
    meta: {
      mode: 'empty',
      fetchedAt: new Date().toISOString(),
      overlayVersion: 'carbon-v1',
      sourceSummary,
    },
    layers: withLegacyLayerAliases({
      roadCo2Pressure: EMPTY_FEATURE_COLLECTION,
      modeShiftOpportunity: EMPTY_FEATURE_COLLECTION,
    }),
  }
}

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
  { name: 'Downtown Core', coordinates: [-112.074, 33.448], population: 9.5, jobs: 10 },
  { name: 'Roosevelt', coordinates: [-112.077, 33.459], population: 8.7, jobs: 7.6 },
  { name: 'Midtown', coordinates: [-112.074, 33.492], population: 8.1, jobs: 7.2 },
  { name: 'Uptown', coordinates: [-112.074, 33.509], population: 7.4, jobs: 6.2 },
  { name: 'Encanto', coordinates: [-112.094, 33.473], population: 7.3, jobs: 5.4 },
  { name: 'West Thomas', coordinates: [-112.121, 33.48], population: 8.1, jobs: 4.8 },
  { name: 'West Camelback', coordinates: [-112.118, 33.509], population: 7.2, jobs: 4.6 },
  { name: 'South Phoenix', coordinates: [-112.074, 33.405], population: 8.6, jobs: 4.3 },
  { name: 'Maryvale Edge', coordinates: [-112.162, 33.48], population: 6.9, jobs: 3.8 },
  { name: 'Airport Gateway', coordinates: [-112.002, 33.435], population: 5.8, jobs: 8.8 },
  { name: '44th Street', coordinates: [-111.986, 33.449], population: 6.5, jobs: 6.7 },
  { name: 'Tempe Town Lake', coordinates: [-111.94, 33.434], population: 7.4, jobs: 7.8 },
  { name: 'ASU Tempe', coordinates: [-111.937, 33.421], population: 9.8, jobs: 9.2 },
  { name: 'Mill Avenue', coordinates: [-111.94, 33.426], population: 8.8, jobs: 8.4 },
  { name: 'Mesa Main Street', coordinates: [-111.83, 33.414], population: 7.1, jobs: 5.7 },
  { name: 'North Central Housing', coordinates: [-112.074, 33.53], population: 6.8, jobs: 4.9 },
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
  const maxJobs = Math.max(...rows.map((row) => row.jobs || 0), 1)
  return {
    type: 'FeatureCollection',
    features: rows.map((row) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: row.coordinates },
      properties: {
        name: row.name,
        geoid: row.name,
        population: row.population,
        jobs: row.jobs || 0,
        jobsNorm: (row.jobs || 0) / maxJobs,
        intensityNorm: row.population / max,
      },
    })),
  }
}

export function getBackgroundOverlayFallback(city) {
  return getEmptyBackgroundOverlayData(city, 'Fallback demo overlay data is disabled. Waiting for live public data.')
}

export function mergeBackgroundOverlayData(primary, fallback = null) {
  const empty = fallback || getEmptyBackgroundOverlayData(primary?.cityId || 'phoenix')
  const roadCo2Pressure = primary?.layers?.roadCo2Pressure || primary?.layers?.aadt || EMPTY_FEATURE_COLLECTION
  const modeShiftOpportunity = primary?.layers?.modeShiftOpportunity || primary?.layers?.population || EMPTY_FEATURE_COLLECTION

  return {
    cityId: primary?.cityId || empty.cityId,
    meta: {
      ...(empty.meta || {}),
      ...(primary?.meta || {}),
    },
    layers: withLegacyLayerAliases({
      roadCo2Pressure,
      modeShiftOpportunity,
    }),
  }
}
