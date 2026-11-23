// Named colors as dots over the shade borders (x = hue, y = lightness).
// Usage: npm run build && node visualizers/color-names.js
import { DATASETS, colorCount, renderShadeMap, save, png, esc, hex, FONT, readData, rgbToHsl } from './lib.js'

// named colors as dots: x = hue, y = lightness (as in the square map, saturation ignored);
// greys (saturation < 12%) go to an extra column on the right
function renderNames (suffix, label, map) {
  const { base, rgb, labels, w, h } = map
  const colors = Object.values(JSON.parse(readData(`colorMap${suffix}.json`)))
  const greyW = 70; const W = w + greyW; const top = 46; const bottom = 30
  const img = Buffer.alloc(W * h * 4, 255)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const nb = [x + 1 < w ? i + 1 : -1, y + 1 < h ? i + w : -1].filter(j => j >= 0 && rgb[j])
      if (nb.some(j => base[j] !== base[i])) img.set([200, 200, 200, 255], (y * W + x) * 4)
    }
    for (let x = w; x < w + 2; x++) img.set([200, 200, 200, 255], (y * W + x) * 4)
  }
  let seed = 1
  const jitter = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32 - 0.5)
  const r = colors.length > 2000 ? 2 : 3
  const dots = colors.map(c => {
    const [hue, sat, l] = rgbToHsl(c.r, c.g, c.b)
    const y = Math.max(r, Math.min(h - r, (0.97 - l) / 0.94 * (h - 1)))
    const x = Number.isNaN(hue) || sat < 0.12 ? w + greyW / 2 + jitter() * (greyW - 16) : hue / 360 * w
    return `<circle cx="${x.toFixed(1)}" cy="${(y + top).toFixed(1)}" r="${r}" fill="${hex([c.r, c.g, c.b])}"/>`
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h + top + bottom}" viewBox="0 0 ${W} ${h + top + bottom}">
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="${W / 2}" y="30" text-anchor="middle" font-size="22" font-weight="600" ${FONT} fill="#111">${esc(label)}</text>
  <image x="0" y="${top}" width="${W}" height="${h}" href="data:image/png;base64,${png(W, h, img).toString('base64')}"/>
  <g ${FONT} text-anchor="middle" dominant-baseline="middle" fill="#bbb">
${labels.filter(l => l.big).map(l => `    <text x="${l.x}" y="${l.y + top}" font-size="${l.size.toFixed(0)}" font-weight="600">${esc(l.shade)}</text>`).join('\n')}
    <text x="${w + greyW / 2}" y="${top + 14}" font-size="12" font-weight="600">greys</text>
  </g>
  <g stroke="#333" stroke-width="0.4" stroke-opacity="0.6">
${dots.join('\n')}
  </g>
  <text x="${W / 2}" y="${h + top + 20}" text-anchor="middle" font-size="13" ${FONT} fill="#555">${esc('hue → (left to right), lightness ↓, saturation ignored · grey lines = shade borders')}</text>
</svg>
`
  save('color-names-square', suffix, svg, `${colors.length} dots, ${(svg.length / 1024).toFixed(0)} KB`)
}

for (const [suffix, name] of DATASETS) {
  const count = colorCount(suffix)
  renderNames(suffix, `Color names – ${name} dataset (${count} colors)`, renderShadeMap('square', suffix, `Color shades – ${name} dataset (${count} colors)`, false))
}
