import { type ColorMap } from './types/ColorMap'
import type { SimpleColor } from './types/SimpleColor'
import type { LookupResult } from './types/LookupResult'
import { deltaE2000, rgbDistance, rgbToHex, rgbToLab } from './colorMath'

/**
 * Exact nearest named color lookup without dependencies.
 * Compares the given color against every entry of the color map (brute force),
 * so the result is always the true closest match by CIEDE2000.
 */
export default class NearestColorLookup {
  colors: SimpleColor[]
  private readonly L: Float64Array
  private readonly A: Float64Array
  private readonly B: Float64Array
  options = {
    deltaEThreshold: 5
  }

  constructor (colorMap: ColorMap, options = {}) {
    this.colors = Object.values(colorMap)
    const n = this.colors.length
    this.L = new Float64Array(n)
    this.A = new Float64Array(n)
    this.B = new Float64Array(n)
    this.colors.forEach((c, i) => {
      this.L[i] = c.L
      this.A[i] = c.A
      this.B[i] = c.B
    })
    this.options = { ...this.options, ...options }
  }

  /** accepts anything with an rgb() method, e.g. a chroma-js Color */
  lookup (color: { rgb: () => number[] }, maxResults: number = 1): LookupResult {
    const [r, g, b] = color.rgb()
    return this.lookupByRGB(r, g, b, maxResults)
  }

  lookupByRGB (r: number, g: number, b: number, maxResults: number = 1): LookupResult {
    r = ~~r
    g = ~~g
    b = ~~b
    const [gL, gA, gB] = rgbToLab(r, g, b)

    // keep the maxResults smallest deltaEs (insertion into a tiny sorted list)
    const bestIdx: number[] = []
    const bestDE: number[] = []
    const n = this.colors.length
    for (let i = 0; i < n; i++) {
      const dE = deltaE2000(gL, gA, gB, this.L[i], this.A[i], this.B[i])
      if (bestDE.length === maxResults && dE >= bestDE[bestDE.length - 1]) continue
      let p = bestDE.length
      while (p > 0 && bestDE[p - 1] > dE) p--
      bestDE.splice(p, 0, dE)
      bestIdx.splice(p, 0, i)
      if (bestDE.length > maxResults) { bestDE.pop(); bestIdx.pop() }
    }

    const colors: SimpleColor[] = bestIdx.map((idx, k) => {
      const c = this.colors[idx]
      const result: SimpleColor = {
        ...c,
        deltaE: bestDE[k],
        euclideanDistance: rgbDistance(c.r, c.g, c.b, r, g, b)
      }
      if (bestDE[k] > this.options.deltaEThreshold) result.isFallback = true
      return result
    })

    const shades: Record<string, number> = {}
    const altShades: Record<string, number> = {}
    for (const c of colors) {
      for (const s of c.shade) shades[s] = (shades[s] ?? 0) + 1
      if (c.altShade !== undefined) altShades[c.altShade] = (altShades[c.altShade] ?? 0) + 1
    }
    const byCount = (x: [string, number], y: [string, number]): number => y[1] - x[1]

    return {
      matchedHex: colors[0].hex,
      givenColor: [r, g, b, gL, gA, gB],
      colors,
      shades: Object.entries(shades).sort(byCount),
      altShades: Object.entries(altShades).sort(byCount)
    }
  }

  /** shade of the exact nearest named color */
  shadeByRGB (r: number, g: number, b: number): string {
    return this.lookupByRGB(r, g, b, 1).colors[0].shade[0]
  }

  static hex (r: number, g: number, b: number): string {
    return rgbToHex(r, g, b)
  }
}
