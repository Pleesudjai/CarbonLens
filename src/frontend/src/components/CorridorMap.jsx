import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import BackgroundLayerControl from './BackgroundLayerControl'
import ExistingTransitLegend from './ExistingTransitLegend'
import LiveDataBadge from './LiveDataBadge'
import { getExistingStationPhoto, getExistingTransitGeojson, getExistingTransitStationsGeojson } from './existingTransit'
import {
  CITY_PRESETS,
  EXISTING_STATIONS_LAYER,
  addExistingTransitLayer,
  addExistingTransitStationsLayer,
  addSegmentHighlight,
  syncCorridorLayers,
  syncBackgroundOverlay,
} from './mapUtils'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
const DRAW_SOURCE = 'draw-line'
const DRAW_LAYER = 'draw-line-layer'
const DRAW_POINTS = 'draw-points'
const DRAW_POINTS_LAYER = 'draw-points-layer'
const DRAW_REFERENCE_SOURCE = 'draw-reference-line'
const DRAW_REFERENCE_LAYER = 'draw-reference-line-layer'

export default function CorridorMap({
  city = 'phoenix',
  corridors = [],
  selectedSegment = null,
  drawMode = false,
  drawReferenceGeojson = null,
  backgroundLayers = [],
  backgroundData = null,
  backgroundLoading = false,
  backgroundError = null,
  onBackgroundLayerChange,
  onDrawComplete,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const hoverPopupRef = useRef(null)
  const detailPopupRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const drawCoordsRef = useRef([])
  const onDrawCompleteRef = useRef(onDrawComplete)
  onDrawCompleteRef.current = onDrawComplete

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return
    const preset = CITY_PRESETS[city] || CITY_PRESETS.phoenix
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: preset.center,
      zoom: preset.zoom,
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('load', () => {
      mapRef.current = map
      setLoaded(true)
    })
    return () => map.remove()
  }, [])

  // Fly to city
  useEffect(() => {
    if (!mapRef.current) return
    const preset = CITY_PRESETS[city]
    if (preset) mapRef.current.flyTo({ center: preset.center, zoom: preset.zoom })
  }, [city])

  // Render corridor layers
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    addExistingTransitLayer(mapRef.current, getExistingTransitGeojson(city))
  }, [city, loaded])

  // Render background overlays below transit and corridor lines
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    syncBackgroundOverlay(
      mapRef.current,
      backgroundLayers,
      backgroundData?.layers?.roadCo2Pressure || backgroundData?.layers?.aadt,
      backgroundData?.layers?.modeShiftOpportunity || backgroundData?.layers?.population,
      backgroundData?.layers?.delayEmissionsHotspots,
    )
  }, [backgroundLayers, backgroundData, city, loaded])

  // Render proposed corridor layers
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    syncCorridorLayers(mapRef.current, corridors)
  }, [corridors, loaded])

  // Render existing stations above all lines
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    addExistingTransitStationsLayer(mapRef.current, getExistingTransitStationsGeojson(city))
  }, [city, corridors, loaded])

  // Hover tooltip for existing stations
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    if (!map.getLayer(EXISTING_STATIONS_LAYER)) return

    const popup = hoverPopupRef.current || new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      className: 'existing-station-popup',
    })
    hoverPopupRef.current = popup

    const onEnter = (e) => {
      if (drawMode) return
      const feature = e.features?.[0]
      if (!feature) return
      map.getCanvas().style.cursor = 'pointer'
      popup
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`<div style="font-size:12px;font-weight:600;color:#111827;">${feature.properties.name}</div>`)
        .addTo(map)
    }

    const onLeave = () => {
      map.getCanvas().style.cursor = drawMode ? 'crosshair' : ''
      popup.remove()
    }

    map.on('mouseenter', EXISTING_STATIONS_LAYER, onEnter)
    map.on('mouseleave', EXISTING_STATIONS_LAYER, onLeave)

    return () => {
      map.off('mouseenter', EXISTING_STATIONS_LAYER, onEnter)
      map.off('mouseleave', EXISTING_STATIONS_LAYER, onLeave)
      popup.remove()
    }
  }, [drawMode, loaded, city])

  // Click popup for existing stations with image
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    if (!map.getLayer(EXISTING_STATIONS_LAYER)) return

    const popup = detailPopupRef.current || new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: '300px',
      offset: 14,
      className: 'existing-station-detail-popup',
    })
    detailPopupRef.current = popup

    const onClickStation = (e) => {
      if (drawMode) return
      const feature = e.features?.[0]
      if (!feature) return

      const station = feature.properties || {}
      const photo = getExistingStationPhoto(feature)
      const photoHtml = photo?.photoUrl
        ? `
          <div>
            <img
              src="${photo.photoUrl}"
              alt="${station.name || 'Station photo'}"
              style="width:100%;height:140px;object-fit:cover;border-radius:10px;border:1px solid #e5e7eb;background:#f3f4f6;"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            />
            <div style="display:none;padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;font-size:12px;color:#6b7280;">
              Station photo unavailable.
            </div>
          </div>
          <div style="margin-top:8px;font-size:11px;color:#6b7280;line-height:1.35;">
            ${photo.photoCaption || 'Representative station photo'}
          </div>
          <div style="margin-top:2px;font-size:10px;color:#9ca3af;line-height:1.35;">
            Photo: ${photo.photoCredit || 'Wikimedia Commons'}
            ${photo.photoSourceUrl ? ` · <a href="${photo.photoSourceUrl}" target="_blank" rel="noreferrer" style="color:#2563eb;text-decoration:none;">source</a>` : ''}
          </div>
        `
        : `
          <div style="padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;font-size:12px;color:#6b7280;">
            Exact station photo not available in the catalog yet.
          </div>
        `

      popup
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`
          <div style="width:260px;">
            ${photoHtml}
            <div style="margin-top:10px;">
              <div style="font-size:13px;font-weight:700;color:#111827;line-height:1.3;">${station.name || 'Station'}</div>
              <div style="margin-top:4px;font-size:11px;color:#6b7280;">${station.route || ''}</div>
            </div>
          </div>
        `)
        .addTo(map)
    }

    map.on('click', EXISTING_STATIONS_LAYER, onClickStation)

    return () => {
      map.off('click', EXISTING_STATIONS_LAYER, onClickStation)
      popup.remove()
    }
  }, [drawMode, loaded, city])

  // Update draw preview line on map
  const updateDrawPreview = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const coords = drawCoordsRef.current
    const lineData = { type: 'Feature', geometry: { type: 'LineString', coordinates: coords.length >= 2 ? coords : [] }, properties: {} }
    const pointData = { type: 'FeatureCollection', features: coords.map((c) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: c }, properties: {} })) }

    if (map.getSource(DRAW_SOURCE)) {
      map.getSource(DRAW_SOURCE).setData(lineData)
      map.getSource(DRAW_POINTS).setData(pointData)
    } else {
      map.addSource(DRAW_SOURCE, { type: 'geojson', data: lineData })
      map.addLayer({
        id: DRAW_LAYER,
        type: 'line',
        source: DRAW_SOURCE,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#db2777',
          'line-width': 4.5,
          'line-opacity': 0.95,
          'line-dasharray': [2, 1.25],
        },
      })
      map.addSource(DRAW_POINTS, { type: 'geojson', data: pointData })
      map.addLayer({ id: DRAW_POINTS_LAYER, type: 'circle', source: DRAW_POINTS, paint: { 'circle-radius': 6, 'circle-color': '#ffffff', 'circle-stroke-color': '#000000', 'circle-stroke-width': 2 } })
    }
  }, [])

  // Clear draw preview
  const clearDrawPreview = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    drawCoordsRef.current = []
    const empty = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} }
    const emptyPts = { type: 'FeatureCollection', features: [] }
    if (map.getSource(DRAW_SOURCE)) map.getSource(DRAW_SOURCE).setData(empty)
    if (map.getSource(DRAW_POINTS)) map.getSource(DRAW_POINTS).setData(emptyPts)
  }, [])

  const syncDrawReference = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const safeData = drawMode && drawReferenceGeojson?.features?.length
      ? drawReferenceGeojson
      : { type: 'FeatureCollection', features: [] }

    if (map.getSource(DRAW_REFERENCE_SOURCE)) {
      map.getSource(DRAW_REFERENCE_SOURCE).setData(safeData)
      return
    }

    map.addSource(DRAW_REFERENCE_SOURCE, { type: 'geojson', data: safeData })
    map.addLayer({
      id: DRAW_REFERENCE_LAYER,
      type: 'line',
      source: DRAW_REFERENCE_SOURCE,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#374151',
        'line-width': 3,
        'line-opacity': 0.35,
        'line-dasharray': [0.8, 1.4],
      },
    })
  }, [drawMode, drawReferenceGeojson])

  // Finish drawing
  const finishDraw = useCallback(() => {
    const coords = drawCoordsRef.current
    if (coords.length >= 2 && onDrawCompleteRef.current) {
      onDrawCompleteRef.current({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [...coords] }, properties: {} }],
      })
    }
    clearDrawPreview()
  }, [clearDrawPreview])

  // Draw mode: click to place points, dblclick to finish
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    syncDrawReference()
  }, [drawMode, drawReferenceGeojson, loaded, syncDrawReference])

  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return

    if (!drawMode) {
      clearDrawPreview()
      return
    }

    drawCoordsRef.current = []
    map.getCanvas().style.cursor = 'crosshair'

    const onClick = (e) => {
      drawCoordsRef.current.push([e.lngLat.lng, e.lngLat.lat])
      updateDrawPreview()
    }

    const onDblClick = (e) => {
      e.preventDefault()
      finishDraw()
      map.getCanvas().style.cursor = ''
    }

    const onKeyDown = (e) => {
      if (e.key === 'Enter') { finishDraw(); map.getCanvas().style.cursor = '' }
      if (e.key === 'Escape') { clearDrawPreview(); map.getCanvas().style.cursor = '' }
    }

    map.on('click', onClick)
    map.on('dblclick', onDblClick)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      map.off('click', onClick)
      map.off('dblclick', onDblClick)
      window.removeEventListener('keydown', onKeyDown)
      map.getCanvas().style.cursor = ''
    }
  }, [drawMode, loaded, updateDrawPreview, clearDrawPreview, finishDraw])

  // Highlight selected segment
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    addSegmentHighlight(mapRef.current, selectedSegment)
  }, [selectedSegment, loaded])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full rounded-lg" style={{ minHeight: 400 }} />
      <BackgroundLayerControl
        city={city}
        value={backgroundLayers}
        onChange={onBackgroundLayerChange}
        hasData={Boolean(
          backgroundData?.layers?.roadCo2Pressure?.features?.length
            || backgroundData?.layers?.modeShiftOpportunity?.features?.length
            || backgroundData?.layers?.delayEmissionsHotspots?.features?.length
            || backgroundData?.layers?.aadt?.features?.length
            || backgroundData?.layers?.population?.features?.length,
        )}
        loading={backgroundLoading}
        error={backgroundError}
        sourceSummary={backgroundData?.meta?.sourceSummary}
        backgroundData={backgroundData}
      />
      <LiveDataBadge
        loading={backgroundLoading}
        error={backgroundError}
        sourceSummary={backgroundData?.meta?.sourceSummary}
      />
      <ExistingTransitLegend city={city} />
    </div>
  )
}
