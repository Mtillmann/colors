export interface SimpleColor {
  r: number
  g: number
  b: number
  alias: string[]
  source: string
  hex: string
  L: number
  A: number
  B: number
  shade: string[]
  altShade?: string
  deltaE?: number
  givenColor?: number[]
  euclideanDistance?: number
  isFallback?: boolean
}
