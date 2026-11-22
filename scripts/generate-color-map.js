console.log('ALWAYS BUILD FIRST!');

import cssgradient_io_shades from '../sources/cssgradient-io-shades.json' assert { type: 'json' };
import wikipedia_colors_with_aliases from '../sources/wikipedia-colors-with-aliases.json' assert { type: 'json' };
import wikipedia_shades from '../sources/wikipedia-shades.json' assert { type: 'json' };
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { AltShadeLookup, rgbToLab, deltaE2000 } from "../dist/index.js";
import { unquoteKeys }from './util.js';
import { inferShades } from './shade-inference.js';
import { datasetSuffix, isExtended } from './dataset.js';
import chroma from "chroma-js";

const hexToLab = hex => {
    const n = parseInt(hex.slice(1), 16);
    return rgbToLab(n >> 16, (n >> 8) & 255, n & 255);
};


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

// extended dataset: add the "best of" names from color-name-list (meodai/color-names, MIT).
// Names that already exist are skipped, names for practically identical colors (deltaE < 1)
// become aliases of the existing color, everything else is added as a new color.
if (isExtended) {
    const bestof = JSON.parse(fs.readFileSync(new URL('../sources/color-name-list-bestof.json', import.meta.url)));
    const knownNames = new Set(Object.values(output).flatMap(c => c.alias.map(a => a.toLowerCase())));
    const native = Object.keys(output).map(hex => ({ hex, lab: hexToLab(hex) }));
    let added = 0, aliased = 0, skipped = 0;
    for (const entry of bestof) {
        const name = entry.alias[0];
        if (knownNames.has(name.toLowerCase())) { skipped++; continue; }
        const lab = hexToLab(entry.hex);
        let closest = null, closestDE = Infinity;
        for (const c of native) {
            const d = deltaE2000(lab[0], lab[1], lab[2], c.lab[0], c.lab[1], c.lab[2]);
            if (d < closestDE) { closestDE = d; closest = c.hex; }
        }
        if (closestDE < 1) {
            output[closest].alias.push(name);
            aliased++;
        } else if (entry.hex in output) {
            output[entry.hex].alias.push(name);
            aliased++;
        } else {
            output[entry.hex] = { alias: [name], source: 'color-name-list' };
            added++;
        }
        knownNames.add(name.toLowerCase());
    }
    console.log(`color-name-list: ${added} added, ${aliased} as aliases, ${skipped} skipped (name exists)`);
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


// infer the base shade (e.g. "Blue") of colors without a human shade label from the
// closest labelled colors. This must run BEFORE the light/dark step below, otherwise
// inferred colors would copy their neighbour's "Light"/"Dark" prefix instead of
// getting one from their own lightness.
// the 5 closest human-labelled colors and the xkcd survey vote; a close runner-up becomes a second shade
// xkcd color survey votes (sources/xkcd-survey-shades.json) are blended in 50/50
const survey = JSON.parse(fs.readFileSync(new URL('../sources/xkcd-survey-shades.json', import.meta.url)));
const labelled = Object.keys(output)
    .filter(hex => 'shade' in output[hex])
    .map(hex => ({ lab: hexToLab(hex), shades: output[hex].shade }));

for (const hex in output) {
    if (!('shade' in output[hex])) {
        const n = parseInt(hex.slice(1), 16);
        const rgb = [n >> 16, (n >> 8) & 255, n & 255];
        output[hex].shade = inferShades(hexToLab(hex), labelled, { secondRatio: 0.7, survey, rgb, surveyWeight: 0.5 }).shades;
        output[hex].inferredShade = true;
    }
}

const shadeBrightness = {},
    systemToUse = 'hsl',
    systemBrightnessIndex = 2,
    lightDarkThreshold = .275;

for (const hex in output) {
    const color = output[hex];
    // light/dark ranges come from human-labelled colors only
    if (!('shade' in color) || color.inferredShade) {
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
    delete output[hex].inferredShade;
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

const asl = new AltShadeLookup();

for (const hex in output) {
    if (!('shade' in output[hex])) {
        console.log(output[hex])
    }

    output[hex].altShade = asl.shade(chroma(hex));
    
}



const opt = JSON.stringify(output);



fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + `/../src/data/colorMap${datasetSuffix}.json`, opt);
fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + `/../src/data/colorMap${datasetSuffix}.ts`, `export default ${unquoteKeys(opt)}`);