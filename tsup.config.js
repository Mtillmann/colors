import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['esm'],
  entry: ['src/index.ts', 'src/data/binaryLookupMaps.ts', 'src/data/binaryLookup.ts', 'src/data/colorMap.ts', 'src/data/lookupCube.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: true,
})
