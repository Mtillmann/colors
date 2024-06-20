import chroma from 'chroma-js'
import { type Color } from 'chroma-js'
import { type ColorMap } from './types/ColorMap'
import { type LookupCube } from './types/LookupCube'
import type { SimpleColor } from './types/SimpleColor'
import type { LookupResult } from './types/LookupResult'

export default class ColorLookup {
  colorMap: ColorMap
  lookupCube: LookupCube
  chromaCache = new Map<string, Color>()
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

  private cachedChromaByRGB (r: number, g: number, b: number): any {
    const key = `${r}_${g}_${b}`
    if (!this.chromaCache.has(key)) {
      this.chromaCache.set(key, chroma(r, g, b))
    }
    return this.chromaCache.get(key)
  }

  private getClosest (list: LookupCube | any[], index: number, length: number): string[] | any[] {
    return [
      list[index],
      list.slice(0, index).reverse().filter((i: any) => i !== null)[0],
      list.slice(index + 1, length).filter((i: any) => i !== null)[0]
    ].filter(i => i !== undefined && i !== null)
  }

  lookup (color: Color, maxResults?: number): any {
    const rgb = color.rgb()
    return this.lookupByRGB(rgb[0], rgb[1], rgb[2], maxResults)
  }

  lookupByRGB (r: number, g: number, b: number, maxResults?: number): any {
    r = ~~(r)
    g = ~~(g)
    b = ~~(b)

    const cacheKey: string = `${r}_${g}_${b}`

    if (this.lookupCache.has(cacheKey)) {
      return this.lookupCache.get(cacheKey)
    }

    const R = Math.floor(r / this.downsampleFactor)
    const G = Math.floor(g / this.downsampleFactor)
    const B = Math.floor(b / this.downsampleFactor)
    const L = this.lookupCube.length
    const givenColor = this.cachedChromaByRGB(r, g, b)
    const givenLAB: number[] = givenColor.lab()

    const foundColors: string[] = []

    this.getClosest(this.lookupCube, R, L)
      .forEach((gList: any[]) => {
        this.getClosest(gList, G, L)
          .forEach((bList: any[]) => {
            const values: string[] = this.getClosest(bList, B, L)
            if (values !== null) {
              // @ts-expect-error: values always is an array of strings
              foundColors.push(...[].concat(...values))
            }
          })
      })

    let fallBackColors: SimpleColor[] = []
    let colors: SimpleColor[] = []

    for (const color of foundColors) {
      const actualColor = this.colorMap[color]
      const deltaE = chroma.deltaE(
        chroma.lab(givenLAB[0], givenLAB[1], givenLAB[2]),
        chroma.lab(
          actualColor.L,
          actualColor.A,
          actualColor.B
        ))

      if (deltaE <= this.options.deltaEThreshold) {
        colors.push({
          ...actualColor,
          deltaE
        })

        if (maxResults && colors.length >= maxResults) {
          break
        }
      } else {
        if (fallBackColors.length === 0 || deltaE < fallBackColors[0].deltaE!) {
          fallBackColors = [{
            ...actualColor,
            deltaE,
            isFallback: true
          }]
        }
      }
    }

    if (colors.length === 0) {
      colors = fallBackColors
    }

    const shades: Record<string, number> = {}
    const altShades: Record<string, number> = {}

    for (const color of colors) {
      const altShade: string = color.altShade!
      if (!(altShade in altShades)) {
        altShades[altShade] = 0
      }
      altShades[altShade]++

      for (const shade of color.shade) {
        if (!(shade in shades)) {
          shades[shade] = 0
        }
        shades[shade]++
      }
    }

    colors.sort((a, b) => a.deltaE! - b.deltaE!)
    const shadeList = Object.entries(shades)
    shadeList.sort((a, b) => b[1] - a[1])

    const altShadeList = Object.entries(altShades)
    altShadeList.sort((a, b) => b[1] - a[1])

    const givenHex: string = givenColor.hex()
    colors = colors.map((c: SimpleColor) => {
      c.euclideanDistance = chroma.distance(c.hex, givenHex, 'rgb')
      return c
    })

    this.lookupCache.set(cacheKey, {
      matchedHex: colors[0].hex,
      givenColor: [r, g, b, givenLAB[0], givenLAB[1], givenLAB[2]],
      colors,
      shades: shadeList,
      altShades: altShadeList
    })

    return this.lookupCache.get(cacheKey)
  }
}
