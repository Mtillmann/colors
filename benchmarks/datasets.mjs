// Compares shade inference (v0.1.1 method vs. voting + second shade) and the native vs. extended dataset.
// Usage: npm run build && node benchmarks/datasets.mjs [count] [baselineGitRef]
import fs from 'fs'
import { execSync } from 'child_process'
import { ColorLookup, NearestColorLookup, ShadeLookup, rgbToLab, deltaE2000 } from '../dist/index.js'
import { inferShades } from '../scripts/shade-inference.js'

const N = Number(process.argv[2] ?? 2000)
const baselineRef = process.argv[3] ?? 'v0.1.1'
const data = (f) => new URL(`../src/data/${f}`, import.meta.url)
const readJSON = (f) => JSON.parse(fs.readFileSync(data(f)))
const hexToLab = (hex) => { const n = parseInt(hex.slice(1), 16); return rgbToLab(n >> 16, (n >> 8) & 255, n & 255) }
const pct = (x, n) => (100 * x / n).toFixed(1) + '%'
const table = (rows, w = 30) => rows.forEach(r => console.log(r.map((c, i) => String(c).padEnd(i ? 24 : w)).join('')))

// ---------------------------------------------------------------- 1) shade inference
// leave-one-out on the human-labelled colors: hide a label, infer it from the others
const human = new Map()
for (const f of ['wikipedia-shades.json', 'cssgradient-io-shades.json']) {
  for (const e of JSON.parse(fs.readFileSync(new URL(`../sources/${f}`, import.meta.url)))) {
    const hex = e.hex.toUpperCase()
    const c = human.get(hex) ?? { lab: hexToLab(hex), shades: [] }
    for (const s of e.shade) if (!c.shades.includes(s)) c.shades.push(s)
    human.set(hex, c)
  }
}
const labelled = [...human.values()]

// method used up to v0.1.1: shade of the single closest labelled color
const closestOnly = (lab, others) => {
  let best = Infinity; let shade = null
  for (const o of others) { const d = deltaE2000(...lab, ...o.lab); if (d < best && d <= 50) { best = d; shade = o.shades[0] } }
  return [shade]
}
const loo = (infer) => {
  let first = 0; let any = 0; let two = 0
  labelled.forEach((c, i) => {
    const others = labelled.filter((_, j) => j !== i)
    const shades = infer(c.lab, others)
    if (c.shades.includes(shades[0])) first++
    if (shades.some(s => c.shades.includes(s))) any++
    if (shades.length > 1) two++
  })
  return { first, any, two }
}
const oldInf = loo(closestOnly)
const newInf = loo((lab, others) => inferShades(lab, others, { secondRatio: 0.7 }).shades)
const L = labelled.length
console.log(`\n1) Shade inference, leave-one-out on ${L} human-labelled colors\n`)
table([
  ['', 'closest only (≤0.1.1)', '5-NN vote + 2nd shade'],
  ['first shade correct', pct(oldInf.first, L), pct(newInf.first, L)],
  ['correct shade among shown', pct(oldInf.any, L), pct(newInf.any, L)],
  ['shows two shades', pct(oldInf.two, L), pct(newInf.two, L)]
])

// ---------------------------------------------------------------- 2) native data vs. baseline
const nativeMap = readJSON('colorMap.json')
let baseline = null
try { baseline = JSON.parse(execSync(`git show ${baselineRef}:src/data/colorMap.json`, { maxBuffer: 1 << 26 })) } catch { }
console.log(`\n2) Native dataset vs. ${baselineRef}\n`)
if (baseline) {
  const keys = Object.keys(nativeMap)
  const changed = keys.filter(k => JSON.stringify(nativeMap[k].shade) !== JSON.stringify(baseline[k]?.shade)).length
  const twoNow = keys.filter(k => nativeMap[k].shade.length > 1).length
  const twoThen = keys.filter(k => baseline[k]?.shade.length > 1).length
  console.log(`colors: ${keys.length}, shade changed: ${changed}, colors with 2+ shades: ${twoThen} -> ${twoNow}`)
} else console.log(`(baseline ${baselineRef} not found)`)

