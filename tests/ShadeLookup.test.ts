import ShadeLookup from '../src/ShadeLookup';
import chroma from 'chroma-js';
import binaryLookup from '../src/data/binaryLookup';
import { byteToShadeOffset } from '../src/data/binaryLookupMaps'

describe('ShadeLookup', () => {
    const shadeLookup: ShadeLookup = new ShadeLookup(binaryLookup, byteToShadeOffset);

    
    it('should return the correct single shade for a given value', () => {
        expect(shadeLookup.shade(chroma('#ff0000'))).toBe('Red');
        expect(shadeLookup.shade(chroma('#4a9a1a'))).toBe('Dark Green');
    });

    it('should return the correct single shade in a list of shades for a given value', () => {
        expect(shadeLookup.shades(chroma('#ff0000'))[0][0]).toBe('Red');
        expect(shadeLookup.shades(chroma('#4a9a1a'))[0][0]).toBe('Dark Green');
    });

    it('should return the correct single shade for a given value by RGB', () => {
        expect(shadeLookup.shadeByRGB(255, 0 ,0)).toBe('Red');
        expect(shadeLookup.shadeByRGB(74, 154, 26)).toBe('Dark Green');
    });

    it('should return the correct single shade in a list of shades for a given value by RGB', () => {
        expect(shadeLookup.shadesByRGB(255, 0 ,0)[0][0]).toBe('Red');
        expect(shadeLookup.shadesByRGB(74, 154, 26)[0][0]).toBe('Dark Green');
    });

    [1, 3, 5, 7, 9, 21, 37].forEach((searchCubeEdgeLength) => {
        it(`yields the correct amount of shades for a given search cube edge length (${searchCubeEdgeLength})`, () => {
            const sum = shadeLookup.shades(chroma('#888888'), searchCubeEdgeLength).reduce((acc: number, item) => {
                acc += (item[1] as number)
                return acc;
            }, 0);
            expect(sum).toBe(Math.pow(searchCubeEdgeLength, 3));
        });
    });

    it('should throw an error if the search cube edge length is even', () => {
        expect(() => {
            shadeLookup.shades(chroma('#888888'), 2);
        }).toThrow(Error);
    });

    it('should throw an error if the search cube edge length is less than 1', () => {
        expect(() => {
            shadeLookup.shades(chroma('#888888'), 0);
        }).toThrow(Error);
    });


    it('should return a result, even if the search cube length exceeds the bounds of the color space', () => {
        const sum = shadeLookup.shades(chroma('#888888'), 99).reduce((acc: number, item) => {
            acc += (item[1] as number)
            return acc;
        }, 0);
        expect(sum).toBe(64 ** 3);
    });
    

});