// README banner: one disc per shade, area = share of the perceptual (CIELAB) color space,
// packed into a cluster; each disc shows the shade name and how many colors have it.
// Usage: npm run build && node visualizers/shade-banner.js
import { DATASETS, save, png, esc, FONT, readData, baseShade } from './lib.js'

// ---------------------------------------------------------------- README banner
// One disc per base shade, area = share of the *perceptual* (CIELAB) volume of the sRGB gamut:
// the Lab space is sampled on an even grid, every in-gamut sample counts as one unit of volume.
function labToRgb (L, a, b) {
  const fy = (L + 16) / 116; const fx = fy + a / 500; const fz = fy - b / 200
  const f = t => t > 0.206896552 ? t * t * t : 0.12841855 * (t - 0.137931034)
  const x = 0.950470 * f(fx); const y = f(fy); const z = 1.088830 * f(fz)
  const lin = [
    3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
    -0.9692660 * x + 1.8760108 * y + 0.0415560 * z,
    0.0556434 * x - 0.2040259 * y + 1.0572252 * z
  ]
  if (lin.some(v => v < -1e-4 || v > 1 + 1e-4)) return null
  return lin.map(v => {
    v = Math.min(1, Math.max(0, v))
    return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))
  })
}

const srgbToLin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const linToSrgb = v => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))

const BANNER_ORDER = ['Red', 'Orange', 'Brown', 'Yellow', 'Green', 'Cyan', 'Blue', 'Violet', 'Purple', 'Magenta', 'Pink', 'White', 'Grey', 'Black']

