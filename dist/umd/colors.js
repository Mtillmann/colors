(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Colors = {}));
})(this, (function (exports) { 'use strict';

  // src/AltShadeLookup.ts

  var AltShadeLookup_default = class {
    shadeMap = {
      Black: "Black",
      "Olive Greenish Grey": "Black",
      "Very Dark Violet": "Black",
      "Very Dark Purple Red": "Black",
      "Very Dark Purple": "Black",
      "Deep Dark Blue Green": "Black",
      "Deep Navy Blue": "Black",
      "Brownish Dark Grey": "Black",
      "Light Azure": "Blue",
      "Medium Blue": "Blue",
      "Violet Blue": "Blue",
      "Sky Blue": "Blue",
      "Light Greyish Azure": "Blue",
      Azure: "Blue",
      "Greyish Blue": "Blue",
      "Cyanish Grey": "Blue",
      Blue: "Blue",
      "Dark Greyish Cyan": "Blue",
      "Light Greyish Yellow-Brown": "Brown",
      "Light Greyish Red-Orange": "Brown",
      "Orangish Grey": "Brown",
      "Light Red-Orange": "Brown",
      "Greyish Yellow Brown": "Brown",
      "Grey Orange": "Brown",
      "Greyish Red Orange": "Brown",
      "Brownish Grey": "Brown",
      "Yellowish Brown, Tan": "Brown",
      "Greyish Brown": "Brown",
      "Orange Brown": "Brown",
      "Light Greenish Blue": "Cyan",
      Cyan: "Cyan",
      "Bluish Green": "Cyan",
      "Greyish Cyan": "Cyan",
      "Greyish Cyan Green": "Cyan",
      "Dark Blue": "Dark Blue",
      "Dark Greenish Blue": "Dark Blue",
      "Dark Navy Blue": "Dark Blue",
      "Navy Blue": "Dark Blue",
      "Greyish Brown Green": "Dark Brown",
      "Very Dark Brown": "Dark Brown",
      "Dark Grey": "Dark Brown",
      "Dark Brown": "Dark Brown",
      "Greenish Blue": "Dark Cyan",
      "Greyish Olive Green": "Dark Green",
      "Medium Dark Green": "Dark Green",
      "Deep Dark Green": "Dark Green",
      "Dark Olive Green": "Dark Green",
      "Dark Blue Green": "Dark Green",
      "Dark Green": "Dark Green",
      "Dark Cyanish Grey": "Dark Grey",
      "Dark Red Purple": "Dark Magenta",
      "Dark Purple Red": "Dark Magenta",
      "Dark Orange": "Dark Orange",
      "Dark Red": "Dark Red",
      "Dark Violet": "Dark Violet",
      "Dark Purple": "Dark Violet",
      "Yellowish Brown": "Dark Yellow",
      "Orange Yellow": "Dark Yellow",
      Yellow: "Dark Yellow",
      Brown: "Dark Yellow",
      "Cyan Green": "Green",
      "Light Greyish Green": "Green",
      "Greenish Grey": "Green",
      "Cyanish Green": "Green",
      "Yellowish Grey": "Green",
      "Greyish Green": "Green",
      "Olive-Greenish Grey": "Green",
      "Dark Greenish Grey": "Green",
      "Greyish Yellow-Green": "Green",
      "Spring Green": "Green",
      "Greyish Yellow": "Green",
      "Dark Greyish Green": "Green",
      "Greenish Yellow": "Green",
      "Yellowish Green": "Green",
      "Yellow Green": "Green",
      "Olive Green": "Green",
      "Bright Green": "Green",
      Green: "Green",
      Grey: "Grey",
      "Light Purple Grey": "Grey",
      "Light Grey": "Grey",
      "Light Brownish Grey": "Grey",
      "Light Yellowish Grey": "Grey",
      "Light Greenish Grey": "Grey",
      "Purplish Grey": "Grey",
      "Bluish Grey": "Grey",
      "Purple Grey": "Grey",
      undefined: "Grey",
      "Baby Blue": "Light Blue",
      "Pale Blue": "Light Blue",
      "Cyanish-green": "Light Blue",
      // manuell eingefügt weil iwie nicht matched ...
      "Greyish Green-Blue": "Light Blue",
      "Pale Greenish Blue, Light Cyan": "Light Cyan",
      "Pale Green": "Light Green",
      "Light Greyish Yellow": "Light Green",
      "Cyanish Green, Turquoise": "Light Green",
      "Pale Yellow": "Light Green",
      "Light Green": "Light Green",
      "Cyanish-green, Turquoise": "Light Green",
      // manuell eingefügt weil iwie nicht matched ...
      "Pale Red Grey": "Light Grey",
      "Pale Orange": "Light Orange",
      "Light Pink": "Light Pink",
      "Pale Reddish Grey": "Light Pink",
      "Pale Pink": "Light Pink",
      Pink: "Light Pink",
      "Pale Red": "Light Pink",
      "Light Reddish Grey": "Light Pink",
      "Reddish Grey": "Light Pink",
      "Light Pink Red": "Light Pink",
      "Pale Purple": "Light Violet",
      "Pale Magenta": "Light Violet",
      "Light Purple": "Light Violet",
      "Light Magenta": "Light Violet",
      Magenta: "Magenta",
      "Greyish Purple Red": "Magenta",
      Orange: "Orange",
      "Pink Red": "Pink",
      "Hot Pink": "Pink",
      "Greyish Purple": "Pink",
      "Dark Greyish Brown": "Pink",
      "Greyish Red": "Pink",
      "Purple Red": "Pink",
      "Light Red": "Red",
      "Rose Red": "Red",
      "Red Orange": "Red",
      Red: "Red",
      Violet: "Violet",
      Purple: "Violet",
      "Dark Magenta": "Violet",
      "Blue Violet": "Violet",
      "Greenish Cyan": "White",
      "Pale Greyish Orange": "White",
      "Ivory Yellow": "White",
      "Light Yellow": "White",
      "Light Yellowish Brown": "Yellow"
    };
    shade(chromaInstance, includeNativeShade = false) {
      const [h, s, l] = chromaInstance.hsl();
      return this.shadeByHSL(h, s, l, includeNativeShade);
    }
    shadeByRGB(r, g, b, includeNativeShade = false) {
      return this.shade(chroma(r, g, b), includeNativeShade);
    }
    shadeByHSL(h, s, l, includeNativeShade = false) {
      if (s > 1) {
        s = s / 100;
      }
      if (l > 1) {
        l = l / 100;
      }
      if (l > 0.975) {
        return includeNativeShade ? ["White", "White"] : "White";
      }
      if (l < 0.025) {
        return includeNativeShade ? ["Black", "Black"] : "Black";
      }
      const shade = this.find(h, s, l);
      const nativeShade = this.shadeMap[shade];
      return includeNativeShade ? [shade, nativeShade] : shade;
    }
    /* istanbul ignore next */
    find(h, s, l) {
      if (h <= 8) {
        if (l < 0.25) {
          if (s < 0.35) {
            return "Brownish Dark Grey";
          }
          return "Dark Brown";
        }
        if (l < 0.45) {
          if (s < 0.35) {
            return "Greyish Red";
          }
          return "Dark Red";
        }
        if (l < 0.65) {
          if (s < 0.35) {
            return "Greyish Red";
          }
          return "Red";
        }
        if (l < 0.85) {
          if (s < 0.35) {
            return "Reddish Grey";
          }
          return "Light Red";
        }
        if (l < 0.99) {
          if (s < 0.35) {
            return "Pale Red Grey";
          }
          return "Pale Red";
        }
        return "Red";
      }
      if (h <= 22) {
        if (l < 0.25) {
          if (s < 0.35) {
            return "Brownish Dark Grey";
          }
          return "Dark Brown";
        }
        if (l < 0.45) {
          if (s < 0.35) {
            return "Greyish Brown";
          }
          return "Dark Brown";
        }
        if (l < 0.65) {
          if (s < 0.2) {
            return "Brownish Grey";
          }
          if (s < 0.5) {
            return "Greyish Red Orange";
          }
          return "Red Orange";
        }
        if (l < 0.85) {
          if (s < 0.35) {
            return "Reddish Grey";
          }
          if (s < 0.5) {
            return "Light Greyish Red-Orange";
          }
          return "Light Red-Orange";
        }
        if (l < 0.99) {
          if (s < 0.35) {
            return "Pale Red Grey";
          }
          if (s < 0.5) {
            return "Pale Reddish Grey";
          }
          return "Pale Red";
        }
        return "Red Orange";
      }
      if (h <= 30) {
        if (l < 0.25) {
          if (s < 0.35) {
            return "Brownish Dark Grey";
          }
          return "Dark Brown";
        }
        if (l < 0.45) {
          if (s < 0.35) {
            return "Greyish Brown";
          }
          return "Dark Brown";
        }
        if (l < 0.65) {
          if (s < 0.2) {
            return "Brownish Grey";
          }
          if (s < 0.5) {
            return "Greyish Red Orange";
          }
          return "Red Orange";
        }
        if (l < 0.85) {
          if (s < 0.35) {
            return "Reddish Grey";
          }
          if (s < 0.5) {
            return "Light Greyish Red-Orange";
          }
          return "Light Red-Orange";
        }
        if (l < 0.99) {
          if (s < 0.35) {
            return "Pale Red Grey";
          }
          if (s < 0.5) {
            return "Pale Reddish Grey";
          }
          return "Pale Red";
        }
        return "Red Orange";
      }
      if (h <= 38) {
        if (l < 0.25) {
          if (s < 0.35) {
            return "Brownish Dark Grey";
          }
          return "Dark Brown";
        }
        if (l < 0.45) {
          if (s < 0.35) {
            return "Brownish Grey";
          }
          if (s < 0.65) {
            return "Greyish Brown";
          }
          if (s < 0.8) {
            return "Orange Brown";
          }
          return "Dark Orange";
        }
        if (l < 0.65) {
          if (s < 0.25) {
            return "Orangish Grey";
          }
          if (s < 0.5) {
            return "Grey Orange";
          }
          if (s < 0.75) {
            return "Yellowish Brown, Tan";
          }
          return "Orange";
        }
        if (l < 0.85) {
          if (s < 0.2) {
            return "Light Brownish Grey";
          }
          if (s < 0.5) {
            return "Light Greyish Yellow-Brown";
          }
          return "Light Yellowish Brown";
        }
        if (l < 0.99) {
          if (s < 0.35) {
            return "Pale Greyish Orange";
          }
          if (s < 0.5) {
            return "Pale Orange";
          }
          return "Pale Orange";
        }
        return "Orange";
      }
      if (h <= 52) {
        if (l < 0.25) {
          if (s < 0.35) {
            return "Dark Grey";
          }
          return "Dark Brown";
        }
        if (l < 0.45) {
          if (s < 0.25) {
            return "Dark Greenish Grey";
          }
          if (s < 0.5) {
            return "Greyish Brown Green";
          }
          return "Brown";
        }
        if (l < 0.65) {
          if (s < 0.25) {
            return "Brownish Grey";
          }
          if (s < 0.5) {
            return "Greyish Yellow Brown";
          }
          if (s < 0.75) {
            return "Yellowish Brown";
          }
          return "Orange Yellow";
        }
        if (l < 0.85) {
          if (s < 0.2) {
            return "Light Grey";
          }
          if (s < 0.5) {
            return "Light Greyish Yellow-Brown";
          }
          return "Light Yellowish Brown";
        }
        if (l < 0.99) {
          if (s < 0.35) {
            return "Yellowish Grey";
          }
          if (s < 0.5) {
            return "Greyish Yellow";
          }
          return "Ivory Yellow";
        }
        return "Orange Yellow";
      }
      if (h <= 68) {
        if (l < 0.25) {
          if (s < 0.35) {
            return "Dark Olive Green";
          }
          if (s < 0.5) {
            return "Dark Olive Green";
          }
          return "Olive Green";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Olive Greenish Grey";
          }
          if (s < 0.3) {
            return "Greyish Olive Green";
          }
          if (s < 0.7) {
            return "Olive Green";
          }
          return "Yellow Green";
        }
        if (l < 0.65) {
          if (s < 0.25) {
            return "Yellowish Grey";
          }
          if (s < 0.75) {
            return "Greyish Yellow";
          }
          return "Yellow";
        }
        if (l < 0.85) {
          if (s < 0.2) {
            return "Light Yellowish Grey";
          }
          if (s < 0.7) {
            return "Light Greyish Yellow";
          }
          return "Pale Yellow";
        }
        if (l < 0.99) {
          if (s < 0.35) {
            return "Yellowish Grey";
          }
          if (s < 0.5) {
            return "Greyish Yellow";
          }
          return "Light Yellow";
        }
        return "Yellow";
      }
      if (h <= 80) {
        if (l < 0.25) {
          if (s < 0.6) {
            return "Dark Olive Green";
          }
          return "Olive Green";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Olive-Greenish Grey";
          }
          if (s < 0.3) {
            return "Greyish Olive Green";
          }
          if (s < 0.65) {
            return "Olive Green";
          }
          return "Yellow Green";
        }
        if (l < 0.65) {
          if (s < 0.45) {
            return "Yellowish Grey";
          }
          if (s < 0.6) {
            return "Greyish Yellow-Green";
          }
          if (s < 0.8) {
            return "Yellowish Green";
          }
          return "Greenish Yellow";
        }
        if (l < 0.85) {
          if (s < 0.35) {
            return "Yellowish Grey";
          }
          if (s < 0.7) {
            return "Greyish Yellow";
          }
          return "Pale Yellow";
        }
        if (l < 0.99) {
          if (s < 0.5) {
            return "Yellowish Grey";
          }
          if (s < 0.7) {
            return "Light Greyish Yellow";
          }
          return "Pale Yellow";
        }
        return "Greenish Yellow";
      }
      if (h <= 100) {
        if (l < 0.25) {
          if (s < 0.25) {
            return "Dark Greyish Green";
          }
          return "Dark Green";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Greenish Grey";
          }
          if (s < 0.3) {
            return "Dark Greyish Green";
          }
          if (s < 0.65) {
            return "Olive Green";
          }
          return "Yellow Green";
        }
        if (l < 0.65) {
          if (s < 0.2) {
            return "Greenish Grey";
          }
          if (s < 0.5) {
            return "Greyish Green";
          }
          if (s < 0.8) {
            return "Yellowish Green";
          }
          return "Yellowish Green";
        }
        if (l < 0.85) {
          if (s < 0.35) {
            return "Light Greenish Grey";
          }
          if (s < 0.5) {
            return "Light Greyish Green";
          }
          return "Light Green";
        }
        if (l < 0.99) {
          if (s < 0.2) {
            return "Light Grey";
          }
          return "Pale Green";
        }
        return "Yellow Green";
      }
      if (h <= 128) {
        if (l < 0.25) {
          if (s < 0.25) {
            return "Deep Dark Green";
          }
          return "Dark Green";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Greyish Green";
          }
          if (s < 0.6) {
            return "Dark Green";
          }
          return "Green";
        }
        if (l < 0.65) {
          if (s < 0.2) {
            return "Greenish Grey";
          }
          if (s < 0.4) {
            return "Greyish Green";
          }
          if (s < 0.85) {
            return "Green";
          }
          return "Bright Green";
        }
        if (l < 0.85) {
          if (s < 0.35) {
            return "Light Greyish Green";
          }
          if (s < 0.5) {
            return "Light Green";
          }
          return "Light Green";
        }
        if (l < 0.99) {
          if (s < 0.2) {
            return "Light Grey";
          }
          return "Pale Green";
        }
        return "Green";
      }
      if (h <= 155) {
        if (l < 0.25) {
          if (s < 0.25) {
            return "Deep Dark Green";
          }
          return "Dark Green";
        }
        if (l < 0.45) {
          if (s < 0.25) {
            return "Dark Greenish Grey";
          }
          if (s < 0.6) {
            return "Medium Dark Green";
          }
          return "Green";
        }
        if (l < 0.65) {
          if (s < 0.25) {
            return "Greenish Grey";
          }
          if (s < 0.4) {
            return "Green";
          }
          if (s < 0.75) {
            return "Green";
          }
          return "Spring Green";
        }
        if (l < 0.85) {
          if (s < 0.35) {
            return "Light Greenish Grey";
          }
          if (s < 0.5) {
            return "Cyanish-green";
          }
          return "Cyanish-green, Turquoise";
        }
        if (l < 0.99) {
          if (s < 0.2) {
            return "Light Grey";
          }
          return "Pale Green";
        }
        return "Spring Green";
      }
      if (h <= 172) {
        if (l < 0.25) {
          if (s < 0.35) {
            return "Deep Dark Green";
          }
          return "Dark Green";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Greenish Grey";
          }
          if (s < 0.4) {
            return "Dark Greyish Green";
          }
          if (s < 0.75) {
            return "Medium Dark Green";
          }
          return "Cyanish Green";
        }
        if (l < 0.65) {
          if (s < 0.25) {
            return "Greenish Grey";
          }
          if (s < 0.45) {
            return "Greyish Cyan Green";
          }
          if (s < 0.75) {
            return "Cyan Green";
          }
          return "Cyan Green";
        }
        if (l < 0.85) {
          if (s < 0.35) {
            return "Light Greenish Grey";
          }
          if (s < 0.6) {
            return "Light Green";
          }
          return "Cyanish Green";
        }
        if (l < 0.99) {
          if (s < 0.3) {
            return "Light Grey";
          }
          return "Pale Green";
        }
        return "Greenish Cyan";
      }
      if (h <= 196) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Deep Dark Blue Green";
          }
          return "Dark Blue Green";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Cyanish Grey";
          }
          if (s < 0.4) {
            return "Dark Greyish Cyan";
          }
          if (s < 0.6) {
            return "Dark Greenish Blue";
          }
          return "Greenish Blue";
        }
        if (l < 0.65) {
          if (s < 0.3) {
            return "Cyanish Grey";
          }
          if (s < 0.5) {
            return "Greyish Cyan";
          }
          if (s < 0.75) {
            return "Bluish Green";
          }
          return "Cyan";
        }
        if (l < 0.85) {
          if (s < 0.2) {
            return "Light Grey";
          }
          if (s < 0.6) {
            return "Greyish Green-Blue";
          }
          return "Light Greenish Blue";
        }
        if (l < 0.99) {
          if (s < 0.3) {
            return "Light Grey";
          }
          return "Pale Greenish Blue, Light Cyan";
        }
        return "Cyan";
      }
      if (h <= 212) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Deep Navy Blue";
          }
          return "Navy Blue";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Navy Blue";
          }
          if (s < 0.4) {
            return "Navy Blue";
          }
          if (s < 0.6) {
            return "Dark Blue";
          }
          return "Dark Blue";
        }
        if (l < 0.65) {
          if (s < 0.3) {
            return "Bluish Grey";
          }
          if (s < 0.5) {
            return "Greyish Blue";
          }
          if (s < 0.75) {
            return "Azure";
          }
          return "Sky Blue";
        }
        if (l < 0.85) {
          if (s < 0.25) {
            return "Light Grey";
          }
          if (s < 0.6) {
            return "Light Greyish Azure";
          }
          return "Light Azure";
        }
        if (l < 0.99) {
          if (s < 0.45) {
            return "Light Grey";
          }
          if (s < 0.7) {
            return "Pale Blue";
          }
          return "Baby Blue";
        }
        return "Azure";
      }
      if (h <= 250) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Deep Navy Blue";
          }
          return "Navy Blue";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Navy Blue";
          }
          if (s < 0.4) {
            return "Navy Blue";
          }
          if (s < 0.7) {
            return "Dark Blue";
          }
          return "Blue";
        }
        if (l < 0.65) {
          if (s < 0.2) {
            return "Bluish Grey";
          }
          if (s < 0.5) {
            return "Greyish Blue";
          }
          if (s < 0.75) {
            return "Blue";
          }
          return "Blue";
        }
        if (l < 0.85) {
          if (s < 0.2) {
            return "Grey";
          }
          if (s < 0.5) {
            return "Greyish Blue";
          }
          return "Medium Blue";
        }
        if (l < 0.99) {
          if (s < 0.45) {
            return "Light Grey";
          }
          if (s < 0.8) {
            return "Pale Blue";
          }
          return "Baby Blue";
        }
        return "Blue";
      }
      if (h <= 270) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Deep Navy Blue";
          }
          return "Navy Blue";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Navy Blue";
          }
          if (s < 0.5) {
            return "Navy Blue";
          }
          if (s < 0.7) {
            return "Dark Blue";
          }
          return "Blue";
        }
        if (l < 0.65) {
          if (s < 0.2) {
            return "Purplish Grey";
          }
          if (s < 0.4) {
            return "Purple";
          }
          if (s < 0.75) {
            return "Violet";
          }
          if (s < 0.9) {
            return "Violet Blue";
          }
          return "Blue";
        }
        if (l < 0.85) {
          if (s < 0.2) {
            return "Grey";
          }
          if (s < 0.4) {
            return "Purple Grey";
          }
          if (s < 0.75) {
            return "Purple";
          }
          return "Violet Blue";
        }
        if (l < 0.99) {
          if (s < 0.45) {
            return "Light Grey";
          }
          if (s < 0.8) {
            return "Pale Purple";
          }
          return "Light Purple";
        }
        return "Violet Blue";
      }
      if (h <= 279) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Dark Violet";
          }
          return "Blue Violet";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Purple Grey";
          }
          if (s < 0.5) {
            return "Blue Violet";
          }
          if (s < 0.7) {
            return "Blue Violet";
          }
          return "Blue Violet";
        }
        if (l < 0.65) {
          if (s < 0.2) {
            return "Purplish Grey";
          }
          if (s < 0.4) {
            return "Purple";
          }
          if (s < 0.75) {
            return "Violet";
          }
          return "Blue Violet";
        }
        if (l < 0.85) {
          if (s < 0.2) {
            return "Light Purple Grey";
          }
          if (s < 0.4) {
            return "Light Purple";
          }
          if (s < 0.75) {
            return "Purple";
          }
          return "Purple";
        }
        if (l < 0.99) {
          if (s < 0.3) {
            return "Light Grey";
          }
          if (s < 0.8) {
            return "Light Purple";
          }
          return "Light Purple";
        }
        return "Blue Violet";
      }
      if (h <= 295) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Very Dark Violet";
          }
          return "Dark Violet";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Purple";
          }
          if (s < 0.5) {
            return "Dark Violet";
          }
          if (s < 0.7) {
            return "Violet";
          }
          return "Violet";
        }
        if (l < 0.65) {
          if (s < 0.2) {
            return "Purplish Grey";
          }
          if (s < 0.4) {
            return "Purple";
          }
          if (s < 0.75) {
            return "Purple";
          }
          return "Purple";
        }
        if (l < 0.85) {
          if (s < 0.2) {
            return "Light Purple Grey";
          }
          if (s < 0.4) {
            return "Light Purple";
          }
          if (s < 0.75) {
            return "Light Purple";
          }
          return "Light Purple";
        }
        if (l < 0.99) {
          if (s < 0.3) {
            return "Light Grey";
          }
          if (s < 0.8) {
            return "Light Purple";
          }
          return "Light Purple";
        }
        return "Violet";
      }
      if (h <= 308) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Very Dark Purple";
          }
          return "Dark Purple";
        }
        if (l < 0.45) {
          if (s < 0.25) {
            return "Greyish Purple";
          }
          if (s < 0.5) {
            return "Dark Purple";
          }
          if (s < 0.7) {
            return "Purple";
          }
          return "Purple";
        }
        if (l < 0.65) {
          if (s < 0.24) {
            return "Greyish Purple";
          }
          if (s < 0.5) {
            return "Purple";
          }
          if (s < 0.75) {
            return "Purple";
          }
          return "Magenta";
        }
        if (l < 0.85) {
          if (s < 0.25) {
            return "Light Purple Grey";
          }
          if (s < 0.4) {
            return "Light Purple";
          }
          if (s < 0.75) {
            return "Light Purple";
          }
          return "Magenta";
        }
        if (l < 0.99) {
          if (s < 0.3) {
            return "Light Grey";
          }
          if (s < 0.8) {
            return "Pale Magenta";
          }
          return "Pale Magenta";
        }
        return "Magenta";
      }
      if (h <= 318) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Very Dark Purple";
          }
          return "Dark Purple";
        }
        if (l < 0.45) {
          if (s < 0.25) {
            return "Greyish Purple";
          }
          if (s < 0.5) {
            return "Dark Red Purple";
          }
          if (s < 0.7) {
            return "Dark Purple Red";
          }
          return "Dark Magenta";
        }
        if (l < 0.65) {
          if (s < 0.24) {
            return "Greyish Purple";
          }
          if (s < 0.5) {
            return "Purple";
          }
          if (s < 0.75) {
            return "Purple";
          }
          return "Hot Pink";
        }
        if (l < 0.85) {
          if (s < 0.25) {
            return "Light Purple Grey";
          }
          if (s < 0.4) {
            return "Light Magenta";
          }
          if (s < 0.75) {
            return "Light Magenta";
          }
          return "Hot Pink";
        }
        if (l < 0.99) {
          if (s < 0.3) {
            return "Light Grey";
          }
          if (s < 0.8) {
            return "Light Pink";
          }
          return "Light Pink";
        }
        return "Hot Pink";
      }
      if (h <= 343) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Very Dark Purple Red";
          }
          if (s < 0.6) {
            return "Dark Purple Red";
          }
          return "Purple Red";
        }
        if (l < 0.45) {
          if (s < 0.3) {
            return "Greyish Purple Red";
          }
          if (s < 0.5) {
            return "Dark Purple Red";
          }
          if (s < 0.7) {
            return "Purple Red";
          }
          return "Purple Red";
        }
        if (l < 0.65) {
          if (s < 0.24) {
            return "Greyish Purple";
          }
          if (s < 0.5) {
            return "Purple";
          }
          if (s < 0.75) {
            return "Purple Red";
          }
          return "Hot Pink";
        }
        if (l < 0.85) {
          if (s < 0.25) {
            return "Light Purple Grey";
          }
          if (s < 0.4) {
            return "Greyish Purple";
          }
          if (s < 0.75) {
            return "Purple";
          }
          return "Hot Pink";
        }
        if (l < 0.99) {
          if (s < 0.35) {
            return "Light Grey";
          }
          if (s < 0.7) {
            return "Light Pink";
          }
          return "Pink";
        }
        return "Rose Red";
      }
      if (h <= 360) {
        if (l < 0.25) {
          if (s < 0.4) {
            return "Very Dark Brown";
          }
          if (s < 0.6) {
            return "Dark Brown";
          }
          return "Dark Brown";
        }
        if (l < 0.45) {
          if (s < 0.2) {
            return "Dark Greyish Brown";
          }
          if (s < 0.6) {
            return "Dark Brown";
          }
          if (s < 0.7) {
            return "Dark Red";
          }
          return "Dark Red";
        }
        if (l < 0.65) {
          if (s < 0.24) {
            return "Greyish Red";
          }
          if (s < 0.5) {
            return "Purple Red";
          }
          if (s < 0.75) {
            return "Rose Red";
          }
          return "Red";
        }
        if (l < 0.85) {
          if (s < 0.25) {
            return "Light Reddish Grey";
          }
          if (s < 0.4) {
            return "Light Red";
          }
          if (s < 0.75) {
            return "Light Pink Red";
          }
          return "Pink Red";
        }
        if (l < 0.99) {
          if (s < 0.3) {
            return "Light Grey";
          }
          if (s < 0.7) {
            return "Pale Pink";
          }
          return "Pink";
        }
        return "Red";
      }
      return "Black";
    }
  };

  // src/ColorLookup.ts

  var ColorLookup = class {
    colorMap;
    lookupCube;
    chromaCache = /* @__PURE__ */ new Map();
    lookupCache = /* @__PURE__ */ new Map();
    downsampleFactor = 0;
    options = {
      deltaEThreshold: 5
    };
    constructor(lookupCube, colorMap, options = {}) {
      this.downsampleFactor = 256 / lookupCube.length;
      this.colorMap = colorMap;
      this.lookupCube = lookupCube;
      this.options = {
        ...this.options,
        ...options
      };
    }
    cachedChromaByRGB(r, g, b) {
      const key = `${r}_${g}_${b}`;
      if (!this.chromaCache.has(key)) {
        this.chromaCache.set(key, chroma(r, g, b));
      }
      return this.chromaCache.get(key);
    }
    getClosest(list, index, length) {
      return [
        list[index],
        list.slice(0, index).reverse().filter((i) => i !== null)[0],
        list.slice(index + 1, length).filter((i) => i !== null)[0]
      ].filter((i) => i !== void 0 && i !== null);
    }
    lookup(color, maxResults) {
      const rgb = color.rgb();
      return this.lookupByRGB(rgb[0], rgb[1], rgb[2], maxResults);
    }
    lookupByRGB(r, g, b, maxResults) {
      r = ~~r;
      g = ~~g;
      b = ~~b;
      const cacheKey = `${r}_${g}_${b}`;
      if (this.lookupCache.has(cacheKey)) {
        return this.lookupCache.get(cacheKey);
      }
      const R = Math.floor(r / this.downsampleFactor);
      const G = Math.floor(g / this.downsampleFactor);
      const B = Math.floor(b / this.downsampleFactor);
      const L = this.lookupCube.length;
      const givenColor = this.cachedChromaByRGB(r, g, b);
      const givenLAB = givenColor.lab();
      const foundColors = [];
      this.getClosest(this.lookupCube, R, L).forEach((gList) => {
        this.getClosest(gList, G, L).forEach((bList) => {
          const values = this.getClosest(bList, B, L);
          if (values !== null) {
            foundColors.push(...[].concat(...values));
          }
        });
      });
      let fallBackColors = [];
      let colors = [];
      for (const color of foundColors) {
        const actualColor = this.colorMap[color];
        const deltaE = chroma.deltaE(
          chroma.lab(givenLAB[0], givenLAB[1], givenLAB[2]),
          chroma.lab(
            actualColor.L,
            actualColor.A,
            actualColor.B
          )
        );
        if (deltaE <= this.options.deltaEThreshold) {
          colors.push({
            ...actualColor,
            deltaE
          });
          if (maxResults && colors.length >= maxResults) {
            break;
          }
        } else {
          if (fallBackColors.length === 0 || deltaE < fallBackColors[0].deltaE) {
            fallBackColors = [{
              ...actualColor,
              deltaE,
              isFallback: true
            }];
          }
        }
      }
      if (colors.length === 0) {
        colors = fallBackColors;
      }
      const shades = {};
      const altShades = {};
      for (const color of colors) {
        const altShade = color.altShade;
        if (!(altShade in altShades)) {
          altShades[altShade] = 0;
        }
        altShades[altShade]++;
        for (const shade of color.shade) {
          if (!(shade in shades)) {
            shades[shade] = 0;
          }
          shades[shade]++;
        }
      }
      colors.sort((a, b2) => a.deltaE - b2.deltaE);
      const shadeList = Object.entries(shades);
      shadeList.sort((a, b2) => b2[1] - a[1]);
      const altShadeList = Object.entries(altShades);
      altShadeList.sort((a, b2) => b2[1] - a[1]);
      const givenHex = givenColor.hex();
      colors = colors.map((c) => {
        c.euclideanDistance = chroma.distance(c.hex, givenHex, "rgb");
        return c;
      });
      this.lookupCache.set(cacheKey, {
        matchedHex: colors[0].hex,
        givenColor: [r, g, b, givenLAB[0], givenLAB[1], givenLAB[2]],
        colors,
        shades: shadeList,
        altShades: altShadeList
      });
      return this.lookupCache.get(cacheKey);
    }
  };

  // src/ShadeLookup.ts
  var ShadeLookup = class {
    binaryLookup;
    samplingFactor;
    edgeLength;
    byteToShadeMap;
    constructor(binaryLookup, byteToShadeMap) {
      this.samplingFactor = Math.cbrt(Math.pow(2, 24) / binaryLookup.length);
      this.binaryLookup = binaryLookup;
      this.edgeLength = 256 / this.samplingFactor;
      this.byteToShadeMap = byteToShadeMap;
    }
    shade(color) {
      return this.shadeByRGB(...color.rgb());
    }
    shadeByRGB(r, g, b) {
      r = ~~(r / this.samplingFactor);
      g = ~~(g / this.samplingFactor);
      b = ~~(b / this.samplingFactor);
      const p = r * this.edgeLength * this.edgeLength + g * this.edgeLength + b;
      return this.byteToShadeMap[this.binaryLookup[p].charCodeAt(0)];
    }
    shades(color, searchCubeEdgeLength = 3) {
      return this.shadesByRGB(...color.rgb(), searchCubeEdgeLength);
    }
    shadesByRGB(r, g, b, searchCubeEdgeLength = 3) {
      if (searchCubeEdgeLength < 1) {
        throw new Error("searchCubeEdgeLength must be greater than 0");
      }
      if (searchCubeEdgeLength % 2 === 0) {
        throw new Error("searchCubeEdgeLength must be an odd number");
      }
      const shades = {};
      const upper = ~~(searchCubeEdgeLength * 0.5);
      const lower = -upper;
      for (let x = lower; x <= upper; x++) {
        const R = r + x * this.samplingFactor;
        let G;
        let B;
        if (R > 255 || R < 0) {
          continue;
        }
        for (let y = lower; y <= upper; y++) {
          G = g + y * this.samplingFactor;
          if (G > 255 || G < 0) {
            continue;
          }
          for (let z = lower; z <= upper; z++) {
            B = b + z * this.samplingFactor;
            if (B > 255 || B < 0) {
              continue;
            }
            const shade = this.shadeByRGB(R, G, B);
            if (!(shade in shades)) {
              shades[shade] = 1;
              continue;
            }
            shades[shade]++;
          }
        }
      }
      const foundShades = Object.entries(shades);
      foundShades.sort((a, b2) => b2[1] - a[1]);
      return foundShades;
    }
  };

  exports.AltShadeLookup = AltShadeLookup_default;
  exports.ColorLookup = ColorLookup;
  exports.ShadeLookup = ShadeLookup;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
