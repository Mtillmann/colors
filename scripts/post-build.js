import { copyFileSync, writeFileSync } from 'fs';

copyFileSync('src/data/colorMap.json', 'dist/data/colorMap.json');
copyFileSync('src/data/binaryLookup.bin', 'dist/data/binaryLookup.bin');
copyFileSync('src/data/lookupCube.json', 'dist/data/lookupCube.json');
copyFileSync('src/data/binaryLookupMaps.json', 'dist/data/binaryLookupMaps.json');
for (const f of ['colorMap.extended.json', 'binaryLookup.extended.bin', 'lookupCube.extended.json', 'binaryLookupMaps.extended.json']) {
  copyFileSync(`src/data/${f}`, `dist/data/${f}`);
}

//make the types generic!
writeFileSync('dist/data/binaryLookup.d.ts', `declare const _default: string;
export { _default as default };`);

writeFileSync('dist/data/colorMap.d.ts', `declare const _default: {
    [key: string]: {
        r: number;
        g: number;
        b: number;
        alias: string[];
        source: string;
        hex: string;
        L: number;
        A: number;
        B: number;
        shade: string[];
        altShade: string;
    };
};

export { _default as default };`);
// extended dataset uses the same generic types
copyFileSync('dist/data/binaryLookup.d.ts', 'dist/data/binaryLookup.extended.d.ts');
copyFileSync('dist/data/colorMap.d.ts', 'dist/data/colorMap.extended.d.ts');
