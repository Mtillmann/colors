import { type Color } from 'chroma-js'
import chroma from 'chroma-js'

export default class {
  shadeMap: Record<string, string> = {
    Black: 'Black',
    'Olive Greenish Grey': 'Black',
    'Very Dark Violet': 'Black',
    'Very Dark Purple Red': 'Black',
    'Very Dark Purple': 'Black',
    'Deep Dark Blue Green': 'Black',
    'Deep Navy Blue': 'Black',
    'Brownish Dark Grey': 'Black',
    'Light Azure': 'Blue',
    'Medium Blue': 'Blue',
    'Violet Blue': 'Blue',
    'Sky Blue': 'Blue',
    'Light Greyish Azure': 'Blue',
    Azure: 'Blue',
    'Greyish Blue': 'Blue',
    'Cyanish Grey': 'Blue',
    Blue: 'Blue',
    'Dark Greyish Cyan': 'Blue',
    'Light Greyish Yellow-Brown': 'Brown',
    'Light Greyish Red-Orange': 'Brown',
    'Orangish Grey': 'Brown',
    'Light Red-Orange': 'Brown',
    'Greyish Yellow Brown': 'Brown',
    'Grey Orange': 'Brown',
    'Greyish Red Orange': 'Brown',
    'Brownish Grey': 'Brown',
    'Yellowish Brown, Tan': 'Brown',
    'Greyish Brown': 'Brown',
    'Orange Brown': 'Brown',
    'Light Greenish Blue': 'Cyan',
    Cyan: 'Cyan',
    'Bluish Green': 'Cyan',
    'Greyish Cyan': 'Cyan',
    'Greyish Cyan Green': 'Cyan',
    'Dark Blue': 'Dark Blue',
    'Dark Greenish Blue': 'Dark Blue',
    'Dark Navy Blue': 'Dark Blue',
    'Navy Blue': 'Dark Blue',
    'Greyish Brown Green': 'Dark Brown',
    'Very Dark Brown': 'Dark Brown',
    'Dark Grey': 'Dark Brown',
    'Dark Brown': 'Dark Brown',
    'Greenish Blue': 'Dark Cyan',
    'Greyish Olive Green': 'Dark Green',
    'Medium Dark Green': 'Dark Green',
    'Deep Dark Green': 'Dark Green',
    'Dark Olive Green': 'Dark Green',
    'Dark Blue Green': 'Dark Green',
    'Dark Green': 'Dark Green',
    'Dark Cyanish Grey': 'Dark Grey',
    'Dark Red Purple': 'Dark Magenta',
    'Dark Purple Red': 'Dark Magenta',
    'Dark Orange': 'Dark Orange',
    'Dark Red': 'Dark Red',
    'Dark Violet': 'Dark Violet',
    'Dark Purple': 'Dark Violet',
    'Yellowish Brown': 'Dark Yellow',
    'Orange Yellow': 'Dark Yellow',
    Yellow: 'Dark Yellow',
    Brown: 'Dark Yellow',
    'Cyan Green': 'Green',
    'Light Greyish Green': 'Green',
    'Greenish Grey': 'Green',
    'Cyanish Green': 'Green',
    'Yellowish Grey': 'Green',
    'Greyish Green': 'Green',
    'Olive-Greenish Grey': 'Green',
    'Dark Greenish Grey': 'Green',
    'Greyish Yellow-Green': 'Green',
    'Spring Green': 'Green',
    'Greyish Yellow': 'Green',
    'Dark Greyish Green': 'Green',
    'Greenish Yellow': 'Green',
    'Yellowish Green': 'Green',
    'Yellow Green': 'Green',
    'Olive Green': 'Green',
    'Bright Green': 'Green',
    Green: 'Green',
    Grey: 'Grey',
    'Light Purple Grey': 'Grey',
    'Light Grey': 'Grey',
    'Light Brownish Grey': 'Grey',
    'Light Yellowish Grey': 'Grey',
    'Light Greenish Grey': 'Grey',
    'Purplish Grey': 'Grey',
    'Bluish Grey': 'Grey',
    'Purple Grey': 'Grey',
    undefined: 'Grey',
    'Baby Blue': 'Light Blue',
    'Pale Blue': 'Light Blue',
    'Cyanish-green': 'Light Blue', // manuell eingefügt weil iwie nicht matched ...
    'Greyish Green-Blue': 'Light Blue',
    'Pale Greenish Blue, Light Cyan': 'Light Cyan',
    'Pale Green': 'Light Green',
    'Light Greyish Yellow': 'Light Green',
    'Cyanish Green, Turquoise': 'Light Green',
    'Pale Yellow': 'Light Green',
    'Light Green': 'Light Green',
    'Cyanish-green, Turquoise': 'Light Green', // manuell eingefügt weil iwie nicht matched ...
    'Pale Red Grey': 'Light Grey',
    'Pale Orange': 'Light Orange',
    'Light Pink': 'Light Pink',
    'Pale Reddish Grey': 'Light Pink',
    'Pale Pink': 'Light Pink',
    Pink: 'Light Pink',
    'Pale Red': 'Light Pink',
    'Light Reddish Grey': 'Light Pink',
    'Reddish Grey': 'Light Pink',
    'Light Pink Red': 'Light Pink',
    'Pale Purple': 'Light Violet',
    'Pale Magenta': 'Light Violet',
    'Light Purple': 'Light Violet',
    'Light Magenta': 'Light Violet',
    Magenta: 'Magenta',
    'Greyish Purple Red': 'Magenta',
    Orange: 'Orange',
    'Pink Red': 'Pink',
    'Hot Pink': 'Pink',
    'Greyish Purple': 'Pink',
    'Dark Greyish Brown': 'Pink',
    'Greyish Red': 'Pink',
    'Purple Red': 'Pink',
    'Light Red': 'Red',
    'Rose Red': 'Red',
    'Red Orange': 'Red',
    Red: 'Red',
    Violet: 'Violet',
    Purple: 'Violet',
    'Dark Magenta': 'Violet',
    'Blue Violet': 'Violet',
    'Greenish Cyan': 'White',
    'Pale Greyish Orange': 'White',
    'Ivory Yellow': 'White',
    'Light Yellow': 'White',
    'Light Yellowish Brown': 'Yellow'
  }

