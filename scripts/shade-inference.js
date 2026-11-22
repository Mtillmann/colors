// Shade inference for colors without a human shade label.
// Two sources are blended:
//  - the k closest human-labelled colors vote (weight 1 / (1 + deltaE)), normalized to 1
//  - the xkcd color survey: share of people who named colors in that RGB region with each shade
// If the runner-up shade reaches `secondRatio` of the winner's score, it is returned as a second shade.
import { deltaE2000 } from '../dist/index.js'

export const DEFAULTS = { k: 5, maxDeltaE: 50, secondRatio: 0.7, surveyWeight: 0.5 }

/** share of survey answers per shade for an RGB color: { Blue: 0.62, Cyan: 0.35, ... } */
export function surveyShares (survey, [r, g, b]) {
  const step = 256 / survey.grid
  const cell = survey.cells[Math.floor(r / step) * survey.grid * survey.grid + Math.floor(g / step) * survey.grid + Math.floor(b / step)]
  const n = cell.reduce((a, v) => a + v, 0)
  const out = {}
  if (n > 0) survey.shades.forEach((s, i) => { if (cell[i] > 0) out[s] = cell[i] / n })
  return out
}

/**
 * @param {number[]} lab target [L, a, b]
 * @param {{lab: number[], shades: string[]}[]} labelled human-labelled colors (base shades)
 * @param {object} options { survey, rgb, surveyWeight, k, maxDeltaE, secondRatio }
 * @returns {{shades: string[], votes: [string, number][]}}
 */
export function inferShades (lab, labelled, options = {}) {
  const { k, maxDeltaE, secondRatio, survey, rgb } = { ...DEFAULTS, ...options }
  const surveyWeight = survey && rgb ? (options.surveyWeight ?? DEFAULTS.surveyWeight) : 0
  const nearest = []
  for (const c of labelled) {
    const d = deltaE2000(lab[0], lab[1], lab[2], c.lab[0], c.lab[1], c.lab[2])
    if (d > maxDeltaE) continue
    if (nearest.length === k && d >= nearest[k - 1].d) continue
    nearest.push({ d, c })
    nearest.sort((a, b) => a.d - b.d)
    if (nearest.length > k) nearest.pop()
  }
  const knn = {}
  for (const { d, c } of nearest) {
    for (const s of c.shades) knn[s] = (knn[s] ?? 0) + 1 / (1 + d)
  }
  const total = Object.values(knn).reduce((a, v) => a + v, 0) || 1
  const score = {}
  for (const s in knn) score[s] = (1 - surveyWeight) * knn[s] / total
  if (surveyWeight > 0) {
    const shares = surveyShares(survey, rgb)
    for (const s in shares) score[s] = (score[s] ?? 0) + surveyWeight * shares[s]
  }
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1])
  if (ranked.length === 0) return { shades: [], votes: [] }
  const shades = [ranked[0][0]]
  if (ranked.length > 1 && ranked[1][1] >= secondRatio * ranked[0][1]) shades.push(ranked[1][0])
  return { shades, votes: ranked }
}
