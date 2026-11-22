/** anything with an rgb() method, e.g. a chroma-js Color */
interface RgbLike {
    rgb: () => number[];
}
declare function rgbToLab(r: number, g: number, b: number): [number, number, number];
/** CIEDE2000 (Kl = Kc = Kh = 1), same formulation as chroma.deltaE */
declare function deltaE2000(L1: number, a1: number, b1: number, L2: number, a2: number, b2: number): number;
/** same as chroma(r, g, b).hsl(): h in degrees (NaN for greys), s and l in 0..1 */
declare function rgbToHsl(r: number, g: number, b: number): [number, number, number];

declare class export_default{
    shadeMap: Record<string, string>;
    /** accepts anything with an rgb() method; uses hsl() directly when available (e.g. a chroma-js Color) */
    shade(color: RgbLike & {
        hsl?: () => number[];
    }, includeNativeShade?: boolean): [string, string] | string;
    shadeByRGB(r: number, g: number, b: number, includeNativeShade?: boolean): [string, string] | string;
    shadeByHSL(h: number, s: number, l: number, includeNativeShade?: boolean): [string, string] | string;
    private find;
}

interface SimpleColor {
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
    altShade?: string;
    deltaE?: number;
    givenColor?: number[];
    euclideanDistance?: number;
    isFallback?: boolean;
}

type ColorMap = Record<string, SimpleColor>;

type LookupCube = (string[] | null)[][][];

interface LookupResult {
    matchedHex: string;
    givenColor: number[];
    colors: SimpleColor[];
    shades: Array<[string, number]>;
    altShades: Array<[string, number]>;
}

/**
 * Grid-accelerated named color lookup.
 * The RGB cube is split into cells (lookupCube); a lookup collects the candidates of the
 * 3x3x3 cells around the given color (widening ring by ring while no candidate is found)
 * and ranks all of them by CIEDE2000.
 */
declare class ColorLookup {
    colorMap: ColorMap;
    lookupCube: LookupCube;
    lookupCache: Map<string, LookupResult>;
    downsampleFactor: number;
    options: {
        deltaEThreshold: number;
    };
    constructor(lookupCube: LookupCube, colorMap: ColorMap, options?: {});
    /** accepts anything with an rgb() method, e.g. a chroma-js Color */
    lookup(color: RgbLike, maxResults?: number): any;
    /** hex keys of all colors in the cells within `radius` of cell (R, G, B) */
    private candidates;
    lookupByRGB(r: number, g: number, b: number, maxResults?: number): any;
}

declare class ShadeLookup {
    binaryLookup: string;
    samplingFactor: number;
    edgeLength: number;
    byteToShadeMap: Record<string, string>;
    constructor(binaryLookup: string, byteToShadeMap: Record<string, string>);
    shade(color: RgbLike): string;
    shadeByRGB(r: number, g: number, b: number): string;
    shades(color: RgbLike, searchCubeEdgeLength?: number): Array<[string, number]>;
    shadesByRGB(r: number, g: number, b: number, searchCubeEdgeLength?: number): Array<[string, number]>;
}

/**
 * Exact nearest named color lookup without dependencies.
 * Compares the given color against every entry of the color map (brute force),
 * so the result is always the true closest match by CIEDE2000.
 */
declare class NearestColorLookup {
    colors: SimpleColor[];
    private readonly L;
    private readonly A;
    private readonly B;
    options: {
        deltaEThreshold: number;
    };
    constructor(colorMap: ColorMap, options?: {});
    /** accepts anything with an rgb() method, e.g. a chroma-js Color */
    lookup(color: RgbLike, maxResults?: number): LookupResult;
    lookupByRGB(r: number, g: number, b: number, maxResults?: number): LookupResult;
    /** shade of the exact nearest named color */
    shadeByRGB(r: number, g: number, b: number): string;
    static hex(r: number, g: number, b: number): string;
}

export { export_default as AltShadeLookup, ColorLookup, NearestColorLookup, ShadeLookup, deltaE2000, rgbToHsl, rgbToLab };
