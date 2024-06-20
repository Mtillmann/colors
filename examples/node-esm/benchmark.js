console.time('import');
import chroma from 'chroma-js';
import { ColorLookup, ShadeLookup, AltShadeLookup } from '@mtillmann/colors';

import colorMap from '@mtillmann/colors/dist/data/colorMap.js';
import lookupCube from '@mtillmann/colors/dist/data/lookupCube.js';

import binaryLookup from '@mtillmann/colors/dist/data/binaryLookup.js';
import { byteToShadeOffset } from '@mtillmann/colors/dist/data/binaryLookupMaps.js';
console.timeEnd('import');


console.time('preparing colors');
const colorCount = 10000;
const colors = new Set();

while(colors.size < colorCount) {
    colors.add(chroma.random().rgb());
}
console.timeEnd('preparing colors');

console.time(`ColorLookup.constructor`);
const colorLookup = new ColorLookup(lookupCube, colorMap);
console.timeEnd(`ColorLookup.constructor`);

console.time(`ColorLookup.lookup x ${colorCount}`);
for(const color of colors) {
    colorLookup.lookupByRGB(color[0], color[1], color[2], 1);
}
console.timeEnd(`ColorLookup.lookup x ${colorCount}`);


console.time(`ShadeLookup.constructor`);
const shadeLookup = new ShadeLookup(binaryLookup, byteToShadeOffset);
console.timeEnd(`ShadeLookup.constructor`);

console.time(`ShadeLookup.shade x ${colorCount}`);

for(const color of colors) {
    shadeLookup.shadeByRGB(color[0], color[1], color[2]);
}
console.timeEnd(`ShadeLookup.shade x ${colorCount}`);

console.time(`ShadeLookup.shades x ${colorCount}`);
for(const color of colors) {
    shadeLookup.shadesByRGB(color[0], color[1], color[2]);
}
console.timeEnd(`ShadeLookup.shades x ${colorCount}`);

console.time(`AltShadeLookup.constructor`);
const altShadeLookup = new AltShadeLookup();
console.timeEnd(`AltShadeLookup.constructor`);

console.time(`AltShadeLookup.shadeByRGB x ${colorCount}`);
for(const color of colors) {
    altShadeLookup.shadeByRGB(color[0], color[1], color[2]);
}
console.timeEnd(`AltShadeLookup.shadeByRGB x ${colorCount}`);

console.time(`RGB To HSL x ${colorCount}`);
const hslColors = new Set();
for(const color of colors) {
    hslColors.add(chroma(color).hsl());
}
console.timeEnd(`RGB To HSL x ${colorCount}`);

console.time(`AltShadeLookup.shadeByHSL x ${colorCount}`);
for(const color of hslColors) {
    altShadeLookup.shadeByHSL(color[0], color[1], color[2]);
}
console.timeEnd(`AltShadeLookup.shadeByHSL x ${colorCount}`);