function renderBanner (suffix) {
  const { byteToShadeOffset } = JSON.parse(readData(`binaryLookupMaps${suffix}.json`))
  const table = readData(`binaryLookup${suffix}.bin`, 'latin1')
  const edge = Math.round(Math.cbrt(table.length)); const step = 256 / edge
  const members = {}; let total = 0
  for (let L = 0.5; L < 100; L += 1) {
    for (let a = -127; a < 128; a += 2) {
      for (let b = -127; b < 128; b += 2) {
        const rgb = labToRgb(L, a, b)
        if (!rgb) continue
        const i = Math.floor(rgb[0] / step) * edge * edge + Math.floor(rgb[1] / step) * edge + Math.floor(rgb[2] / step)
        const shade = baseShade(byteToShadeOffset[table.charCodeAt(i)]);
        (members[shade] ??= []).push({ rgb, L, hue: Math.atan2(b, a) * 180 / Math.PI })
        total++
      }
    }
  }
  const S = 2 // supersampling of the embedded image
  const gap = 5; const margin = 20; const legendH = 22
  // colors per shade (by their first shade)
  const colorCount = {}
  for (const c of Object.values(JSON.parse(readData(`colorMap${suffix}.json`)))) {
    const s = baseShade(c.shade[0]); colorCount[s] = (colorCount[s] ?? 0) + 1
  }
  const maxShare = Math.max(...Object.values(members).map(l => l.length)) / total
  const k = 110 / Math.sqrt(maxShare) // radius of the largest disc
  const names = [...BANNER_ORDER.filter(s => members[s]), ...Object.keys(members).filter(s => !BANNER_ORDER.includes(s))]
  const discs = names.map(shade => {
    const list = members[shade]
    const R = k * Math.sqrt(list.length / total)
    const count = (colorCount[shade] ?? 0).toLocaleString('en')
    const nameFs = Math.min(16, 1.5 * R / (shade.length * 0.6))
    const nameInside = nameFs >= 9
    // discs too small for their name carry name and % below the disc, inside a larger slot
    const d = { shade, share: list.length / total, R, count, nameFs, nameInside, slot: nameInside ? R : Math.max(R + 4, 34) }
    let sx = 0; let sy = 0
    for (const m of list) { sx += Math.cos(m.hue * Math.PI / 180); sy += Math.sin(m.hue * Math.PI / 180) }
    const seam = Math.atan2(sy, sx) * 180 / Math.PI + 180
    for (const m of list) m.h2 = (m.hue - seam + 720) % 360
    // smooth field: radial = lightness rank (light center, equal-area), angle = hue rank,
    // swept there and back (mirrored) so there is no seam; each cell = mean color of its members
    list.sort((p, q) => q.L - p.L)
    const NR = 16; const NA = 24
    d.grid = Array.from({ length: NR }, (_, r) => {
      const ring = list.slice(Math.floor(r * list.length / NR), Math.floor((r + 1) * list.length / NR)).sort((p, q) => p.h2 - q.h2)
      return Array.from({ length: NA }, (_, c) => {
        const cell = ring.slice(Math.floor(c * ring.length / NA), Math.max(Math.floor(c * ring.length / NA) + 1, Math.floor((c + 1) * ring.length / NA)))
        const lin = [0, 1, 2].map(j => cell.reduce((acc, m) => acc + srgbToLin(m.rgb[j]), 0) / cell.length)
        return lin
      })
    })
    return d
  })
  pack(discs, 2.1, gap)
  const minX = Math.min(...discs.map(d => d.x - d.slot)); const maxX = Math.max(...discs.map(d => d.x + d.slot))
  const minY = Math.min(...discs.map(d => d.y - d.slot)); const maxY = Math.max(...discs.map(d => d.y + d.slot))
  const W = Math.ceil(maxX - minX + 2 * margin); const H = Math.ceil(maxY - minY + 2 * margin + legendH)
  for (const d of discs) {
    d.cx = d.x - minX + margin
    d.cy = d.y - minY + margin - (d.nameInside ? 0 : d.slot - d.R - 2) // small discs sit at the top of their slot
  }
  const iw = W * S; const ih = H * S
  const img = Buffer.alloc(iw * ih * 4, 0)
  for (const d of discs) {
    const R = (d.R + 1) * S; const cx = d.cx * S; const cy2 = d.cy * S
    for (let y = Math.max(0, Math.floor(cy2 - R)); y <= Math.min(ih - 1, Math.ceil(cy2 + R)); y++) {
      for (let px = Math.max(0, Math.floor(cx - R)); px <= Math.min(iw - 1, Math.ceil(cx + R)); px++) {
        const dx = px + 0.5 - cx; const dy = y + 0.5 - cy2; const rr = Math.hypot(dx, dy) / (d.R * S)
        if (rr > 1 + 1 / d.R) continue
        const NR = d.grid.length; const NA = d.grid[0].length
        const fr = Math.min(NR - 1, Math.max(0, Math.min(1, rr) ** 2 * NR - 0.5))
        const ang = ((Math.atan2(dy, dx) + 2.5 * Math.PI) % (2 * Math.PI)) / Math.PI // 0..2, top = 0
        const fa = Math.min(NA - 1, Math.max(0, (ang <= 1 ? ang : 2 - ang) * NA - 0.5))
        const r0 = Math.floor(fr); const r1 = Math.min(NR - 1, r0 + 1); const a0 = Math.floor(fa); const a1 = Math.min(NA - 1, a0 + 1)
        const wr = fr - r0; const wa = fa - a0
        const c = [0, 1, 2].map(j => linToSrgb(
          (1 - wr) * ((1 - wa) * d.grid[r0][a0][j] + wa * d.grid[r0][a1][j]) + wr * ((1 - wa) * d.grid[r1][a0][j] + wa * d.grid[r1][a1][j])))
        img.set([...c, 255], (y * iw + px) * 4)
      }
    }
  }
  const clip = discs.map(d => `<circle cx="${d.cx.toFixed(1)}" cy="${d.cy.toFixed(1)}" r="${d.R.toFixed(1)}"/>`).join('')
  const texts = discs.map(d => {
    const x = d.cx.toFixed(1); const pct = `${(100 * d.share).toFixed(1)}%`
    // black or white text by the disc's average color (WCAG)
    const cells = d.grid.flat()
    const mean = [0, 1, 2].map(j => cells.reduce((acc, c) => acc + c[j], 0) / cells.length)
    const lum = 0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2]
    const cls = (lum + 0.05) / 0.05 >= 1.05 / (lum + 0.05) ? 'in ink' : 'in paper'
    const out = []
    if (d.nameInside) {
      // three lines: name, color count (large), share
      const fs = Math.min(28, 1.45 * d.R / (d.count.length * 0.6), d.R * 0.5)
      const pfs = Math.max(9, d.nameFs * 0.75)
      const h = 0.75 * d.nameFs + 0.95 * fs + 1.0 * pfs
      const top = d.cy - h / 2
      out.push(`<text x="${x}" y="${(top + 0.75 * d.nameFs).toFixed(1)}" class="${cls} nm" font-size="${d.nameFs.toFixed(1)}">${esc(d.shade)}</text>`)
      out.push(`<text x="${x}" y="${(top + 0.75 * d.nameFs + 0.95 * fs).toFixed(1)}" class="${cls}" font-size="${fs.toFixed(1)}">${d.count}</text>`)
      out.push(`<text x="${x}" y="${(top + h).toFixed(1)}" class="${cls} pc" font-size="${pfs.toFixed(1)}">${pct}</text>`)
    } else {
      const fs = Math.min(1.45 * d.R / (d.count.length * 0.6), d.R * 0.9)
      out.push(`<text x="${x}" y="${(d.cy + 0.36 * fs).toFixed(1)}" class="${cls}" font-size="${fs.toFixed(1)}">${d.count}</text>`)
      out.push(`<text x="${x}" y="${(d.cy + d.R + 13).toFixed(1)}" class="n">${esc(d.shade)}</text>`)
      out.push(`<text x="${x}" y="${(d.cy + d.R + 25).toFixed(1)}" class="p">${pct}</text>`)
    }
    return out.map(t => '    ' + t).join('\n')
  })
  texts.push(`    <text x="${W / 2}" y="${H - 16}" class="p">number = colors with this shade · disc size and % = share of the perceptual (CIELAB) color space</text>`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>text{${FONT.replace(/font-family="(.*)"/, 'font-family:$1')};text-anchor:middle;fill:#1f2328}.n{font-size:13px;font-weight:600}.p{font-size:11px;fill:#4b535d}.in{font-weight:700;paint-order:stroke;stroke-width:2.5px;stroke-linejoin:round}.nm{font-weight:600}.pc{font-weight:500}.ink{fill:#111;stroke:#fff6}.paper{fill:#fff;stroke:#0006}
</style>
  <rect width="100%" height="100%" rx="18" fill="#d5d9de"/> <!-- solid card: reads the same on light and dark GitHub themes -->
  <defs><clipPath id="d">${clip}</clipPath></defs>
  <image width="${W}" height="${H}" clip-path="url(#d)" href="data:image/png;base64,${png(iw, ih, img).toString('base64')}"/>
  <g fill="none" stroke="#8888" stroke-width=".75">${clip}</g>
${texts.join('\n')}
</svg>
`
  save('shade-banner', suffix, svg, `${discs.map(d => `${d.shade} ${(100 * d.share).toFixed(1)}%`).join(', ')} (${(svg.length / 1024).toFixed(0)} KB)`)
}

for (const [suffix] of DATASETS) renderBanner(suffix)

// greedy circle packing into a rectangle of the given aspect ratio: largest first, each next circle
// goes to the free spot touching one or two placed circles that keeps the bounding box smallest
function pack (items, aspect, gap) {
  const placed = []
  for (const it of [...items].sort((a, b) => b.slot - a.slot)) {
    const r = it.slot
    let best = null
    const consider = (x, y) => {
      if (!placed.every(p => Math.hypot(p.x - x, p.y - y) >= p.slot + r + gap - 1e-6)) return
      const c = Math.max((Math.abs(x) + r) / aspect, Math.abs(y) + r) + 0.01 * Math.hypot(x / aspect, y)
      if (!best || c < best.c) best = { x, y, c }
    }
    if (!placed.length) consider(0, 0)
    for (const p of placed) {
      const d = p.slot + r + gap
      for (let a = 0; a < 48; a++) consider(p.x + d * Math.cos(a * Math.PI / 24), p.y + d * Math.sin(a * Math.PI / 24))
      for (const q of placed) {
        if (q === p) continue
        const d1 = d; const d2 = q.slot + r + gap; const D = Math.hypot(q.x - p.x, q.y - p.y)
        if (D > d1 + d2 || D < Math.abs(d1 - d2)) continue
        const a = (d1 * d1 - d2 * d2 + D * D) / (2 * D); const h = Math.sqrt(Math.max(0, d1 * d1 - a * a))
        const ux = (q.x - p.x) / D; const uy = (q.y - p.y) / D
        consider(p.x + a * ux - h * uy, p.y + a * uy + h * ux)
        consider(p.x + a * ux + h * uy, p.y + a * uy - h * ux)
      }
    }
    it.x = best.x; it.y = best.y; placed.push(it)
  }
}
