# Colors

Library to look up color names and shades

## Installation

```bash
npm i @mtillmann/colors
```

The package contains an ESM version and can be regularly imported.
There is also an UMD version for buildless environments in the `dist/umd` folder.

The UMD version's classes exist inside a global `Colors` namespace-object. When using the UMD version you also have to provide global `chroma-js`.

In any case you must provide the (included) data to the library class constructors!

> The `examples` folder contains a simple example of how to use the library in a browser environment and a node environment.

## `ColorLookup` - Look up Color Names

This class provides a way to look up color names and shads for any given color. It uses a large generated color map and a cubic lookup data structure to find the closest matching color names and shades. The quality (i.e. likeness) of the matches is measured by the [deltaE](https://en.wikipedia.org/wiki/Color_difference#CIELAB_%CE%94E*).

### `constructor(colorMap: ColorMap, lookupCube: LookupCube)`

Creates a new instance of the ColorLookup class.

### `lookup(color: Color, maxResults: number = 1): ColorLookupResult`

Looks up the closest matching color names and shades for a given `chroma`-instance (`Color`).

### `lookupByRGB(r: number, g: number, b: number, maxResults: number = 1): ColorLookupResult`

Looks up the closest matching color names and shades for a given RGB color value.

### Example

```es6
import { ColorLookup } from "@mtillmann/colors";

// acquire the data dependencies.
// You can also do this at runtime to reduce bundle size.
// non-module JSON files are located in the dist/data folder.
import colorMap from "@mtillmann/colors/dist/data/colorMap.js";
import lookupCube from "@mtillmann/colors/dist/data/lookupCube.js";

const colorLookup = new ColorLookup(colorMap, lookupCube);

const color = colorLookup.lookupByRGB(200, 200, 20, 1);
```

### Result

The `ColorLookupResult` is the most complex data structure in the library. It contains the closest matching colors and lists of matched shades. Below is an example of a result object with comments explaining the structure:

```json5
{
  matchedHex: "#B0BF1A", // the hex value of the closest matching color
  givenColor: [
    200, // r
    200, // g
    20, // b
    78.25, // L
    -17.71, // A
    76.47, // B
  ],
  colors: [
    // list of closest matching colors
    {
      r: 176,
      g: 191,
      b: 26,
      alias: [
        // list of color names of the matched color
        "Acid green",
      ],
      source: "wikipedia", // source of the color name
      hex: "#B0BF1A", // hex value of the matched color
      L: 73.91190973157778, // L value of the matched color
      A: -23.382466819196203, // A value of the matched color
      B: 71.14580613279261, // B value of the matched color
      shade: [
        // list of color shades of the matched color
        "Green",
      ],
      altShade: "Yellow Green", // alternative color shade of the matched color
      deltaE: 4.820870866863052, // deltaE distance of matched color from the given color
      euclideanDistance: 26.324893162176366, // euclidean distance of matched color from the given color
    },
  ],
  shades: [
    // list of color shades of the matched colors
    [
      "Green", // color shade
      1, // number of occurrences in the matched colors
    ],
  ],
  altShades: [
    // same as shades but for alternative color shades
    ["Yellow Green", 1],
  ],
}
```

## `ShadeLookup` - Look up Color Shades

`ShadeLookup` is useful if you just want the the color shade of a color or when you need to get the color shades for a large number of colors. It is based on a downsampled binary lookup of the RGB color space and outperforms `ColorLookup` by ~250 times (see `examples/node-esm/benchmark.js`).

### `constructor(binaryLookup: BinaryLookup, byteToShadeOffset: ByteToShadeOffset)`

Creates a new instance of the ShadeLookup class.

### `shadeByRGB(r: number, g: number, b: number): string`

Returns the shade sampled from the binary lookup for a given RGB color value.

### `shadesByRGB(r: number, g: number, b: number, searchCubeEdgeLength: number = 3): [string, number][]`

Returns a list of shades sampled from a smaller cube inside the binary lookup. This can be useful if you want to get a list of possible shades for a color. In the result array the first element is the shade and the second element is the number of occurrences of that shade in the result set.

The `searchCubeEdgeLength` parameter defines the size of the cube that is searched for shades. The default value is 3 which means that the search cube is 3x3x3 and 27 points will be sampled. If the given color is on one or multiple edges of the RGB color space the sample size will be smaller.

### `shade(color: Color): string`

Same as `shadeByRGB` but takes a `chroma`-instance (`Color`) as input.

### `shades(color: Color, searchCubeEdgeLength: number = 3): [string, number][]`

Same as `shadesByRGB` but takes a `chroma`-instance (`Color`) as input.

### Example

```es6
//import data dependencies
//again, those can be loaded at runtime to reduce bundle size
import binaryLookup from "@mtillmann/colors/dist/data/binaryLookup.js";
import { byteToShadeOffset } from "@mtillmann/colors/dist/data/binaryLookupMaps.js";
import { ShadeLookup } from "@mtillmann/colors";

const shadeLookup = new ShadeLookup(binaryLookup, byteToShadeOffset);

const shade = shadeLookup.shadeByRGB(200, 200, 20);
// shade = "Green"

const shades = shadeLookup.shadesByRGB(200, 200, 20);
// shades = [ [ 'Green', 18 ], [ 'Dark Yellow', 9 ] ]
```

### `AltShadeLookup` - Look up Alternative Color Shades

`AltShadeLookup` is a simple class that uses a heuristic way to find color shades for a given color. It is roughly as fast as `ShadeLookup.shade*` but has no data dependencies, which makes it a bit more lightweight.

Since it is based on a heuristics it is not as accurate as the other lookup classes but it is still useful for many applications.

As the actual algorithm uses the H,S and L values, it performs best when the `shadeByHSL` method is used, since no conversion is necessary.

Each method supports an optional `includeNativeShade` parameter that can be used to include the native (data-based) color shade in the result.

The native color shades are taken from a simple mapping inside the class so there is no performance penalty for including them in the result.

### `constructor()`

Creates a new instance of the AltShadeLookup class.

### `shadeByHSL(h: number, s: number, l: number, includeNativeShade: Boolean = false): [string, string] | string`

Returns the alternative color shade for a given HSL color value

### `shadeByRGB(r: number, g: number, b: number, includeNativeShade: Boolean = false): [string, string] | string`

Same as `shadeByHSL` but takes RGB color values as input.

### `shade(color: Color, includeNativeShade: Boolean = false): [string, string] | string`

Same as `shadeByHSL` but takes a `chroma`-instance (`Color`) as input.

### Example

```es6
import { AltShadeLookup } from "@mtillmann/colors";

const altShadeLookup = new AltShadeLookup();

const shade = altShadeLookup.shadeByRGB(200, 200, 20);
// shade = "Yellow Green"

const shadeWithNative = altShadeLookup.shadeByRGB(200, 200, 20, true);
// shadeWithNative = [ "Yellow Green", "Green" ]
```

## Building the Data

If you want to use your own data, look in the `sources` folder for the source data structures, then adapt the scripts in the `scripts` folder to your include your sources.

Run the scripts in the following order:

1. `npm run build` - run the build to create js files that can be used by node
2. `node scripts/generate-color-map.js` - generates the color map from the source data
3. `node scripts/generate-lookup-cube.js` - generates the lookup cube from the color map
4. `node scripts/generate-binary-lookup.js` - generates the binary lookup and some metadata from the color map
5. `npm run build` - run the build again to include the generated data in the dist folder

## Acknowledgements

The library is based on my [isit.red](https://isit.red) project and is used in my chrome extension [color helper](https://github.com/Mtillmann/color-helper-extension?tab=readme-ov-file#color-helper-extension) as well.

All of the parsing, conversion and other heavy lifting is done by the great [chroma-js](https://gka.github.io/chroma.js/#chroma) library.

Color names and shades are sourced from wikipedia and used with permission from [cssgradient.io](https://cssgradient.io/color-shades/).
