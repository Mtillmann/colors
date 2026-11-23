// One disc per shade, area = share of the RGB cube.
// Usage: npm run build && node visualizers/shade-discs.js
import { DATASETS, save, png, esc, FONT, readData, baseShade, rgbToHsl } from './lib.js'

// one disc per base shade, area proportional to its share of the RGB cube (from the shade table).
// Each disc is filled with the shade's own colors: rings from light (center) to dark (rim),
// hue around the ring.
function renderShadeDiscs (suffix, label) {
  const { byteToShadeOffset } = JSON.parse(readData(`binaryLookupMaps${suffix}.json`))
  const table = readData(`binaryLookup${suffix}.bin`, 'latin1')
  const edge = Math.round(Math.cbrt(table.length)); const step = 256 / edge
  const members = {}
  for (let i = 0; i < table.length; i++) {
    const r = Math.floor(i / (edge * edge)) * step + step / 2
    const g = Math.floor(i / edge) % edge * step + step / 2
    const b = i % edge * step + step / 2
    const shade = baseShade(byteToShadeOffset[table.charCodeAt(i)])
    const [hue, , l] = rgbToHsl(r, g, b);
    (members[shade] ??= []).push({ rgb: [r, g, b].map(Math.floor), hue: Number.isNaN(hue) ? 0 : hue, l })
  }
  const shades = Object.entries(members).sort((a, b) => b[1].length - a[1].length)
  const total = table.length
  const maxR = 120; const rings = 14
  const discs = shades.map(([shade, list]) => {
    const R = Math.max(8, maxR * Math.sqrt(list.length / shades[0][1].length))
    // put the hue seam opposite the shade's mean hue (where it has the fewest colors)
    let sx = 0; let sy = 0
    for (const m of list) { sx += Math.cos(m.hue * Math.PI / 180); sy += Math.sin(m.hue * Math.PI / 180) }
    const seam = Math.atan2(sy, sx) * 180 / Math.PI + 180
    for (const m of list) m.h2 = (m.hue - seam + 720) % 360
    list.sort((a, b) => b.l - a.l) // light first
    const ringLists = Array.from({ length: rings }, (_, k) =>
      list.slice(Math.floor(k * list.length / rings), Math.floor((k + 1) * list.length / rings)).sort((a, b) => a.h2 - b.h2))
    return { shade, share: list.length / total, R, ringLists }
  })
  // simple row layout
  const W = 900; const pad = 26; const labelH = 34; const top = 50
  let x = pad; let rowY = top; let rowH = 0; const rows = [[]]
  for (const d of discs) {
    const size = 2 * d.R
    if (x + size > W - pad && rows[rows.length - 1].length) { rows.push([]); x = pad }
    rows[rows.length - 1].push(d); x += size + pad
  }
  for (const row of rows) {
    rowH = Math.max(...row.map(d => 2 * d.R))
    const rowW = row.reduce((a, d) => a + 2 * d.R, 0) + pad * (row.length - 1)
    let cx = (W - rowW) / 2
    for (const d of row) { d.cx = cx + d.R; d.cy = rowY + rowH / 2; cx += 2 * d.R + pad }
    rowY += rowH + labelH
  }
  const H = rowY + 20
  const img = Buffer.alloc(W * H * 4, 0)
  for (const d of discs) {
    for (let y = Math.floor(d.cy - d.R); y <= Math.ceil(d.cy + d.R); y++) {
      for (let px = Math.floor(d.cx - d.R); px <= Math.ceil(d.cx + d.R); px++) {
        const dx = px + 0.5 - d.cx; const dy = y + 0.5 - d.cy; const rr = Math.hypot(dx, dy) / d.R
        if (rr > 1 || y < 0 || y >= H) continue
        const ring = d.ringLists[Math.min(rings - 1, Math.floor(rr * rr * rings))] // equal-area rings
        if (!ring.length) continue
        const t = ((Math.atan2(dy, dx) + 2.5 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI)
        img.set([...ring[Math.min(ring.length - 1, Math.floor(t * ring.length))].rgb, 255], (y * W + px) * 4)
      }
    }
  }
  const texts = discs.map(d => `    <text x="${d.cx.toFixed(1)}" y="${(d.cy + d.R + 15).toFixed(1)}" font-size="13" font-weight="600">${esc(d.shade)}</text>
    <text x="${d.cx.toFixed(1)}" y="${(d.cy + d.R + 29).toFixed(1)}" font-size="11" fill="#666">${(100 * d.share).toFixed(1)}%</text>`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 24}" viewBox="0 0 ${W} ${H + 24}">
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="${W / 2}" y="30" text-anchor="middle" font-size="22" font-weight="600" ${FONT} fill="#111">${esc(label)}</text>
  <image x="0" y="0" width="${W}" height="${H}" href="data:image/png;base64,${png(W, H, img).toString('base64')}"/>
  <g ${FONT} text-anchor="middle" fill="#111">
${texts.join('\n')}
  </g>
  <text x="${W / 2}" y="${H + 12}" text-anchor="middle" font-size="13" ${FONT} fill="#555">${esc('disc area = share of the RGB color space · light center → dark rim, hue around the ring')}</text>
</svg>
`
  save('shade-discs', suffix, svg, `${discs.length} shades, ${(svg.length / 1024).toFixed(0)} KB`)
}

for (const [suffix, name] of DATASETS) renderShadeDiscs(suffix, `Color shades – ${name} dataset`)
