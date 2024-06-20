console.log('ALWAYS BUILD FIRST!');

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { ColorLookup } from "../dist/index.js";
import chroma from 'chroma-js';

import colorMap from '../src/data/colorMap.json' assert { type: 'json' };
import lookupCube from '../src/data/lookupCube.json' assert { type: 'json' };

let cl = new ColorLookup(lookupCube, colorMap);

const startAt = 48;

const map = Object.fromEntries(Object.values(colorMap).reduce((acc, c) => {
    for (const shade of c.shade) {
        if (!acc.includes(shade)) {
            acc.push(shade);
        }
    }
    return acc;
}, []).map((shade, i) => [shade, i + startAt]));

const factor = 4;
const l = 256 / factor;
let binString = '';
let r = 0;
let g = 0;
let b = 0;

for (r = 0; r < l; r++) {
    for (g = 0; g < l; g++) {
        for (b = 0; b < l; b++) {
            let result = cl.lookup(chroma.rgb(r * factor, g * factor, b * factor));
            let shades = {}
            result.colors.forEach(c => {
                c.shade.forEach(s => {
                    if (!(s in shades)) {
                        shades[s] = 0;
                    }
                    shades[s]++;
                });
            })

            shades = Object.entries(shades);
            shades.sort((a, b) => b[1] - a[1])
            binString += String.fromCharCode(map[shades[0][0]]);
        }
    }
}

const reverseMap = JSON.stringify(Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]))).replace(/"(\d+)"/g, '$1');

fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../src/data/binaryLookupMaps.ts', `
export const shadeToByte: Record<string, number> = ${JSON.stringify(map)};
export const byteToShadeOffset: Record<number, string> = ${reverseMap};
export const byteToShadeNormal: string[] = ${JSON.stringify(Object.keys(map))};
export const offset: number = ${startAt};`);


fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../src/data/binaryLookupMaps.json', JSON.stringify({
    shadeToByte: map,
    byteToShadeOffset: Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])),
    byteToShadeNormal: Object.keys(map),
    offset: startAt
}, null, 2));




fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../src/data/binaryLookup.bin', binString);
fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../src/data/binaryLookup.ts', `export default '${binString}'`);
