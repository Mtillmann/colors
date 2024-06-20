import ColorLookup from '../src/ColorLookup';
import lookupCube from '../src/data/lookupCube';
import colorMap from '../src/data/colorMap';
import chroma from 'chroma-js';

describe('ColorLookup', () => {
    const colorLookup: ColorLookup = new ColorLookup(lookupCube, colorMap);

    const colorsAndShades: [number[], string, string][] = [
        [[0,124,201], 'Blue', 'Dark Blue'],
        [[201,26,140], 'Pink', 'Purple Red'],
        [[255,172,89], 'Brown', 'Light Red-Orange'],
        [[5,255,122], 'Cyan', 'Spring Green'],
        [[255,155,255], 'Light Magenta', 'Magenta'],
    ];

    colorsAndShades.forEach(([rgb, nativeShade, altShade]) => {
        it(`should return the correct native shade for given RGB value ${rgb}`, () => {
            const result = colorLookup.lookupByRGB(...rgb as [number, number, number]);
            expect(result.shades[0][0]).toEqual(nativeShade);
        });

        it(`should return the correct native shade for given RGB value ${rgb}`, () => {
            const result = colorLookup.lookup(chroma(...rgb as [number, number, number]));
            expect(result.shades[0][0]).toEqual(nativeShade);
        });

        it(`should return the correct altShade shade for given RGB value ${rgb}`, () => {
            const result = colorLookup.lookupByRGB(...rgb as [number, number, number]);
            expect(result.altShades[0][0]).toEqual(altShade);
        });

    });
    

});