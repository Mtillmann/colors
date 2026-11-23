// Shade maps: square (hue × lightness) and wheel (hue × saturation), every pixel in its own color,
// borders between the base shades, regions labelled.
// Usage: npm run build && node visualizers/shade-map.js
import { DATASETS, colorCount, renderShadeMap, LAYOUTS } from './lib.js'



for (const [suffix, name] of DATASETS) {
  for (const layout of Object.keys(LAYOUTS)) renderShadeMap(layout, suffix, `Color shades – ${name} dataset (${colorCount(suffix)} colors)`)
}
