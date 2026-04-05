export const FIXED_GUIDEWAY_SERVICE_NODES = {
  phoenix: [
    { coordinates: [-112.118471, 33.575092], routeIds: ['B'] },
    { coordinates: [-112.100848, 33.567384], routeIds: ['B'] },
    { coordinates: [-112.099663, 33.537448], routeIds: ['B'] },
    { coordinates: [-112.098823, 33.509537], routeIds: ['B'] },
    { coordinates: [-112.075192, 33.50855], routeIds: ['B'] },
    { coordinates: [-112.073761, 33.481233], routeIds: ['B'] },
    { coordinates: [-112.074011, 33.459391], routeIds: ['B'] },
    { coordinates: [-112.074424, 33.447106], routeIds: ['A', 'B'] },
    { coordinates: [-112.073738, 33.435951], routeIds: ['B'] },
    { coordinates: [-112.073291, 33.405948], routeIds: ['B'] },
    { coordinates: [-112.073268, 33.378556], routeIds: ['B'] },
    { coordinates: [-112.029262, 33.447229], routeIds: ['A'] },
    { coordinates: [-111.98798, 33.448168], routeIds: ['A'] },
    { coordinates: [-111.956107, 33.442008], routeIds: ['A'] },
    { coordinates: [-111.940697, 33.427452], routeIds: ['A'] },
    { coordinates: [-111.92697, 33.420732], routeIds: ['A'] },
    { coordinates: [-111.916899, 33.414759], routeIds: ['A', 'S'] },
    { coordinates: [-111.888114, 33.414821], routeIds: ['A'] },
    { coordinates: [-111.870907, 33.414855], routeIds: ['A'] },
    { coordinates: [-111.839073, 33.415103], routeIds: ['A'] },
    { coordinates: [-111.822135, 33.415066], routeIds: ['A'] },
    { coordinates: [-111.790741, 33.415331], routeIds: ['A'] },
    { coordinates: [-111.932684, 33.429352], routeIds: ['S'] },
    { coordinates: [-111.941997, 33.429452], routeIds: ['S'] },
    { coordinates: [-111.942501, 33.422355], routeIds: ['S'] },
    { coordinates: [-111.939933, 33.420922], routeIds: ['S'] },
    { coordinates: [-111.929371, 33.414734], routeIds: ['S'] },
    { coordinates: [-112.044493, 33.430794], routeIds: ['SKYT'] },
    { coordinates: [-112.032613, 33.435246], routeIds: ['SKYT'] },
    { coordinates: [-112.009982, 33.434733], routeIds: ['SKYT'] },
    { coordinates: [-111.998028, 33.43473], routeIds: ['SKYT'] },
    { coordinates: [-111.990022, 33.446946], routeIds: ['SKYT'] },
  ],
}

const TRANSIT_GAP_SETTINGS = {
  phoenix: {
    maxGapMiles: 4,
    localStopRadiusMiles: 0.5,
    transferRadiusMiles: 1,
  },
}

const ROUTE_WEIGHTS = {
  A: 1,
  B: 1,
  S: 0.7,
  SKYT: 0.35,
}

export function getFixedGuidewayAnchors(cityId = 'phoenix') {
  return (FIXED_GUIDEWAY_SERVICE_NODES[cityId] || []).map((node) => node.coordinates)
}

export function getFixedGuidewayServiceNodes(cityId = 'phoenix') {
  return FIXED_GUIDEWAY_SERVICE_NODES[cityId] || []
}

export function getTransitGapSettings(cityId = 'phoenix') {
  return TRANSIT_GAP_SETTINGS[cityId] || {
    maxGapMiles: 4,
    localStopRadiusMiles: 0.5,
    transferRadiusMiles: 1,
  }
}

export function haversineMiles(a, b) {
  const toRadians = (deg) => (deg * Math.PI) / 180
  const [lon1, lat1] = a
  const [lon2, lat2] = b
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const rLat1 = toRadians(lat1)
  const rLat2 = toRadians(lat2)
  const h = (Math.sin(dLat / 2) ** 2)
    + (Math.cos(rLat1) * Math.cos(rLat2) * (Math.sin(dLon / 2) ** 2))
  return 3958.7613 * 2 * Math.asin(Math.sqrt(h))
}

export function distanceToNearestAnchorMiles(coordinates, anchors) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2 || !anchors.length) return null

  let minDistance = Number.POSITIVE_INFINITY
  for (const anchor of anchors) {
    const distance = haversineMiles(coordinates, anchor)
    if (distance < minDistance) minDistance = distance
  }

  return Number.isFinite(minDistance) ? minDistance : null
}

function clampZeroToOne(value) {
  return Math.max(0, Math.min(1, value))
}

