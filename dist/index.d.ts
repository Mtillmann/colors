import chroma, { Color } from 'chroma-js';

declare class export_default{
    shadeMap: Record<string, string>;
    shade(chromaInstance: Color, includeNativeShade?: boolean): [string, string] | string;
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

declare class ColorLookup {
    colorMap: ColorMap;
    lookupCube: LookupCube;
    chromaCache: Map<string, chroma.Color>;
    lookupCache: Map<string, LookupResult>;
    downsampleFactor: number;
    options: {
        deltaEThreshold: number;
    };
    constructor(lookupCube: LookupCube, colorMap: ColorMap, options?: {});
    private cachedChromaByRGB;
    private getClosest;
    lookup(color: Color, maxResults?: number): any;
    lookupByRGB(r: number, g: number, b: number, maxResults?: number): any;
}

declare class ShadeLookup {
    binaryLookup: string;
    samplingFactor: number;
    edgeLength: number;
    byteToShadeMap: Record<string, string>;
    constructor(binaryLookup: string, byteToShadeMap: Record<string, string>);
    shade(color: Color): string;
    shadeByRGB(r: number, g: number, b: number): string;
    shades(color: Color, searchCubeEdgeLength?: number): Array<[string, number]>;
    shadesByRGB(r: number, g: number, b: number, searchCubeEdgeLength?: number): Array<[string, number]>;
}

export { export_default as AltShadeLookup, ColorLookup, ShadeLookup };
