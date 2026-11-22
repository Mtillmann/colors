// Compares old ColorLookup / ShadeLookup with the new NearestColorLookup for speed and match quality.
// Usage: npm run build && node benchmarks/compare.mjs [count]
import fs from 'fs'
import chroma from 'chroma-js'
import { ColorLookup, NearestColorLookup, rgbToLab, deltaE2000 } from '../dist/index.js'
// original implementation from main (built), for comparison
import { ColorLookup as OriginalColorLookup, ShadeLookup } from './original-index.js'

const d = new URL('../src/data/', import.meta.url)
const colorMap = JSON.parse(fs.readFileSync(new URL('colorMap.json', d)))
const lookupCube = JSON.parse(fs.readFileSync(new URL('lookupCube.json', d)))
const binaryLookup = fs.readFileSync(new URL('binaryLookup.bin', d), 'latin1')
const { byteToShadeOffset } = JSON.parse(fs.readFileSync(new URL('binaryLookupMaps.json', d)))
const all = Object.values(colorMap)

const N = Number(process.argv[2] ?? 20000)
let seed = 42
const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 24
const inputs = []
const seen = new Set()
while (inputs.length < N) {
  const c = [rnd(), rnd(), rnd()]
  const k = c.join()
  if (!seen.has(k)) { seen.add(k); inputs.push(c) }
}

// 1) new math must equal chroma-js
let maxLab = 0; let maxDE = 0
for (const [r, g, b] of inputs.slice(0, 500)) {
  const a = chroma(r, g, b).lab(); const m = rgbToLab(r, g, b)
  maxLab = Math.max(maxLab, ...a.map((v, i) => Math.abs(v - m[i])))
  for (const c of all.slice(0, 200)) {
    const e1 = chroma.deltaE(chroma.lab(...a), chroma.lab(c.L, c.A, c.B))
    const e2 = deltaE2000(m[0], m[1], m[2], c.L, c.A, c.B)
    maxDE = Math.max(maxDE, Math.abs(e1 - e2))
  }
}
console.log(`math check vs chroma-js: max Lab diff ${maxLab.toExponential(1)}, max deltaE diff ${maxDE.toExponential(1)}`)

// 2) ground truth: exact nearest by brute force
const truth = inputs.map(([r, g, b]) => {
  const [L, A, B] = rgbToLab(r, g, b)
  let best = Infinity; let bi = 0
  all.forEach((c, i) => { const e = deltaE2000(L, A, B, c.L, c.A, c.B); if (e < best) { best = e; bi = i } })
  return { dE: best, color: all[bi] }
})

const time = (fn) => { const t = performance.now(); const out = inputs.map(fn); return { ms: performance.now() - t, out } }

// warm up JIT on a different seed range, fresh instances for timing (old ColorLookup caches per RGB)
for (let i = 0; i < 300; i++) { new OriginalColorLookup(lookupCube, colorMap).lookupByRGB(i % 256, (i * 7) % 256, (i * 13) % 256, 1); new ColorLookup(lookupCube, colorMap).lookupByRGB(i % 256, (i * 7) % 256, (i * 13) % 256, 1) }
const nearestWarm = new NearestColorLookup(colorMap)
for (let i = 0; i < 300; i++) nearestWarm.lookupByRGB(i % 256, (i * 7) % 256, (i * 13) % 256, 1)

const oldLookup = new OriginalColorLookup(lookupCube, colorMap)
const oldRes = time(([r, g, b]) => oldLookup.lookupByRGB(r, g, b, 1))
const fixedLookup = new ColorLookup(lookupCube, colorMap)
const fixedRes = time(([r, g, b]) => fixedLookup.lookupByRGB(r, g, b, 1))
const newLookup = new NearestColorLookup(colorMap)
const newRes = time(([r, g, b]) => newLookup.lookupByRGB(r, g, b, 1))
const shadeLookup = new ShadeLookup(binaryLookup, byteToShadeOffset)
const shadeRes = time(([r, g, b]) => shadeLookup.shadeByRGB(r, g, b))

const quality = (res) => {
  let exact = 0; let sum = 0; let max = 0; let over1 = 0; let over3 = 0
  res.out.forEach((o, i) => {
    const extra = o.colors[0].deltaE - truth[i].dE
    if (extra < 1e-3) exact++
    sum += Math.max(0, extra); max = Math.max(max, extra)
    if (extra > 1) over1++
    if (extra > 3) over3++
  })
  return { exact, avgExtra: sum / N, max, over1, over3 }
}
const shadeOk = (shadeOf) => inputs.reduce((n, _, i) => n + (truth[i].color.shade.includes(shadeOf(i)) ? 1 : 0), 0)

const pct = (x) => (100 * x / N).toFixed(1) + '%'
const qo = quality(oldRes); const qn = quality(newRes); const qf = quality(fixedRes)
const ms = (res) => (1000 * res.ms / N).toFixed(1) + ' µs'
const shadePct = (res) => pct(shadeOk(i => res.out[i].shades[0][0]))
const rows = [
  ['', 'original grid', 'fixed grid', 'brute force'],
  ['per lookup', ms(oldRes), ms(fixedRes), ms(newRes)],
  ['closest color found', pct(qo.exact), pct(qf.exact), pct(qn.exact)],
  ['avg extra deltaE', qo.avgExtra.toFixed(3), qf.avgExtra.toFixed(3), qn.avgExtra.toFixed(3)],
  ['max extra deltaE', qo.max.toFixed(2), qf.max.toFixed(2), qn.max.toFixed(2)],
  ['extra deltaE > 1', pct(qo.over1), pct(qf.over1), pct(qn.over1)],
  ['extra deltaE > 3', pct(qo.over3), pct(qf.over3), pct(qn.over3)],
  ['shade correct', shadePct(oldRes), shadePct(fixedRes), shadePct(newRes)]
]
console.log(`\n${N} unique random colors, ground truth = exact nearest of ${all.length} named colors\n`)
for (const r of rows) console.log(r[0].padEnd(22) + r[1].padEnd(16) + r[2].padEnd(16) + r[3])
console.log(`\nShadeLookup (binary table from src/data): ${(1000 * shadeRes.ms / N).toFixed(2)} µs/lookup, shade correct ${pct(shadeOk(i => shadeRes.out[i]))}`)
