// Dependency-free color math, numerically identical to chroma-js 2.4 (rgb->lab, deltaE CIEDE2000, hsl).

// chroma-js LAB_CONSTANTS (D65)
const Xn = 0.950470
const Yn = 1
const Zn = 1.088830
const t0 = 0.137931034
const t2 = 0.12841855
const t3 = 0.008856452

function rgbToXyzChannel (c: number): number {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function xyzToLabChannel (t: number): number {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0
}

export function rgbToLab (r: number, g: number, b: number): [number, number, number] {
  const R = rgbToXyzChannel(r)
  const G = rgbToXyzChannel(g)
  const B = rgbToXyzChannel(b)
  const x = xyzToLabChannel((0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / Xn)
  const y = xyzToLabChannel((0.2126729 * R + 0.7151522 * G + 0.0721750 * B) / Yn)
  const z = xyzToLabChannel((0.0193339 * R + 0.1191920 * G + 0.9503041 * B) / Zn)
  const L = 116 * y - 16
  return [L < 0 ? 0 : L, 500 * (x - y), 200 * (y - z)]
}

const RAD2DEG = 180 / Math.PI
const DEG2RAD = Math.PI / 180
const POW25_7 = Math.pow(25, 7)

/** CIEDE2000 (Kl = Kc = Kh = 1), same formulation as chroma.deltaE */
export function deltaE2000 (
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number
): number {
  const avgL = (L1 + L2) / 2
  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const avgC7 = Math.pow((C1 + C2) / 2, 7)
  const G = 0.5 * (1 - Math.sqrt(avgC7 / (avgC7 + POW25_7)))
  const a1p = a1 * (1 + G)
  const a2p = a2 * (1 + G)
  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)
  const avgCp = (C1p + C2p) / 2
  const arctan1 = Math.atan2(b1, a1p) * RAD2DEG
  const arctan2 = Math.atan2(b2, a2p) * RAD2DEG
  const h1p = arctan1 >= 0 ? arctan1 : arctan1 + 360
  const h2p = arctan2 >= 0 ? arctan2 : arctan2 + 360
  const avgHp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2
  const T = 1 - 0.17 * Math.cos((avgHp - 30) * DEG2RAD) + 0.24 * Math.cos(2 * avgHp * DEG2RAD) +
    0.32 * Math.cos((3 * avgHp + 6) * DEG2RAD) - 0.2 * Math.cos((4 * avgHp - 63) * DEG2RAD)
  let deltaHp = h2p - h1p
  deltaHp = Math.abs(deltaHp) <= 180 ? deltaHp : h2p <= h1p ? deltaHp + 360 : deltaHp - 360
  deltaHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deltaHp * DEG2RAD / 2)
  const deltaL = L2 - L1
  const deltaCp = C2p - C1p
  const l50 = (avgL - 50) * (avgL - 50)
  const sl = 1 + (0.015 * l50) / Math.sqrt(20 + l50)
  const sc = 1 + 0.045 * avgCp
  const sh = 1 + 0.015 * avgCp * T
  const dTheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2))
  const avgCp7 = Math.pow(avgCp, 7)
  const Rc = 2 * Math.sqrt(avgCp7 / (avgCp7 + POW25_7))
  const Rt = -Rc * Math.sin(2 * dTheta * DEG2RAD)
  const l = deltaL / sl
  const c = deltaCp / sc
  const h = deltaHp / sh
  const result = Math.sqrt(l * l + c * c + h * h + Rt * c * h)
  return Math.max(0, Math.min(100, result))
}

export function rgbToHex (r: number, g: number, b: number): string {
  return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1)
}

export function rgbDistance (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}
