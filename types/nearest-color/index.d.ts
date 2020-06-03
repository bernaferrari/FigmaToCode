declare module "nearest-color" {
  type RGB = { r: number; g: number; b: number };

  type ColorMatch = {
    name: string;
    value: string;
    rgb: RGB;
    distance: number;
  };

  type ColorSpec = {
    name?: string;
    source: string;
    rgb: RGB;
  };

  export function createColorSpec(input: string | RGB, name: string): ColorSpec;

  // it can actually return a ColorMatch, but let's ignore that for simplicity
  // in this app, it is never going to return ColorMatch because the input is hex instead of red
  export function from(
    availableColors: Array<String> | Object
  ): (attr: string) => string;
}
