import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['esm'],
  entry: ['src/index.ts', 'src/data/binaryLookupMaps.ts', 'src/data/binaryLookup.ts', 'src/data/colorMap.ts', 'src/data/lookupCube.ts',
    'src/data/binaryLookupMaps.extended.ts', 'src/data/binaryLookup.extended.ts', 'src/data/colorMap.extended.ts', 'src/data/lookupCube.extended.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: true,
})
