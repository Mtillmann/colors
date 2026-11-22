import { type ColorMap } from './types/ColorMap'
import { type LookupCube } from './types/LookupCube'
import type { SimpleColor } from './types/SimpleColor'
import type { LookupResult } from './types/LookupResult'
import { deltaE2000, rgbDistance, rgbToLab } from './colorMath'

/**
 * Grid-accelerated named color lookup.
 * The RGB cube is split into cells (lookupCube); a lookup collects the candidates of the
 * 3x3x3 cells around the given color (widening ring by ring while no candidate is found)
 * and ranks all of them by CIEDE2000.
 */
export default class ColorLookup {
  colorMap: ColorMap
  lookupCube: LookupCube
  lookupCache = new Map<string, LookupResult>()
  downsampleFactor: number = 0
  options = {
    deltaEThreshold: 5
  }

  constructor (lookupCube: LookupCube, colorMap: ColorMap, options = {}) {
    this.downsampleFactor = 256 / lookupCube.length
    this.colorMap = colorMap
    this.lookupCube = lookupCube
    this.options = {
      ...this.options,
      ...options
    }
  }

  /** accepts anything with an rgb() method, e.g. a chroma-js Color */
  lookup (color: { rgb: () => number[] }, maxResults?: number): any {
    const rgb = color.rgb()
    return this.lookupByRGB(rgb[0], rgb[1], rgb[2], maxResults)
  }

  /** hex keys of all colors in the cells within `radius` of cell (R, G, B) */
  private candidates (R: number, G: number, B: number, radius: number): string[] {
    const size = this.lookupCube.length
    const found: string[] = []
    for (let x = Math.max(0, R - radius); x <= Math.min(size - 1, R + radius); x++) {
      for (let y = Math.max(0, G - radius); y <= Math.min(size - 1, G + radius); y++) {
        for (let z = Math.max(0, B - radius); z <= Math.min(size - 1, B + radius); z++) {
          const cell = this.lookupCube[x][y][z]
          if (cell !== null && cell !== undefined) found.push(...cell)
        }
      }
    }
    return found
  }

  lookupByRGB (r: number, g: number, b: number, maxResults?: number): any {
    r = ~~(r)
    g = ~~(g)
    b = ~~(b)

    const cacheKey: string = `${r}_${g}_${b}`
    const cached = this.lookupCache.get(cacheKey)
    if (cached !== undefined) {
      return cached
    }

    const R = Math.floor(r / this.downsampleFactor)
    const G = Math.floor(g / this.downsampleFactor)
    const B = Math.floor(b / this.downsampleFactor)
    const [gL, gA, gB] = rgbToLab(r, g, b)

    let found: string[] = []
    for (let radius = 1; found.length === 0 && radius < this.lookupCube.length; radius++) {
      found = this.candidates(R, G, B, radius)
    }

    // rank every candidate, no early exit
    const ranked: SimpleColor[] = found.map(hex => {
      const c = this.colorMap[hex]
      return { ...c, deltaE: deltaE2000(gL, gA, gB, c.L, c.A, c.B) }
    })
    ranked.sort((x, y) => x.deltaE! - y.deltaE!)

    let colors = ranked.filter(c => c.deltaE! <= this.options.deltaEThreshold)
    if (maxResults !== undefined && maxResults > 0) colors = colors.slice(0, maxResults)
    if (colors.length === 0) colors = [{ ...ranked[0], isFallback: true }]

    const shades: Record<string, number> = {}
    const altShades: Record<string, number> = {}
    for (const color of colors) {
      const altShade: string = color.altShade!
      altShades[altShade] = (altShades[altShade] ?? 0) + 1
      for (const shade of color.shade) {
        shades[shade] = (shades[shade] ?? 0) + 1
      }
    }
    const shadeList = Object.entries(shades)
    shadeList.sort((a, b) => b[1] - a[1])
    const altShadeList = Object.entries(altShades)
    altShadeList.sort((a, b) => b[1] - a[1])

    for (const c of colors) {
      c.euclideanDistance = rgbDistance(c.r, c.g, c.b, r, g, b)
    }

    const result: LookupResult = {
      matchedHex: colors[0].hex,
      givenColor: [r, g, b, gL, gA, gB],
      colors,
      shades: shadeList,
      altShades: altShadeList
    }
    this.lookupCache.set(cacheKey, result)
    return result
  }
}
