// Color wheel with the shade names written radially outside the rim.
// Usage: npm run build && node visualizers/shade-wheel-radial.js
import { DATASETS, colorCount, renderShadeMap, save, png, esc, FONT } from './lib.js'

// color wheel with the shade names written radially outside the rim, each connected to its region
function renderRadialWheel (suffix, label, map) {
  const { labels, w, h, img } = map
  const margin = 130; const top = 46; const bottom = 30
  const W = w + 2 * margin; const H = h + 2 * margin
  const cx = W / 2; const cy = top + H / 2; const R = w / 2 - 4
  const ptAngle = l => Math.atan2(l.y - h / 2 + 0.5, l.x - w / 2 + 0.5)
  // one outside label per shade (large regions only), placed in the direction of the shade's
  // largest region; every large region of that shade gets a line to the label
  const groups = new Map()
  for (const l of labels.filter(l => l.big)) {
    const g = groups.get(l.shade) ?? { shade: l.shade, regions: [] }
    g.regions.push(l); groups.set(l.shade, g)
  }
  const items = [...groups.values()].map(g => {
    const main = g.regions.reduce((a, b) => (b.area > a.area ? b : a))
    return { ...g, size: 15, a: ptAngle(main) }
  }).sort((p, q) => p.a - q.a)
  // spread labels so they do not overlap: enforce a minimum angular gap
  const gap = l => (l.size + 4) / (R + 16)
  for (let pass = 0; pass < 200; pass++) {
    let moved = false
    for (let k = 0; k < items.length; k++) {
      const p = items[k]; const q = items[(k + 1) % items.length]
      let d = q.a - p.a; if (k === items.length - 1) d += 2 * Math.PI
      const need = (gap(p) + gap(q)) / 2
      if (d < need) { const push = (need - d) / 2 + 1e-4; p.a -= push; q.a += push; moved = true }
    }
    if (!moved) break
  }
  const P = l => [cx - w / 2 + l.x, cy - h / 2 + l.y]
  const parts = items.map(l => {
    const deg = l.a * 180 / Math.PI
    const flip = Math.cos(l.a) < 0 // left half: rotate by 180° so the text reads left to right
    const rText = R + 16
    const tx = cx + Math.cos(l.a) * rText; const ty = cy + Math.sin(l.a) * rText
    const ex = cx + Math.cos(l.a) * (R + 4); const ey = cy + Math.sin(l.a) * (R + 4)
    const lines = l.regions.map(r => {
      const [px, py] = P(r)
      return `    <path d="M${px.toFixed(1)},${py.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}" stroke="#333" stroke-width="0.8" fill="none"/>
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.2" fill="#fff" stroke="#333" stroke-width="0.8"/>`
    }).join('\n')
    return `${lines}
    <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${l.size}" font-weight="600" text-anchor="${flip ? 'end' : 'start'}" dominant-baseline="middle" transform="rotate(${(flip ? deg + 180 : deg).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})">${esc(l.shade)}</text>`
  })
  // small islands: small label inside the wheel
  const small = labels.filter(l => !l.big).map(l => {
    const [px, py] = P(l)
    return `    <text x="${px.toFixed(1)}" y="${py.toFixed(1)}" font-size="10" text-anchor="middle" dominant-baseline="middle" stroke="#fff" stroke-width="2.5" paint-order="stroke" stroke-linejoin="round">${esc(l.shade)}</text>`
  })
  parts.push(...small)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + top + bottom}" viewBox="0 0 ${W} ${H + top + bottom}">
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="${W / 2}" y="30" text-anchor="middle" font-size="22" font-weight="600" ${FONT} fill="#111">${esc(label)}</text>
  <image x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" href="data:image/png;base64,${png(w, h, img).toString('base64')}"/>
  <g ${FONT} fill="#111">
${parts.join('\n')}
  </g>
  <text x="${W / 2}" y="${H + top + 20}" text-anchor="middle" font-size="13" ${FONT} fill="#555">${esc('hue = angle, saturation = distance from the center, 50% lightness')}</text>
</svg>
`
  save('shade-wheel-radial', suffix, svg, `${items.length} outside + ${small.length} inside labels, ${(svg.length / 1024).toFixed(0)} KB`)
}

for (const [suffix, name] of DATASETS) {
  const label = `Color shades – ${name} dataset (${colorCount(suffix)} colors)`
  renderRadialWheel(suffix, label, renderShadeMap('wheel', suffix, label, false))
}
