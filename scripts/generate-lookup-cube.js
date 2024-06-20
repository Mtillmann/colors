console.log('ALWAYS BUILD FIRST!');

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { unquoteKeys } from "./util.js";
import colors from '../src/data/colorMap.json' assert {type : 'json'};

const edgeLength = parseInt(process.argv[2] || 8);
const allowdEdgeLengths = [2, 4, 8, 16, 32, 64, 128];
if(!allowdEdgeLengths.includes(edgeLength)){
    console.log('Invalid edge length. Allowed edge lengths are: ' + allowdEdgeLengths.join(', '));
    process.exit(1);
}

const downsampleFactor = 256 / edgeLength;

console.log(`generating lookup cube for edge length ${edgeLength} and downsample factor ${downsampleFactor}...`);

let map = {};

function downsample(value, downsampleFactor) {
    const max = Math.floor(255 / downsampleFactor) * downsampleFactor;
    return Math.max(0, Math.min(max, Math.floor(value / downsampleFactor)));
}

function insertIntoMap(color, hex) {
    const R = downsample(color.r, downsampleFactor),
        G = downsample(color.g, downsampleFactor),
        B = downsample(color.b, downsampleFactor);

    if (!(R in map)) {
        map[R] = {};
    }
    if (!(G in map[R])) {
        map[R][G] = {};
    }
    if (!(B in map[R][G])) {
        map[R][G][B] = [];
    }

    //map[R][G][B].push({hex: color.hex, r: color.r, g: color.g, b: color.b});
    map[R][G][B].push(hex);
}



const l = downsample(255, downsampleFactor);

for (const hex in colors) {
    insertIntoMap(colors[hex], hex)
}

for (let r = 0; r <= l; r++) {
    if (r in map) {
        for (let g = 0; g <= l; g++) {

            if (g in map[r]) {
                for (let b = 0; b <= l; b++) {
                    if (!(b in map[r][g])) {
                        map[r][g][b] = null;
                    }
                }
            } else {
                map[r][g] = null;
            }
        }
    } else {
        map[r] = null;
    }
}

const newChunks = [];
for (let r = 0; r <= l; r++) {
    newChunks.push([]);
    for (let g = 0; g <= l; g++) {
        newChunks[r].push(map[r][g] === null ? null : []);
        for (let b = 0; b <= l; b++) {
            newChunks[r][g].push(map[r][g][b] === null ? null : map[r][g][b]);
        }
    }
}

map = newChunks;

const opt = JSON.stringify(map)

fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../src/data/lookupCube.json', opt);
fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../src/data/lookupCube.ts', `export default ${unquoteKeys(opt)};`);