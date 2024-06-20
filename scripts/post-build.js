import { copyFileSync, writeFileSync } from 'fs';

copyFileSync('src/data/colorMap.json', 'dist/data/colorMap.json');
copyFileSync('src/data/binaryLookup.bin', 'dist/data/binaryLookup.bin');
copyFileSync('src/data/lookupCube.json', 'dist/data/lookupCube.json');
copyFileSync('src/data/binaryLookupMaps.json', 'dist/data/binaryLookupMaps.json');

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