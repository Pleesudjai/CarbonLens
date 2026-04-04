/**
 * drawUtils.js — Terra Draw setup for conceptual corridor sketching.
 * Wraps Terra Draw so the map component only calls initDraw / cleanupDraw.
 */
import { TerraDraw, TerraDrawLineStringMode, TerraDrawSelectMode } from 'terra-draw'
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter'

/**
 * Initialize Terra Draw on a MapLibre map instance.
 * Returns the TerraDraw instance and a cleanup function.
 *
 * @param {maplibregl.Map} map
 * @param {{ onFinish?: (feature: GeoJSON.Feature) => void }} opts
 * @returns {{ draw: TerraDraw, cleanup: () => void }}
 */
export function initDraw(map, opts = {}) {
  const draw = new TerraDraw({
    adapter: new TerraDrawMapLibreGLAdapter({ map }),
    modes: [
      new TerraDrawLineStringMode({
        styles: {
          lineStringColor: '#10b981',
          lineStringWidth: 4,
        },
      }),
      new TerraDrawSelectMode({
        flags: {
          linestring: {
            feature: { draggable: true, coordinates: { midpoints: true, draggable: true } },
          },
        },
      }),
    ],
  })

  draw.start()
  draw.setMode('linestring')

  // Listen for finished features
  if (opts.onFinish) {
    draw.on('finish', (id) => {
      const snapshot = draw.getSnapshot()
      const feature = snapshot.find((f) => f.id === id)
      if (feature) opts.onFinish(feature)
    })
  }

  const cleanup = () => {
    draw.stop()
  }

  return { draw, cleanup }
}

/**
 * Switch Terra Draw to select mode for editing existing corridors.
 * @param {TerraDraw} draw
 */
export function enableEditMode(draw) {
  draw.setMode('select')
}

/**
 * Switch Terra Draw back to line drawing mode.
 * @param {TerraDraw} draw
 */
export function enableDrawMode(draw) {
  draw.setMode('linestring')
}

/**
 * Get all drawn features as a GeoJSON FeatureCollection.
 * @param {TerraDraw} draw
 * @returns {GeoJSON.FeatureCollection}
 */
export function getDrawnFeatures(draw) {
  return {
    type: 'FeatureCollection',
    features: draw.getSnapshot(),
  }
}