// ---------------------------------------------------------------- 3) native vs. extended
let seed = 7
const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 24
const inputs = Array.from({ length: N }, () => [rnd(), rnd(), rnd()])

const evaluate = (suffix) => {
  const colorMap = readJSON(`colorMap${suffix}.json`)
  const cube = readJSON(`lookupCube${suffix}.json`)
  const bin = fs.readFileSync(data(`binaryLookup${suffix}.bin`), 'latin1')
  const { byteToShadeOffset } = readJSON(`binaryLookupMaps${suffix}.json`)
  const nearest = new NearestColorLookup(colorMap)
  const grid = new ColorLookup(cube, colorMap)
  const shade = new ShadeLookup(bin, byteToShadeOffset)
  const time = (fn) => { const t = performance.now(); const out = inputs.map(fn); return { us: 1000 * (performance.now() - t) / N, out } }
  const exact = time(([r, g, b]) => nearest.lookupByRGB(r, g, b, 1).colors[0])
  const fast = time(([r, g, b]) => grid.lookupByRGB(r, g, b, 1).colors[0])
  const tab = time(([r, g, b]) => shade.shadeByRGB(r, g, b))
  const dEs = exact.out.map(c => c.deltaE).sort((a, b) => a - b)
  const gridExact = fast.out.filter((c, i) => c.deltaE - exact.out[i].deltaE < 1e-3).length
  const tabOk = tab.out.filter((s, i) => exact.out[i].shade.includes(s)).length
  const bytes = ['colorMap', 'lookupCube'].reduce((n, f) => n + fs.statSync(data(`${f}${suffix}.json`)).size, 0) + bin.length
  return {
    count: Object.keys(colorMap).length,
    names: Object.values(colorMap).reduce((n, c) => n + c.alias.length, 0),
    avg: dEs.reduce((a, b) => a + b, 0) / N,
    median: dEs[N >> 1],
    within2: dEs.filter(d => d <= 2).length,
    within5: dEs.filter(d => d <= 5).length,
    nearestUs: exact.us, gridUs: fast.us, tabUs: tab.us, gridExact, tabOk, bytes,
    firstShade: exact.out.map(c => c.shade[0])
  }
}
const nat = evaluate('')
const ext = evaluate('.extended')
const sameShade = nat.firstShade.filter((s, i) => s === ext.firstShade[i]).length
console.log(`\n3) Native vs. extended dataset, ${N} random colors\n`)
table([
  ['', 'native', 'extended'],
  ['colors / names', `${nat.count} / ${nat.names}`, `${ext.count} / ${ext.names}`],
  ['data size (map+cube+table)', (nat.bytes / 1024).toFixed(0) + ' KB', (ext.bytes / 1024).toFixed(0) + ' KB'],
  ['closest name: avg deltaE', nat.avg.toFixed(2), ext.avg.toFixed(2)],
  ['closest name: median deltaE', nat.median.toFixed(2), ext.median.toFixed(2)],
  ['closest name within dE 2', pct(nat.within2, N), pct(ext.within2, N)],
  ['closest name within dE 5', pct(nat.within5, N), pct(ext.within5, N)],
  ['NearestColorLookup', nat.nearestUs.toFixed(0) + ' µs', ext.nearestUs.toFixed(0) + ' µs'],
  ['ColorLookup', nat.gridUs.toFixed(0) + ' µs', ext.gridUs.toFixed(0) + ' µs'],
  ['ColorLookup finds closest', pct(nat.gridExact, N), pct(ext.gridExact, N)],
  ['ShadeLookup', nat.tabUs.toFixed(2) + ' µs', ext.tabUs.toFixed(2) + ' µs'],
  ['ShadeLookup shade correct', pct(nat.tabOk, N), pct(ext.tabOk, N)]
])
console.log(`\nsame first shade for native and extended: ${pct(sameShade, N)}`)