function summarizeNearbyService(coordinates, serviceNodes, settings) {
  const localStopCount = new Set()
  const transferStopCount = new Set()
  const routeSet = new Set()
  let weightedRouteScore = 0
  let transferNodeCount = 0

  serviceNodes.forEach((node, index) => {
    const distance = haversineMiles(coordinates, node.coordinates)
    const routeIds = node.routeIds || []

    if (distance <= settings.localStopRadiusMiles) {
      localStopCount.add(index)
      routeIds.forEach((routeId) => routeSet.add(routeId))
    }

    if (distance <= settings.transferRadiusMiles) {
      transferStopCount.add(index)
      const uniqueRouteIds = [...new Set(routeIds)]
      uniqueRouteIds.forEach((routeId) => {
        routeSet.add(routeId)
      })

      weightedRouteScore += uniqueRouteIds.reduce((sum, routeId) => sum + (ROUTE_WEIGHTS[routeId] || 0.5), 0)
      if (uniqueRouteIds.length > 1) transferNodeCount += 1
    }
  })

  const uniqueRoutesWithinOneMile = routeSet.size
  const localStopCountNorm = clampZeroToOne(localStopCount.size / 4)
  const uniqueRoutesNorm = clampZeroToOne(uniqueRoutesWithinOneMile / 3)
  const weightedRouteNorm = clampZeroToOne(weightedRouteScore / 3)
  const transferNodeNorm = clampZeroToOne(transferNodeCount / 2)
  const serviceStrengthNorm = clampZeroToOne(
    (0.35 * localStopCountNorm)
    + (0.35 * uniqueRoutesNorm)
    + (0.2 * weightedRouteNorm)
    + (0.1 * transferNodeNorm),
  )

  return {
    localStopCount: localStopCount.size,
    transferStopCount: transferStopCount.size,
    uniqueRoutesWithinOneMile,
    weightedRouteScore,
    transferNodeCount,
    serviceStrengthNorm,
  }
}

export function buildModeShiftOpportunityLayer(featureCollection, cityId = 'phoenix', options = {}) {
  const features = featureCollection?.features || []
  if (!features.length) return { type: 'FeatureCollection', features: [] }

  const serviceNodes = getFixedGuidewayServiceNodes(cityId)
  const anchors = serviceNodes.map((node) => node.coordinates)
  const settings = getTransitGapSettings(cityId)
  const jobsByGeoid = options.jobsByGeoid || {}
  const zeroCarByGeoid = options.zeroCarByGeoid || {}
  const populationValues = features
    .map((feature) => Number(feature?.properties?.population))
    .filter((value) => Number.isFinite(value) && value > 0)
  const jobValues = features
    .map((feature) => Number(jobsByGeoid[feature?.properties?.geoid]))
    .filter((value) => Number.isFinite(value) && value > 0)
  const maxPopulation = Math.max(...populationValues, 1)
  const maxJobs = Math.max(...jobValues, 1)

  return {
    type: 'FeatureCollection',
    features: features.map((feature) => {
      const coordinates = feature?.geometry?.coordinates
      const geoid = feature?.properties?.geoid
      const population = Number(feature?.properties?.population) || 0
      const jobs = Number(jobsByGeoid[geoid]) || 0
      const zeroCarHouseholdsPct = Number(zeroCarByGeoid[geoid])
      const populationNorm = maxPopulation > 0 ? population / maxPopulation : 0
      const jobsNorm = maxJobs > 0 ? jobs / maxJobs : 0
      const nearestFixedGuidewayMiles = distanceToNearestAnchorMiles(coordinates, anchors)
      const distanceGapNorm = nearestFixedGuidewayMiles === null
        ? 0
        : clampZeroToOne(nearestFixedGuidewayMiles / settings.maxGapMiles)

      const nearbyService = summarizeNearbyService(coordinates, serviceNodes, settings)
      const routeDiversityNorm = clampZeroToOne(nearbyService.uniqueRoutesWithinOneMile / 3)
      const transitGapNorm = clampZeroToOne(
        (0.5 * distanceGapNorm)
        + (0.35 * (1 - nearbyService.serviceStrengthNorm))
        + (0.15 * (1 - routeDiversityNorm)),
      )

      const hasJobs = jobsNorm > 0
      const modeShiftScore = hasJobs
        ? (0.4 * populationNorm) + (0.35 * jobsNorm) + (0.25 * transitGapNorm)
        : (0.65 * populationNorm) + (0.35 * transitGapNorm)
      const modeShiftOpportunity = Math.round(modeShiftScore * 100)

      return {
        ...feature,
        properties: {
          ...feature.properties,
          jobs,
          jobsNorm,
          zeroCarHouseholdsPct: Number.isFinite(zeroCarHouseholdsPct) ? Math.round(zeroCarHouseholdsPct) : null,
          populationNorm,
          distanceGapNorm,
          transitGapNorm,
          nearestFixedGuidewayMiles,
          nearbyFixedGuidewayStops: nearbyService.localStopCount,
          nearbyTransferStops: nearbyService.transferStopCount,
          uniqueRoutesWithinOneMile: nearbyService.uniqueRoutesWithinOneMile,
          transferNodeCount: nearbyService.transferNodeCount,
          weightedRouteScore: nearbyService.weightedRouteScore,
          serviceStrengthNorm: nearbyService.serviceStrengthNorm,
          routeDiversityNorm,
          serviceGapModel: 'gtfs-derived-stop-and-route-context',
          modeShiftOpportunity,
          intensityNorm: modeShiftScore,
        },
      }
    }),
  }
}
