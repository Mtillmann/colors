// Shared helpers for the visualizers: data access, PNG encoder, shade-map rasterizer.
import fs from 'fs'
import zlib from 'zlib'
import { ShadeLookup, rgbToHsl } from '../dist/index.js'

export { rgbToHsl }
export const root = new URL('../', import.meta.url)
export const readData = (f, enc) => fs.readFileSync(new URL(`src/data/${f}`, root), enc)
export const DATASETS = [['', 'native'], ['.extended', 'extended']]
export const colorCount = suffix => Object.keys(JSON.parse(readData(`colorMap${suffix}.json`))).length
const OUT = new URL('visualizers/images/', root)
// writes visualizers/images/<name>[-extended].svg
export function save (name, suffix, svg, info) {
  fs.mkdirSync(OUT, { recursive: true })
  const file = `${name}${suffix ? '-extended' : ''}.svg`
  fs.writeFileSync(new URL(file, OUT), svg)
  console.log(`images/${file}: ${info}`)
}

// ---------------------------------------------------------------- helpers
export function hslToRgb (h, s, l) {
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255))
}
export const baseShade = s => s.replace(/^(Light|Dark) /, '')
export const FONT = 'font-family="system-ui,-apple-system,\'Segoe UI\',Helvetica,Arial,sans-serif"'
export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
export const hex = ([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32 (buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
export function png (width, height, rgba) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
    return Buffer.concat([len, td, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8 bit RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}

// ---------------------------------------------------------------- layouts
// each returns the RGB color at pixel (x, y), or null outside the shape
export const LAYOUTS = {
  square: {
    width: 720,
    height: 400,
    color: (x, y, w, h) => hslToRgb(360 * x / w, 1, 0.97 - 0.94 * y / (h - 1)),
    caption: 'hue → (left to right), lightness ↓ (light to dark), full saturation'
  },
  wheel: {
    width: 560,
    height: 560,
    color: (x, y, w, h) => {
      const dx = x - w / 2 + 0.5; const dy = y - h / 2 + 0.5; const r = Math.hypot(dx, dy) / (w / 2 - 4)
      if (r > 1) return null
      return hslToRgb((Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360, r, 0.5)
    },
    caption: 'hue = angle, saturation = distance from the center, 50% lightness'
  }
}

// ---------------------------------------------------------------- render
// rasterizes a 2D slice of the color space (LAYOUTS) with shade borders and region labels;
// writes shade-map-<layout> unless write = false. Returns the data the other visualizers reuse.
export function renderShadeMap (layoutName, suffix, label, write = true) {
  const L = LAYOUTS[layoutName]
  const { width: w, height: h } = L
  const { byteToShadeOffset } = JSON.parse(readData(`binaryLookupMaps${suffix}.json`))
  const lookup = new ShadeLookup(readData(`binaryLookup${suffix}.bin`, 'latin1'), byteToShadeOffset)

  const rgb = new Array(w * h)
  const full = new Array(w * h)
  const base = new Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const c = L.color(x, y, w, h)
      rgb[i] = c
      if (c) { full[i] = lookup.shadeByRGB(...c); base[i] = baseShade(full[i]) }
    }
  }

  // majority filter: smooths the staircase edges of the 64-step table and removes speckles
  const R = 4
  for (let pass = 0; pass < 2; pass++) {
    const next = base.slice()
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (!rgb[i]) continue
        const votes = {}
        for (let dy = -R; dy <= R; dy++) {
          for (let dx = -R; dx <= R; dx++) {
            const nx = x + dx; const ny = y + dy
            if (nx < 0 || ny < 0 || nx >= w || ny >= h || !rgb[ny * w + nx]) continue
            const s = base[ny * w + nx]; votes[s] = (votes[s] ?? 0) + 1
          }
        }
        let bestShade = base[i]; let bestVotes = 0
        for (const s in votes) if (votes[s] > bestVotes) { bestVotes = votes[s]; bestShade = s }
        next[i] = bestShade
      }
    }
    for (let i = 0; i < base.length; i++) base[i] = next[i]
  }

  // pixels: color, dark line between base shades
  const img = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (!rgb[i]) continue
      let [r, g, b] = rgb[i]
      const nb = [x + 1 < w ? i + 1 : -1, y + 1 < h ? i + w : -1].filter(j => j >= 0 && rgb[j])
      if (nb.some(j => base[j] !== base[i])) { r = g = b = 25 }
      img.set([r, g, b, 255], i * 4)
    }
  }

  // labels: for every connected region of one base shade, put the label at the pixel
  // farthest from the region's border (multi-source BFS distance transform)
  const seen = new Uint8Array(w * h)
  const labels = []
  const bigArea = w * h * 0.008
  const minLabelArea = w * h * 0.0012
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !rgb[start]) continue
    const shade = base[start]
    const region = [start]; seen[start] = 1
    for (let k = 0; k < region.length; k++) {
      const i = region[k]; const x = i % w; const y = (i / w) | 0
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const j = ny * w + nx
        if (!seen[j] && rgb[j] && base[j] === shade) { seen[j] = 1; region.push(j) }
      }
    }
    if (region.length < minLabelArea) continue // tiny island: border only
    const inRegion = new Set(region)
    const dist = new Map()
    const queue = []
    for (const i of region) {
      const x = i % w; const y = (i / w) | 0
      const edge = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].some(([nx, ny]) =>
        nx < 0 || ny < 0 || nx >= w || ny >= h || !inRegion.has(ny * w + nx))
      if (edge) { dist.set(i, 0); queue.push(i) }
    }
    let best = queue[0] ?? region[0]
    for (let k = 0; k < queue.length; k++) {
      const i = queue[k]; const x = i % w; const y = (i / w) | 0
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        const j = ny * w + nx
        if (inRegion.has(j) && !dist.has(j)) { dist.set(j, dist.get(i) + 1); queue.push(j); best = j }
      }
    }
    const big = region.length >= bigArea
    let sx = 0; let sy = 0
    for (const i of region) {
      const a = Math.atan2(((i / w) | 0) - h / 2 + 0.5, (i % w) - w / 2 + 0.5)
      sx += Math.cos(a); sy += Math.sin(a)
    }
    labels.push({
      shade, x: best % w, y: (best / w) | 0, big, area: region.length,
      angle: Math.atan2(sy, sx), // mean direction of the region seen from the center (used by the radial wheel)
      size: big ? Math.max(12, Math.min(24, Math.sqrt(region.length) / 6)) : 10
    })
  }

  const top = 46; const bottom = 30
  const font = FONT
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + top + bottom}" viewBox="0 0 ${w} ${h + top + bottom}">
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="${w / 2}" y="30" text-anchor="middle" font-size="22" font-weight="bold" ${font} fill="#111">${esc(label)}</text>
  <image x="0" y="${top}" width="${w}" height="${h}" href="data:image/png;base64,${png(w, h, img).toString('base64')}"/>
  <g ${font} text-anchor="middle" dominant-baseline="middle" fill="#111" stroke="#fff" stroke-width="3" paint-order="stroke" stroke-linejoin="round">
${labels.map(l => `    <text x="${l.x}" y="${l.y + top}" font-size="${l.size.toFixed(0)}" font-weight="${l.big ? 600 : 400}">${esc(l.shade)}</text>`).join('\n')}
  </g>
  <text x="${w / 2}" y="${h + top + 20}" text-anchor="middle" font-size="13" ${font} fill="#555">${esc(L.caption)}</text>
</svg>
`
  if (write) save(`shade-map-${layoutName}`, suffix, svg, `${labels.length} labels, ${(svg.length / 1024).toFixed(0)} KB`)
  return { base, rgb, labels, w, h, img }
}
