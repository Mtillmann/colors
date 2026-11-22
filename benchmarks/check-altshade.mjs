// Verifies the chroma-free AltShadeLookup returns exactly what the original (chroma-based) one did.
import chroma from 'chroma-js'
import { AltShadeLookup } from '../dist/index.js'
import { AltShadeLookup as OriginalAltShadeLookup } from './original-index.js'

const now = new AltShadeLookup(); const orig = new OriginalAltShadeLookup()
let n = 0; let diff = 0
const check = (r, g, b) => {
  n++
  const a = JSON.stringify(now.shadeByRGB(r, g, b, true)); const o = JSON.stringify(orig.shadeByRGB(r, g, b, true))
  const c = JSON.stringify(now.shade(chroma(r, g, b), true))
  if (a !== o || c !== o) { if (diff++ < 5) console.log('DIFF', r, g, b, a, c, o) }
}
for (let r = 0; r < 256; r += 3) for (let g = 0; g < 256; g += 3) for (let b = 0; b < 256; b += 3) check(r, g, b)
for (let v = 0; v < 256; v++) check(v, v, v)
console.log(`AltShadeLookup: ${n} colors checked, ${diff} differences`)
