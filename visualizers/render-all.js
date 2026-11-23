// Renders every visualization into visualizers/images/.
// Usage: npm run build && node visualizers/render-all.js
for (const s of ['shade-map', 'shade-wheel-radial', 'color-names', 'shade-discs', 'shade-banner']) await import(`./${s}.js`)
