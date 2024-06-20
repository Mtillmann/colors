import type { Color } from 'chroma-js'

export default class ShadeLookup {
  binaryLookup: string
  samplingFactor: number
  edgeLength: number
  byteToShadeMap: Record<string, string>
  constructor (binaryLookup: string, byteToShadeMap: Record<string, string>) {
    this.samplingFactor = Math.cbrt(Math.pow(2, 24) / binaryLookup.length)
    this.binaryLookup = binaryLookup
    this.edgeLength = 256 / this.samplingFactor
    this.byteToShadeMap = byteToShadeMap
  }

  shade (color: Color): string {
    return this.shadeByRGB(...color.rgb())
  }

  shadeByRGB (r: number, g: number, b: number): string {
    r = ~~(r / this.samplingFactor)
    g = ~~(g / this.samplingFactor)
    b = ~~(b / this.samplingFactor)

    const p = (r * this.edgeLength * this.edgeLength) + g * this.edgeLength + b
    return this.byteToShadeMap[this.binaryLookup[p].charCodeAt(0)]
  }

  shades (color: Color, searchCubeEdgeLength: number = 3): Array<[string, number]> {
    return this.shadesByRGB(...color.rgb(), searchCubeEdgeLength)
  }

  shadesByRGB (r: number, g: number, b: number, searchCubeEdgeLength: number = 3): Array<[string, number]> {
    if (searchCubeEdgeLength < 1) {
      throw new Error('searchCubeEdgeLength must be greater than 0')
    }

    if (searchCubeEdgeLength % 2 === 0) {
      throw new Error('searchCubeEdgeLength must be an odd number')
    }

    const shades: Record<string, number> = {}
    const upper = ~~(searchCubeEdgeLength * 0.5)
    const lower = -upper

    for (let x = lower; x <= upper; x++) {
      const R = r + x * this.samplingFactor
      let G
      let B
      if (R > 255 || R < 0) {
        continue
      }
      for (let y = lower; y <= upper; y++) {
        G = g + y * this.samplingFactor
        if (G > 255 || G < 0) {
          continue
        }
        for (let z = lower; z <= upper; z++) {
          B = b + z * this.samplingFactor
          if (B > 255 || B < 0) {
            continue
          }
          const shade = this.shadeByRGB(R, G, B)
          if (!(shade in shades)) {
            shades[shade] = 1
            continue
          }
          shades[shade]++
        }
      }
    }

    const foundShades = Object.entries(shades)
    foundShades.sort((a, b) => b[1] - a[1])

    return foundShades
  }
}
