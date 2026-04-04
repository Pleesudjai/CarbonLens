import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CITY_PRESETS, addCorridorLayer, addSegmentHighlight } from './mapUtils'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export default function CorridorMap({ city = 'phoenix', corridors = [], selectedSegment = null, onMapReady }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

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
      onMapReady?.(map)
    })
    return () => map.remove()
  }, [])

  // Fly to city when preset changes
  useEffect(() => {
    if (!mapRef.current) return
    const preset = CITY_PRESETS[city]
    if (preset) mapRef.current.flyTo({ center: preset.center, zoom: preset.zoom })
  }, [city])

  // Render corridor GeoJSON layers
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    const map = mapRef.current
    corridors.forEach((corridor, i) => {
      addCorridorLayer(map, corridor, i)
    })
  }, [corridors, loaded])

  // Highlight selected segment
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    addSegmentHighlight(mapRef.current, selectedSegment)
  }, [selectedSegment, loaded])

  return (
    <div ref={containerRef} className="h-full w-full rounded-lg" style={{ minHeight: 400 }} />
  )
}
