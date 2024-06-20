import { type SimpleColor } from './SimpleColor'

export interface LookupResult {
  matchedHex: string
  givenColor: number[]
  colors: SimpleColor[]
  shades: Array<[string, number]>
  altShades: Array<[string, number]>
}
