(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Colors = {}));
})(this, (function (exports) { 'use strict';

  // src/colorMath.ts
  var Xn = 0.95047;
  var Yn = 1;
  var Zn = 1.08883;
  var t0 = 0.137931034;
  var t2 = 0.12841855;
  var t3 = 8856452e-9;
  function rgbToXyzChannel(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function xyzToLabChannel(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
  }
  function rgbToLab(r, g, b) {
    const R = rgbToXyzChannel(r);
    const G = rgbToXyzChannel(g);
    const B = rgbToXyzChannel(b);
    const x = xyzToLabChannel((0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / Xn);
    const y = xyzToLabChannel((0.2126729 * R + 0.7151522 * G + 0.072175 * B) / Yn);
    const z = xyzToLabChannel((0.0193339 * R + 0.119192 * G + 0.9503041 * B) / Zn);
    const L = 116 * y - 16;
    return [L < 0 ? 0 : L, 500 * (x - y), 200 * (y - z)];
  }
  var RAD2DEG = 180 / Math.PI;
  var DEG2RAD = Math.PI / 180;
  var POW25_7 = Math.pow(25, 7);
  function deltaE2000(L1, a1, b1, L2, a2, b2) {
    const avgL = (L1 + L2) / 2;
    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const avgC7 = Math.pow((C1 + C2) / 2, 7);
    const G = 0.5 * (1 - Math.sqrt(avgC7 / (avgC7 + POW25_7)));
    const a1p = a1 * (1 + G);
    const a2p = a2 * (1 + G);
    const C1p = Math.sqrt(a1p * a1p + b1 * b1);
    const C2p = Math.sqrt(a2p * a2p + b2 * b2);
    const avgCp = (C1p + C2p) / 2;
    const arctan1 = Math.atan2(b1, a1p) * RAD2DEG;
    const arctan2 = Math.atan2(b2, a2p) * RAD2DEG;
    const h1p = arctan1 >= 0 ? arctan1 : arctan1 + 360;
    const h2p = arctan2 >= 0 ? arctan2 : arctan2 + 360;
    const avgHp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;
    const T = 1 - 0.17 * Math.cos((avgHp - 30) * DEG2RAD) + 0.24 * Math.cos(2 * avgHp * DEG2RAD) + 0.32 * Math.cos((3 * avgHp + 6) * DEG2RAD) - 0.2 * Math.cos((4 * avgHp - 63) * DEG2RAD);
    let deltaHp = h2p - h1p;
    deltaHp = Math.abs(deltaHp) <= 180 ? deltaHp : h2p <= h1p ? deltaHp + 360 : deltaHp - 360;
    deltaHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deltaHp * DEG2RAD / 2);
    const deltaL = L2 - L1;
    const deltaCp = C2p - C1p;
    const l50 = (avgL - 50) * (avgL - 50);
    const sl = 1 + 0.015 * l50 / Math.sqrt(20 + l50);
    const sc = 1 + 0.045 * avgCp;
    const sh = 1 + 0.015 * avgCp * T;
    const dTheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2));
    const avgCp7 = Math.pow(avgCp, 7);
    const Rc = 2 * Math.sqrt(avgCp7 / (avgCp7 + POW25_7));
    const Rt = -Rc * Math.sin(2 * dTheta * DEG2RAD);
    const l = deltaL / sl;
    const c = deltaCp / sc;
    const h = deltaHp / sh;
    const result = Math.sqrt(l * l + c * c + h * h + Rt * c * h);
    return Math.max(0, Math.min(100, result));
  }
  function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | Math.round(r) << 16 | Math.round(g) << 8 | Math.round(b)).toString(16).slice(1);
  }
  function rgbDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  }
  function rgbToHsl(r, g, b) {
    r = Math.min(255, Math.max(0, r)) / 255;
    g = Math.min(255, Math.max(0, g)) / 255;
    b = Math.min(255, Math.max(0, b)) / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const l = (max + min) / 2;
    let s;
    let h = Number.NaN;
    if (max === min) {
      s = 0;
    } else {
      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
      if (r === max) h = (g - b) / (max - min);
      else if (g === max) h = 2 + (b - r) / (max - min);
      else h = 4 + (r - g) / (max - min);
      h *= 60;
      if (h < 0) h += 360;
    }
    return [h, s, l];
  }

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
    /** accepts anything with an rgb() method; uses hsl() directly when available (e.g. a chroma-js Color) */
    shade(color, includeNativeShade = false) {
      const [h, s, l] = typeof color.hsl === "function" ? color.hsl() : rgbToHsl(...color.rgb());
      return this.shadeByHSL(h, s, l, includeNativeShade);
    }
    shadeByRGB(r, g, b, includeNativeShade = false) {
      const [h, s, l] = rgbToHsl(r, g, b);
      return this.shadeByHSL(h, s, l, includeNativeShade);
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
    /** accepts anything with an rgb() method, e.g. a chroma-js Color */
    lookup(color, maxResults) {
      const rgb = color.rgb();
      return this.lookupByRGB(rgb[0], rgb[1], rgb[2], maxResults);
    }
    /** hex keys of all colors in the cells within `radius` of cell (R, G, B) */
    candidates(R, G, B, radius) {
      const size = this.lookupCube.length;
      const found = [];
      for (let x = Math.max(0, R - radius); x <= Math.min(size - 1, R + radius); x++) {
        for (let y = Math.max(0, G - radius); y <= Math.min(size - 1, G + radius); y++) {
          for (let z = Math.max(0, B - radius); z <= Math.min(size - 1, B + radius); z++) {
            const cell = this.lookupCube[x][y][z];
            if (cell !== null && cell !== void 0) found.push(...cell);
          }
        }
      }
      return found;
    }
    lookupByRGB(r, g, b, maxResults) {
      r = ~~r;
      g = ~~g;
      b = ~~b;
      const cacheKey = `${r}_${g}_${b}`;
      const cached = this.lookupCache.get(cacheKey);
      if (cached !== void 0) {
        return cached;
      }
      const R = Math.floor(r / this.downsampleFactor);
      const G = Math.floor(g / this.downsampleFactor);
      const B = Math.floor(b / this.downsampleFactor);
      const [gL, gA, gB] = rgbToLab(r, g, b);
      let found = [];
      for (let radius = 1; found.length === 0 && radius < this.lookupCube.length; radius++) {
        found = this.candidates(R, G, B, radius);
      }
      const ranked = found.map((hex) => {
        const c = this.colorMap[hex];
        return { ...c, deltaE: deltaE2000(gL, gA, gB, c.L, c.A, c.B) };
      });
      ranked.sort((x, y) => x.deltaE - y.deltaE);
      let colors = ranked.filter((c) => c.deltaE <= this.options.deltaEThreshold);
      if (maxResults !== void 0 && maxResults > 0) colors = colors.slice(0, maxResults);
      if (colors.length === 0) colors = [{ ...ranked[0], isFallback: true }];
      const shades = {};
      const altShades = {};
      for (const color of colors) {
        const altShade = color.altShade;
        altShades[altShade] = (altShades[altShade] ?? 0) + 1;
        for (const shade of color.shade) {
          shades[shade] = (shades[shade] ?? 0) + 1;
        }
      }
      const shadeList = Object.entries(shades);
      shadeList.sort((a, b2) => b2[1] - a[1]);
      const altShadeList = Object.entries(altShades);
      altShadeList.sort((a, b2) => b2[1] - a[1]);
      for (const c of colors) {
        c.euclideanDistance = rgbDistance(c.r, c.g, c.b, r, g, b);
      }
      const result = {
        matchedHex: colors[0].hex,
        givenColor: [r, g, b, gL, gA, gB],
        colors,
        shades: shadeList,
        altShades: altShadeList
      };
      this.lookupCache.set(cacheKey, result);
      return result;
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
      const [r, g, b] = color.rgb();
      return this.shadeByRGB(r, g, b);
    }
    shadeByRGB(r, g, b) {
      r = ~~(r / this.samplingFactor);
      g = ~~(g / this.samplingFactor);
      b = ~~(b / this.samplingFactor);
      const p = r * this.edgeLength * this.edgeLength + g * this.edgeLength + b;
      return this.byteToShadeMap[this.binaryLookup[p].charCodeAt(0)];
    }
    shades(color, searchCubeEdgeLength = 3) {
      const [r, g, b] = color.rgb();
      return this.shadesByRGB(r, g, b, searchCubeEdgeLength);
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

  // src/NearestColorLookup.ts
  var NearestColorLookup = class {
    colors;
    L;
    A;
    B;
    options = {
      deltaEThreshold: 5
    };
    constructor(colorMap, options = {}) {
      this.colors = Object.values(colorMap);
      const n = this.colors.length;
      this.L = new Float64Array(n);
      this.A = new Float64Array(n);
      this.B = new Float64Array(n);
      this.colors.forEach((c, i) => {
        this.L[i] = c.L;
        this.A[i] = c.A;
        this.B[i] = c.B;
      });
      this.options = { ...this.options, ...options };
    }
    /** accepts anything with an rgb() method, e.g. a chroma-js Color */
    lookup(color, maxResults = 1) {
      const [r, g, b] = color.rgb();
      return this.lookupByRGB(r, g, b, maxResults);
    }
    lookupByRGB(r, g, b, maxResults = 1) {
      r = ~~r;
      g = ~~g;
      b = ~~b;
      const [gL, gA, gB] = rgbToLab(r, g, b);
      const bestIdx = [];
      const bestDE = [];
      const n = this.colors.length;
      for (let i = 0; i < n; i++) {
        const dE = deltaE2000(gL, gA, gB, this.L[i], this.A[i], this.B[i]);
        if (bestDE.length === maxResults && dE >= bestDE[bestDE.length - 1]) continue;
        let p = bestDE.length;
        while (p > 0 && bestDE[p - 1] > dE) p--;
        bestDE.splice(p, 0, dE);
        bestIdx.splice(p, 0, i);
        if (bestDE.length > maxResults) {
          bestDE.pop();
          bestIdx.pop();
        }
      }
      const colors = bestIdx.map((idx, k) => {
        const c = this.colors[idx];
        const result = {
          ...c,
          deltaE: bestDE[k],
          euclideanDistance: rgbDistance(c.r, c.g, c.b, r, g, b)
        };
        if (bestDE[k] > this.options.deltaEThreshold) result.isFallback = true;
        return result;
      });
      const shades = {};
      const altShades = {};
      for (const c of colors) {
        for (const s of c.shade) shades[s] = (shades[s] ?? 0) + 1;
        if (c.altShade !== void 0) altShades[c.altShade] = (altShades[c.altShade] ?? 0) + 1;
      }
      const byCount = (x, y) => y[1] - x[1];
      return {
        matchedHex: colors[0].hex,
        givenColor: [r, g, b, gL, gA, gB],
        colors,
        shades: Object.entries(shades).sort(byCount),
        altShades: Object.entries(altShades).sort(byCount)
      };
    }
    /** shade of the exact nearest named color */
    shadeByRGB(r, g, b) {
      return this.lookupByRGB(r, g, b, 1).colors[0].shade[0];
    }
    static hex(r, g, b) {
      return rgbToHex(r, g, b);
    }
  };

  exports.AltShadeLookup = AltShadeLookup_default;
  exports.ColorLookup = ColorLookup;
  exports.NearestColorLookup = NearestColorLookup;
  exports.ShadeLookup = ShadeLookup;
  exports.deltaE2000 = deltaE2000;
  exports.rgbToHsl = rgbToHsl;
  exports.rgbToLab = rgbToLab;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
