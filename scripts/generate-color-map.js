console.log('ALWAYS BUILD FIRST!');

import cssgradient_io_shades from '../sources/cssgradient-io-shades.json' assert { type: 'json' };
import wikipedia_colors_with_aliases from '../sources/wikipedia-colors-with-aliases.json' assert { type: 'json' };
import wikipedia_shades from '../sources/wikipedia-shades.json' assert { type: 'json' };
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { AltShadeLookup } from "../dist/index.js";
import { unquoteKeys }from './util.js';
import chroma from "chroma-js";


let output = wikipedia_colors_with_aliases;

for (const hex in output) {
    output[hex].source = 'wikipedia';
}

//merge in shades

for (let shade of wikipedia_shades) {
    let hex = shade.hex.toUpperCase();
    if (hex in output) {
        output[hex].alias = output[hex].alias.concat(...shade.alias)
        if (!('shade' in output[hex])) {
            output[hex].shade = shade.shade;
        } else {
            output[hex].shade = output[hex].shade.concat(...shade.shade)
        }
    } else {
        output[hex] = {
            alias: shade.alias,
            shade: shade.shade
        };
    }
    output[hex].source = 'wikipedia';
}

for (let shade of cssgradient_io_shades) {
    let hex = shade.hex.toUpperCase();
    if (hex in output) {
        output[hex].alias = output[hex].alias.concat(...shade.alias)
        if (!('shade' in output[hex])) {
            output[hex].shade = shade.shade;
        } else {
            output[hex].shade = output[hex].shade.concat(...shade.shade)
        }
    } else {
        output[hex] = {
            alias: shade.alias,
            shade: shade.shade
        };
    }
    output[hex].source = 'cssgradient';
}

//patch rgb vvalues
for (const hex in output) {
    output[hex].hex = hex;

    delete output[hex].h;
    delete output[hex].s;
    delete output[hex].v;
    delete output[hex].l;

    if (!('r' in output[hex]) || !('A' in output[hex])) {
        const _chroma = chroma(hex),
            rgb = _chroma.rgb(),
            lab = _chroma.lab();
        output[hex].r = rgb[0];
        output[hex].g = rgb[1];
        output[hex].b = rgb[2];
        output[hex].L = lab[0];
        output[hex].A = lab[1];
        output[hex].B = lab[2];
    }
}


const shadeBrightness = {},
    systemToUse = 'hsl',
    systemBrightnessIndex = 2,
    lightDarkThreshold = .275;

for (const hex in output) {
    const color = output[hex];
    if (!('shade' in color)) {
        continue;
    }

    const c = chroma(hex),
        l = c[systemToUse]()[systemBrightnessIndex];
    color.shade.forEach(shade => {
        if (['White', 'Black'].indexOf(shade) > -1) {
            return;
        }

        if (!(shade in shadeBrightness)) {
            shadeBrightness[shade] = {
                upper: -Infinity,
                lower: Infinity,
                values: []
            }
        }

        shadeBrightness[shade].upper = Math.max(l, shadeBrightness[shade].upper);
        shadeBrightness[shade].lower = Math.min(l, shadeBrightness[shade].lower);

        shadeBrightness[shade].values.push(l);
    })
}

for (const shade in shadeBrightness) {
    const info = shadeBrightness[shade],
        range = (info.upper - info.lower) * lightDarkThreshold;
    shadeBrightness[shade].darkThreshold = info.lower + range;
    shadeBrightness[shade].lightThreshold = info.upper - range;
}

for (let hex in output) {
    const color = output[hex];
    if (!('shade' in color)) {
        continue;
    }

    const c = chroma(hex),
        l = c[systemToUse]()[systemBrightnessIndex],
        newShades = [];

    color.shade.forEach(shade => {
        if (shade in shadeBrightness) {
            if (l > shadeBrightness[shade].lightThreshold) {
                newShades.push('Light ' + shade);
            } else if (l < shadeBrightness[shade].darkThreshold) {
                newShades.push('Dark ' + shade);
            } else {
                newShades.push(shade);
            }
        } else {
            newShades.push(shade);
        }
    });

    output[hex].shade = newShades;
}


//remove duplicate alias and shades
for (const hex in output) {
    for (let i = 0; i < output[hex].alias.length; i++) {
        output[hex].alias[i] = output[hex].alias[i].trim().replace(/ ([A-Z])/g, m => m.toLowerCase());
    }

    if (output[hex].alias.length > 1) {
        const oldLength = output[hex].alias.length;
        output[hex].alias = [...new Set(output[hex].alias)];
        if (oldLength !== output[hex].alias.length && output[hex].alias.length > 1) {
            //console.log({oldLength, newLength : output[hex].alias.length, aliases : output[hex].alias});
        }
    }

    if ('shade' in output[hex] && output[hex].shade.length > 1) {
        const oldLength = output[hex].shade.length;
        output[hex].shade = [...new Set(output[hex].shade)];
        if (oldLength !== output[hex].shade.length) {
            //console.log({oldLength, newLength : output[hex].shade.length, shadees : output[hex].shade});
        }
    }
}

const deltaEThreshold = 50;

for (const hex in output) {
    if (!('shade' in output[hex])) {
        for (const hex2 in output) {
            if (!('shade' in output[hex2])) {
                continue;
            }
            const deltaE = chroma.deltaE(hex, hex2);
            if (deltaE > deltaEThreshold) {
                continue;
            }

            if (!('deltaes' in output[hex])) {
                output[hex].deltaes = {};
            }


            const shade = output[hex2].shade[0];
            if (shade in output[hex].deltaes) {
                output[hex].deltaes[shade] = Math.min(output[hex].deltaes[shade], deltaE);
            } else {
                output[hex].deltaes[shade] = deltaE;
            }
        }
    }
}

for (const hex in output) {
    if (!('shade' in output[hex])) {

        let shades = Object.entries(output[hex].deltaes);
        shades.sort((a, b) => a[1] - b[1])

        output[hex].shade = [shades[0][0]];
        delete output[hex].deltaes;

    }
}

const asl = new AltShadeLookup();

for (const hex in output) {
    if (!('shade' in output[hex])) {
        console.log(output[hex])
    }

    output[hex].altShade = asl.shade(chroma(hex));
    
}



const opt = JSON.stringify(output);



fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../src/data/colorMap.json', opt);
fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../src/data/colorMap.ts', `export default ${unquoteKeys(opt)}`);