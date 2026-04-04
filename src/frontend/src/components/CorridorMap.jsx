import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CITY_PRESETS, addCorridorLayer, addSegmentHighlight } from './mapUtils'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
const DRAW_SOURCE = 'draw-line'
const DRAW_LAYER = 'draw-line-layer'
const DRAW_POINTS = 'draw-points'
const DRAW_POINTS_LAYER = 'draw-points-layer'

export default function CorridorMap({ city = 'phoenix', corridors = [], selectedSegment = null, drawMode = false, onDrawComplete }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const drawCoordsRef = useRef([])

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
    corridors.forEach((corridor, i) => addCorridorLayer(mapRef.current, corridor, i))
  }, [corridors, loaded])

  // Highlight selected segment
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    addSegmentHighlight(mapRef.current, selectedSegment)
  }, [selectedSegment, loaded])

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
      map.addLayer({ id: DRAW_LAYER, type: 'line', source: DRAW_SOURCE, paint: { 'line-color': '#059669', 'line-width': 4 } })
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

  // Finish drawing
  const finishDraw = useCallback(() => {
    const coords = drawCoordsRef.current
    if (coords.length >= 2 && onDrawComplete) {
      onDrawComplete({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [...coords] }, properties: {} }],
      })
    }
    clearDrawPreview()
  }, [onDrawComplete, clearDrawPreview])

  // Draw mode: click to place points, dblclick to finish
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

  return (
    <div ref={containerRef} className="h-full w-full rounded-lg" style={{ minHeight: 400 }} />
  )
}
