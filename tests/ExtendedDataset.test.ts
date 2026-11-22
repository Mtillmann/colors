import ColorLookup from '../src/ColorLookup';
import NearestColorLookup from '../src/NearestColorLookup';
import ShadeLookup from '../src/ShadeLookup';
import colorMap from '../src/data/colorMap.extended';
import lookupCube from '../src/data/lookupCube.extended';
import binaryLookup from '../src/data/binaryLookup.extended';
import { byteToShadeOffset } from '../src/data/binaryLookupMaps.extended';

// smoke test: the extended dataset files are complete and consistent with each other
describe('extended dataset', () => {
    // "100 Mph" (#C93F38) comes from color-name-list and is not in the native dataset
    const [r, g, b] = [201, 63, 56];

    it('contains the color-name-list colors', () => {
        expect(Object.keys(colorMap).length).toBeGreaterThan(5000);
        expect(colorMap['#C93F38'].source).toBe('color-name-list');
    });

    it('ColorLookup finds an added color', () => {
        const result = new ColorLookup(lookupCube, colorMap).lookupByRGB(r, g, b, 1);
        expect(result.matchedHex).toBe('#C93F38');
        expect(result.colors[0].deltaE).toBe(0);
    });

    it('NearestColorLookup finds an added color', () => {
        const result = new NearestColorLookup(colorMap).lookupByRGB(r, g, b, 1);
        expect(result.colors[0].alias).toContain('100 mph');
    });

    it('ShadeLookup table matches the color map', () => {
        expect(new ShadeLookup(binaryLookup, byteToShadeOffset).shadeByRGB(r, g, b)).toBe('Red');
    });
});