  shade (
    chromaInstance: Color,
    includeNativeShade: boolean = false
  ): [string, string] | string {
    const [h, s, l]: [number, number, number] = chromaInstance.hsl()
    return this.shadeByHSL(h, s, l, includeNativeShade)
  }

  shadeByRGB (
    r: number,
    g: number,
    b: number,
    includeNativeShade: boolean = false
  ): [string, string] | string {
    return this.shade(chroma(r, g, b), includeNativeShade)
  }

  shadeByHSL (
    h: number,
    s: number,
    l: number,
    includeNativeShade: boolean = false
  ): [string, string] | string {
    // normalize s and l
    if (s > 1) {
      s = s / 100
    }
    if (l > 1) {
      l = l / 100
    }

    if (l > 0.975) {
      return includeNativeShade ? ['White', 'White'] : 'White'
    }
    if (l < 0.025) {
      return includeNativeShade ? ['Black', 'Black'] : 'Black'
    }

    const shade: string = this.find(h, s, l)
    const nativeShade = this.shadeMap[shade]

    return includeNativeShade ? [shade, nativeShade] : shade
  }

  /* istanbul ignore next */
  private find (h: number, s: number, l: number): string {
    if (h <= 8) {
      // 0 red 0-8
      if (l < 0.25) {
        if (s < 0.35) {
          return 'Brownish Dark Grey'
        }
        return 'Dark Brown'
      }
      if (l < 0.45) {
        if (s < 0.35) {
          return 'Greyish Red'
        }
        return 'Dark Red'
      }
      if (l < 0.65) {
        if (s < 0.35) {
          return 'Greyish Red'
        }
        return 'Red'
      }
      if (l < 0.85) {
        if (s < 0.35) {
          return 'Reddish Grey'
        }
        return 'Light Red'
      }
      if (l < 0.99) {
        if (s < 0.35) {
          return 'Pale Red Grey'
        }
        return 'Pale Red'
      }
      return 'Red'
    }
    if (h <= 22) {
      // 15(9-22) red orange
      if (l < 0.25) {
        if (s < 0.35) {
          return 'Brownish Dark Grey'
        }
        return 'Dark Brown'
      }
      if (l < 0.45) {
        if (s < 0.35) {
          return 'Greyish Brown'
        }
        return 'Dark Brown'
      }
      if (l < 0.65) {
        if (s < 0.2) {
          return 'Brownish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Red Orange'
        }
        return 'Red Orange'
      }
      if (l < 0.85) {
        if (s < 0.35) {
          return 'Reddish Grey'
        }
        if (s < 0.5) {
          return 'Light Greyish Red-Orange'
        }
        return 'Light Red-Orange'
      }
      if (l < 0.99) {
        if (s < 0.35) {
          return 'Pale Red Grey'
        }
        if (s < 0.5) {
          return 'Pale Reddish Grey'
        }
        return 'Pale Red'
      }
      return 'Red Orange'
    }

    if (h <= 30) {
      // 15(9-22) red orange
      if (l < 0.25) {
        if (s < 0.35) {
          return 'Brownish Dark Grey'
        }
        return 'Dark Brown'
      }
      if (l < 0.45) {
        if (s < 0.35) {
          return 'Greyish Brown'
        }
        return 'Dark Brown'
      }
      if (l < 0.65) {
        if (s < 0.2) {
          return 'Brownish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Red Orange'
        }
        return 'Red Orange'
      }
      if (l < 0.85) {
        if (s < 0.35) {
          return 'Reddish Grey'
        }
        if (s < 0.5) {
          return 'Light Greyish Red-Orange'
        }
        return 'Light Red-Orange'
      }
      if (l < 0.99) {
        if (s < 0.35) {
          return 'Pale Red Grey'
        }
        if (s < 0.5) {
          return 'Pale Reddish Grey'
        }
        return 'Pale Red'
      }
      return 'Red Orange'
    }

    if (h <= 38) {
      // 30(23-38)
      if (l < 0.25) {
        if (s < 0.35) {
          return 'Brownish Dark Grey'
        }
        return 'Dark Brown'
      }
      if (l < 0.45) {
        if (s < 0.35) {
          return 'Brownish Grey'
        }
        if (s < 0.65) {
          return 'Greyish Brown'
        }
        if (s < 0.8) {
          return 'Orange Brown'
        }
        return 'Dark Orange'
      }
      if (l < 0.65) {
        if (s < 0.25) {
          return 'Orangish Grey'
        }
        if (s < 0.5) {
          return 'Grey Orange'
        }
        if (s < 0.75) {
          return 'Yellowish Brown, Tan'
        }
        return 'Orange'
      }
      if (l < 0.85) {
        if (s < 0.2) {
          return 'Light Brownish Grey'
        }
        if (s < 0.5) {
          return 'Light Greyish Yellow-Brown'
        }
        return 'Light Yellowish Brown'
      }
      if (l < 0.99) {
        if (s < 0.35) {
          return 'Pale Greyish Orange'
        }
        if (s < 0.5) {
          return 'Pale Orange'
        }
        return 'Pale Orange'
      }
      return 'Orange'
    }
    if (h <= 52) {
      // 45(39-52)
      if (l < 0.25) {
        if (s < 0.35) {
          return 'Dark Grey'
        }
        return 'Dark Brown'
      }
      if (l < 0.45) {
        if (s < 0.25) {
          return 'Dark Greenish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Brown Green'
        }
        return 'Brown'
      }
      if (l < 0.65) {
        if (s < 0.25) {
          return 'Brownish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Yellow Brown'
        }
        if (s < 0.75) {
          return 'Yellowish Brown'
        }
        return 'Orange Yellow'
      }
      if (l < 0.85) {
        if (s < 0.2) {
          return 'Light Grey'
        }
        if (s < 0.5) {
          return 'Light Greyish Yellow-Brown'
        }
        return 'Light Yellowish Brown'
      }
      if (l < 0.99) {
        if (s < 0.35) {
          return 'Yellowish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Yellow'
        }
        return 'Ivory Yellow'
      }
      return 'Orange Yellow'
    }
    if (h <= 68) {
      // 60(53-68)
      if (l < 0.25) {
        if (s < 0.35) {
          return 'Dark Olive Green'
        }
        if (s < 0.5) {
          return 'Dark Olive Green'
        }
        return 'Olive Green'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Olive Greenish Grey'
        }
        if (s < 0.3) {
          return 'Greyish Olive Green'
        }
        if (s < 0.7) {
          return 'Olive Green'
        }
        return 'Yellow Green'
      }
      if (l < 0.65) {
        if (s < 0.25) {
          return 'Yellowish Grey'
        }
        if (s < 0.75) {
          return 'Greyish Yellow'
        }
        return 'Yellow'
      }
      if (l < 0.85) {
        if (s < 0.2) {
          return 'Light Yellowish Grey'
        }
        if (s < 0.7) {
          return 'Light Greyish Yellow'
        }
        return 'Pale Yellow'
      }
      if (l < 0.99) {
        if (s < 0.35) {
          return 'Yellowish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Yellow'
        }
        return 'Light Yellow'
      }
      return 'Yellow'
    }
    if (h <= 80) {
      // 80(68-80)
      if (l < 0.25) {
        if (s < 0.6) {
          return 'Dark Olive Green'
        }
        return 'Olive Green'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Olive-Greenish Grey'
        }
        if (s < 0.3) {
          return 'Greyish Olive Green'
        }
        if (s < 0.65) {
          return 'Olive Green'
        }
        return 'Yellow Green'
      }
      if (l < 0.65) {
        if (s < 0.45) {
          return 'Yellowish Grey'
        }
        if (s < 0.6) {
          return 'Greyish Yellow-Green'
        }
        if (s < 0.8) {
          return 'Yellowish Green'
        }
        return 'Greenish Yellow'
      }
      if (l < 0.85) {
        if (s < 0.35) {
          return 'Yellowish Grey'
        }
        if (s < 0.7) {
          return 'Greyish Yellow'
        }
        return 'Pale Yellow'
      }
      if (l < 0.99) {
        if (s < 0.5) {
          return 'Yellowish Grey'
        }
        if (s < 0.7) {
          return 'Light Greyish Yellow'
        }
        return 'Pale Yellow'
      }
      return 'Greenish Yellow'
    }

    if (h <= 100) {
      // 100(81-100)
      if (l < 0.25) {
        if (s < 0.25) {
          return 'Dark Greyish Green'
        }
        return 'Dark Green'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Greenish Grey'
        }
        if (s < 0.3) {
          return 'Dark Greyish Green'
        }
        if (s < 0.65) {
          return 'Olive Green'
        }
        return 'Yellow Green'
      }
      if (l < 0.65) {
        if (s < 0.2) {
          return 'Greenish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Green'
        }
        if (s < 0.8) {
          return 'Yellowish Green'
        }
        return 'Yellowish Green'
      }
      if (l < 0.85) {
        if (s < 0.35) {
          return 'Light Greenish Grey'
        }
        if (s < 0.5) {
          return 'Light Greyish Green'
        }
        return 'Light Green'
      }
      if (l < 0.99) {
        if (s < 0.2) {
          return 'Light Grey'
        }
        return 'Pale Green'
      }
      return 'Yellow Green'
    }
    if (h <= 128) {
      // 120 ??
      if (l < 0.25) {
        if (s < 0.25) {
          return 'Deep Dark Green'
        }
        return 'Dark Green'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Greyish Green'
        }
        if (s < 0.6) {
          return 'Dark Green'
        }
        return 'Green'
      }
      if (l < 0.65) {
        if (s < 0.2) {
          return 'Greenish Grey'
        }
        if (s < 0.4) {
          return 'Greyish Green'
        }
        if (s < 0.85) {
          return 'Green'
        }
        return 'Bright Green'
      }
      if (l < 0.85) {
        if (s < 0.35) {
          return 'Light Greyish Green'
        }
        if (s < 0.5) {
          return 'Light Green'
        }
        return 'Light Green'
      }
      if (l < 0.99) {
        if (s < 0.2) {
          return 'Light Grey'
        }
        return 'Pale Green'
      }
      return 'Green'
    }
    if (h <= 155) {
      // 150
      if (l < 0.25) {
        if (s < 0.25) {
          return 'Deep Dark Green'
        }
        return 'Dark Green'
      }
      if (l < 0.45) {
        if (s < 0.25) {
          return 'Dark Greenish Grey'
        }
        if (s < 0.6) {
          return 'Medium Dark Green'
        }
        return 'Green'
      }
      if (l < 0.65) {
        if (s < 0.25) {
          return 'Greenish Grey'
        }
        if (s < 0.4) {
          return 'Green'
        }
        if (s < 0.75) {
          return 'Green'
        }
        return 'Spring Green'
      }
      if (l < 0.85) {
        if (s < 0.35) {
          return 'Light Greenish Grey'
        }
        if (s < 0.5) {
          return 'Cyanish-green'
        }
        return 'Cyanish-green, Turquoise'
      }
      if (l < 0.99) {
        if (s < 0.2) {
          return 'Light Grey'
        }
        return 'Pale Green'
      }
      return 'Spring Green'
    }

    if (h <= 172) {
      // 164
      if (l < 0.25) {
        if (s < 0.35) {
          return 'Deep Dark Green'
        }
        return 'Dark Green'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Greenish Grey'
        }
        if (s < 0.4) {
          return 'Dark Greyish Green'
        }
        if (s < 0.75) {
          return 'Medium Dark Green'
        }
        return 'Cyanish Green'
      }
      if (l < 0.65) {
        if (s < 0.25) {
          return 'Greenish Grey'
        }
        if (s < 0.45) {
          return 'Greyish Cyan Green'
        }
        if (s < 0.75) {
          return 'Cyan Green'
        }
        return 'Cyan Green'
      }
      if (l < 0.85) {
        if (s < 0.35) {
          return 'Light Greenish Grey'
        }
        if (s < 0.6) {
          return 'Light Green'
        }
        return 'Cyanish Green'
      }
      if (l < 0.99) {
        if (s < 0.3) {
          return 'Light Grey'
        }
        return 'Pale Green'
      }
      return 'Greenish Cyan'
    } //

    if (h <= 196) {
      // 184
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Deep Dark Blue Green'
        }
        return 'Dark Blue Green'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Cyanish Grey'
        }
        if (s < 0.4) {
          return 'Dark Greyish Cyan'
        }
        if (s < 0.6) {
          return 'Dark Greenish Blue'
        }
        return 'Greenish Blue'
      }
      if (l < 0.65) {
        //
        if (s < 0.3) {
          return 'Cyanish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Cyan'
        }
        if (s < 0.75) {
          return 'Bluish Green'
        }
        return 'Cyan'
      }
      if (l < 0.85) {
        if (s < 0.2) {
          return 'Light Grey'
        }
        if (s < 0.6) {
          return 'Greyish Green-Blue'
        }
        return 'Light Greenish Blue'
      }
      if (l < 0.99) {
        if (s < 0.3) {
          return 'Light Grey'
        }
        return 'Pale Greenish Blue, Light Cyan'
      }
      return 'Cyan'
    }

    if (h <= 212) {
      // 204
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Deep Navy Blue'
        }
        return 'Navy Blue'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Navy Blue'
        }
        if (s < 0.4) {
          return 'Navy Blue'
        }
        if (s < 0.6) {
          return 'Dark Blue'
        }
        return 'Dark Blue'
      }
      if (l < 0.65) {
        if (s < 0.3) {
          return 'Bluish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Blue'
        }
        if (s < 0.75) {
          return 'Azure'
        }
        return 'Sky Blue'
      }
      if (l < 0.85) {
        if (s < 0.25) {
          return 'Light Grey'
        }
        if (s < 0.6) {
          return 'Light Greyish Azure'
        }
        return 'Light Azure'
      }
      if (l < 0.99) {
        if (s < 0.45) {
          return 'Light Grey'
        }
        if (s < 0.7) {
          return 'Pale Blue'
        }
        return 'Baby Blue'
      }
      return 'Azure'
    } //

    if (h <= 250) {
      // 231
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Deep Navy Blue'
        }
        return 'Navy Blue'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Navy Blue'
        }
        if (s < 0.4) {
          return 'Navy Blue'
        }
        if (s < 0.7) {
          return 'Dark Blue'
        }
        return 'Blue'
      }
      if (l < 0.65) {
        if (s < 0.2) {
          return 'Bluish Grey'
        }
        if (s < 0.5) {
          return 'Greyish Blue'
        }
        if (s < 0.75) {
          return 'Blue'
        }
        return 'Blue'
      }
      if (l < 0.85) {
        if (s < 0.2) {
          return 'Grey'
        }
        if (s < 0.5) {
          return 'Greyish Blue'
        }
        return 'Medium Blue'
      }
      if (l < 0.99) {
        if (s < 0.45) {
          return 'Light Grey'
        }
        if (s < 0.8) {
          return 'Pale Blue'
        }
        return 'Baby Blue'
      }
      return 'Blue'
    }
    if (h <= 270) {
      // 260
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Deep Navy Blue'
        }
        return 'Navy Blue'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Navy Blue'
        }
        if (s < 0.5) {
          return 'Navy Blue'
        }
        if (s < 0.7) {
          return 'Dark Blue'
        }
        return 'Blue'
      }
      if (l < 0.65) {
        if (s < 0.2) {
          return 'Purplish Grey'
        }
        if (s < 0.4) {
          return 'Purple'
        }
        if (s < 0.75) {
          return 'Violet'
        }
        if (s < 0.9) {
          return 'Violet Blue'
        }
        return 'Blue'
      }
      if (l < 0.85) {
        if (s < 0.2) {
          return 'Grey'
        }
        if (s < 0.4) {
          return 'Purple Grey'
        }
        if (s < 0.75) {
          return 'Purple'
        }
        return 'Violet Blue'
      }
      if (l < 0.99) {
        if (s < 0.45) {
          return 'Light Grey'
        }
        if (s < 0.8) {
          return 'Pale Purple'
        }
        return 'Light Purple'
      }

      return 'Violet Blue'
    }

    if (h <= 279) {
      // 275
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Dark Violet'
        }
        return 'Blue Violet'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Purple Grey'
        }
        if (s < 0.5) {
          return 'Blue Violet'
        }
        if (s < 0.7) {
          return 'Blue Violet'
        }
        return 'Blue Violet'
      }
      if (l < 0.65) {
        if (s < 0.2) {
          return 'Purplish Grey'
        }
        if (s < 0.4) {
          return 'Purple'
        }
        if (s < 0.75) {
          return 'Violet'
        }
        return 'Blue Violet'
      }
      if (l < 0.85) {
        if (s < 0.2) {
          return 'Light Purple Grey'
        }
        if (s < 0.4) {
          return 'Light Purple'
        }
        if (s < 0.75) {
          return 'Purple'
        }
        return 'Purple'
      }
      if (l < 0.99) {
        if (s < 0.3) {
          return 'Light Grey'
        }
        if (s < 0.8) {
          return 'Light Purple'
        }
        return 'Light Purple'
      }
      return 'Blue Violet'
    } //
    if (h <= 295) {
      // 287
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Very Dark Violet'
        }
        return 'Dark Violet'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Purple'
        }
        if (s < 0.5) {
          return 'Dark Violet'
        }
        if (s < 0.7) {
          return 'Violet'
        }
        return 'Violet'
      }
      if (l < 0.65) {
        if (s < 0.2) {
          return 'Purplish Grey'
        }
        if (s < 0.4) {
          return 'Purple'
        }
        if (s < 0.75) {
          return 'Purple'
        }
        return 'Purple'
      }
      if (l < 0.85) {
        if (s < 0.2) {
          return 'Light Purple Grey'
        }
        if (s < 0.4) {
          return 'Light Purple'
        }
        if (s < 0.75) {
          return 'Light Purple'
        }
        return 'Light Purple'
      }
      if (l < 0.99) {
        if (s < 0.3) {
          return 'Light Grey'
        }
        if (s < 0.8) {
          return 'Light Purple'
        }
        return 'Light Purple'
      }
      return 'Violet'
    }

    if (h <= 308) {
      // 301
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Very Dark Purple'
        }
        return 'Dark Purple'
      }
      if (l < 0.45) {
        if (s < 0.25) {
          return 'Greyish Purple'
        }
        if (s < 0.5) {
          return 'Dark Purple'
        }
        if (s < 0.7) {
          return 'Purple'
        }
        return 'Purple'
      }
      if (l < 0.65) {
        if (s < 0.24) {
          return 'Greyish Purple'
        }
        if (s < 0.5) {
          return 'Purple'
        }
        if (s < 0.75) {
          return 'Purple'
        }
        return 'Magenta'
      }
      if (l < 0.85) {
        if (s < 0.25) {
          return 'Light Purple Grey'
        }
        if (s < 0.4) {
          return 'Light Purple'
        }
        if (s < 0.75) {
          return 'Light Purple'
        }
        return 'Magenta'
      }
      if (l < 0.99) {
        if (s < 0.3) {
          return 'Light Grey'
        }
        if (s < 0.8) {
          return 'Pale Magenta'
        }
        return 'Pale Magenta'
      }
      return 'Magenta'
    }
    if (h <= 318) {
      // 313
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Very Dark Purple'
        }
        return 'Dark Purple'
      }
      if (l < 0.45) {
        if (s < 0.25) {
          return 'Greyish Purple'
        }
        if (s < 0.5) {
          return 'Dark Red Purple'
        }
        if (s < 0.7) {
          return 'Dark Purple Red'
        }
        return 'Dark Magenta'
      }
      if (l < 0.65) {
        if (s < 0.24) {
          return 'Greyish Purple'
        }
        if (s < 0.5) {
          return 'Purple'
        }
        if (s < 0.75) {
          return 'Purple'
        }
        return 'Hot Pink'
      }
      if (l < 0.85) {
        if (s < 0.25) {
          return 'Light Purple Grey'
        }
        if (s < 0.4) {
          return 'Light Magenta'
        }
        if (s < 0.75) {
          return 'Light Magenta'
        }
        return 'Hot Pink'
      }
      if (l < 0.99) {
        if (s < 0.3) {
          return 'Light Grey'
        }
        if (s < 0.8) {
          return 'Light Pink'
        }
        return 'Light Pink'
      }
      return 'Hot Pink'
    }
    if (h <= 343) {
      // 330
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Very Dark Purple Red'
        }
        if (s < 0.6) {
          return 'Dark Purple Red'
        }
        return 'Purple Red'
      }
      if (l < 0.45) {
        if (s < 0.3) {
          return 'Greyish Purple Red'
        }
        if (s < 0.5) {
          return 'Dark Purple Red'
        }
        if (s < 0.7) {
          return 'Purple Red'
        }
        return 'Purple Red'
      }
      if (l < 0.65) {
        if (s < 0.24) {
          return 'Greyish Purple'
        }
        if (s < 0.5) {
          return 'Purple'
        }
        if (s < 0.75) {
          return 'Purple Red'
        }
        return 'Hot Pink'
      }
      if (l < 0.85) {
        if (s < 0.25) {
          return 'Light Purple Grey'
        }
        if (s < 0.4) {
          return 'Greyish Purple'
        }
        if (s < 0.75) {
          return 'Purple'
        }
        return 'Hot Pink'
      }
      if (l < 0.99) {
        if (s < 0.35) {
          return 'Light Grey'
        }
        if (s < 0.7) {
          return 'Light Pink'
        }
        return 'Pink'
      }
      return 'Rose Red'
    }
    if (h <= 360) {
      if (l < 0.25) {
        if (s < 0.4) {
          return 'Very Dark Brown'
        }
        if (s < 0.6) {
          return 'Dark Brown'
        }
        return 'Dark Brown'
      }
      if (l < 0.45) {
        if (s < 0.2) {
          return 'Dark Greyish Brown'
        }
        if (s < 0.6) {
          return 'Dark Brown'
        }
        if (s < 0.7) {
          return 'Dark Red'
        }
        return 'Dark Red'
      }
      if (l < 0.65) {
        if (s < 0.24) {
          return 'Greyish Red'
        }
        if (s < 0.5) {
          return 'Purple Red'
        }
        if (s < 0.75) {
          return 'Rose Red'
        }
        return 'Red'
      }
      if (l < 0.85) {
        if (s < 0.25) {
          return 'Light Reddish Grey'
        }
        if (s < 0.4) {
          return 'Light Red'
        }
        if (s < 0.75) {
          return 'Light Pink Red'
        }
        return 'Pink Red'
      }
      if (l < 0.99) {
        if (s < 0.3) {
          return 'Light Grey'
        }
        if (s < 0.7) {
          return 'Pale Pink'
        }
        return 'Pink'
      }
      return 'Red'
    }
    return 'Black'
  }
}
