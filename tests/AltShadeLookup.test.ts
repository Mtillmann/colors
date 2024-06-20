import chroma from 'chroma-js';
import AltColorLookup from '../src/AltShadeLookup';

describe('AltColorLookup', () => {
  let altColorLookup: AltColorLookup = new AltColorLookup();

  it('should return the correct shade for a given chroma instance', () => {
    const mockChromaInstance = chroma(123, 45, 67);
    const result = altColorLookup.shade(mockChromaInstance, true);
    expect(result).toEqual(['Dark Brown', 'Dark Brown']);
  });

  it('should return "White" for a chroma instance with lightness greater than 0.975', () => {
    const mockChromaInstance = chroma(255, 255, 255);

    const result = altColorLookup.shade(mockChromaInstance, true);

    expect(result).toEqual(['White', 'White']);
  });

  it('should return "Black" for a chroma instance with lightness less than 0.025', () => {
    const mockChromaInstance = chroma(0, 0, 0);

    const result = altColorLookup.shade(mockChromaInstance, true);

    expect(result).toEqual(['Black', 'Black']);
  });

  it('should return the correct shade for a chroma instance with a non-black and non-white native shade', () => {
    const mockChromaInstance = chroma(100, 50, 75);
    const result = altColorLookup.shade(mockChromaInstance, true);
    expect(result).toEqual(['Dark Purple Red', 'Dark Magenta']);
  });

  it('should accept a raw hsl object and return the correct shades', () => {
    const mockHsl: [number, number, number] = [222, 0.5, 0.5];
    const result = altColorLookup.shadeByHSL(...mockHsl, true);
    expect(result).toEqual(['Blue', 'Blue']);
  });

  it('should normalize a HSL objects s and l values', () => {
    const mockHsl: [number, number, number] = [222, 50, 50];
    const result = altColorLookup.shadeByHSL(...mockHsl, true);
    expect(result).toEqual(['Blue', 'Blue']);
  });

  it('should return the correct shade for a given RGB value', () => {
    const result = altColorLookup.shadeByRGB(255,172,89, true);
    expect(result).toEqual(['Light Yellowish Brown', 'Yellow']);
  });

  it('should return the correct shade for a given RGB value', () => {
    const result = altColorLookup.shadeByRGB(201,26,140, true);
    expect(result).toEqual(['Purple Red', 'Pink']);
  });

});