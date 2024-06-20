console.time('import');
import chroma from 'chroma-js';
import { ColorLookup, ShadeLookup } from '@mtillmann/colors';

import colorMap from '@mtillmann/colors/dist/data/colorMap.js';
import lookupCube from '@mtillmann/colors/dist/data/lookupCube.js';

import binaryLookup from '@mtillmann/colors/dist/data/binaryLookup.js';
import { byteToShadeOffset } from '@mtillmann/colors/dist/data/binaryLookupMaps.js';

console.timeEnd('import');
const colorLookup = new ColorLookup(lookupCube, colorMap);
console.time('colorLookup');
const result = colorLookup.lookupByRGB(200, 200, 20, 1);
console.log(result)
console.timeEnd('colorLookup');


console.time('shadeLookup');
const shadeLookup = new ShadeLookup(binaryLookup, byteToShadeOffset);

const c = chroma(200,200,20);
const shade = shadeLookup.shade(c);

const shades = shadeLookup.shades(c);
console.log(shades, shade);
console.timeEnd('shadeLookup');
