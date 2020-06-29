// https://github.com/dtao/nearest-color converted to ESM and Typescript
// It was sligtly modified to support Typescript better.
// It was also slighly simplified because many parts weren't being used.
/**
 * Defines an available color.
 *
 * @typedef {Object} ColorSpec
 * @property {string=} name A name for the color, e.g., 'red'
 * @property {string} source The hex-based color string, e.g., '#FF0'
 * @property {RGB} rgb The {@link RGB} color values
 */

/**
 * Describes a matched color.
 *
 * @typedef {Object} ColorMatch
 * @property {string} name The name of the matched color, e.g., 'red'
 * @property {string} value The hex-based color string, e.g., '#FF0'
 * @property {RGB} rgb The {@link RGB} color values.
 */

/**
 * Provides the RGB breakdown of a color.
 *
 * @typedef {Object} RGB
 * @property {number} r The red component, from 0 to 255
 * @property {number} g The green component, from 0 to 255
 * @property {number} b The blue component, from 0 to 255
 */

/**
 * Gets the nearest color, from the given list of {@link ColorSpec} objects
 * (which defaults to {@link nearestColor.DEFAULT_COLORS}).
 *
 * Probably you wouldn't call this method directly. Instead you'd get a custom
 * color matcher by calling {@link nearestColor.from}.
 *
 * @public
 * @param {RGB|string} needle Either an {@link RGB} color or a hex-based
 *     string representing one, e.g., '#FF0'
 * @param {Array.<ColorSpec>=} colors An optional list of available colors
 *     (defaults to {@link nearestColor.DEFAULT_COLORS})
 * @return {ColorMatch|string} If the colors in the provided list had names,
 *     then a {@link ColorMatch} object with the name and (hex) value of the
 *     nearest color from the list. Otherwise, simply the hex value.
 *
 * @example
 * nearestColor({ r: 200, g: 50, b: 50 }); // => '#f00'
 * nearestColor('#f11');                   // => '#f00'
 * nearestColor('#f88');                   // => '#f80'
 * nearestColor('#ffe');                   // => '#ff0'
 * nearestColor('#efe');                   // => '#ff0'
 * nearestColor('#abc');                   // => '#808'
 * nearestColor('red');                    // => '#f00'
 * nearestColor('foo');                    // => throws
 */
function nearestColor(needle: RGB | string, colors: Array<ColorSpec>): string {
  needle = parseColor(needle);

  var distanceSq,
    minDistanceSq = Infinity,
    rgb,
    value;

  for (var i = 0; i < colors.length; ++i) {
    rgb = colors[i].rgb;

    distanceSq =
      Math.pow(needle.r - rgb.r, 2) +
      Math.pow(needle.g - rgb.g, 2) +
      Math.pow(needle.b - rgb.b, 2);

    if (distanceSq < minDistanceSq) {
      minDistanceSq = distanceSq;
      value = colors[i];
    }
  }

  if (value) {
    return value.source;
  }
  return "";
}

/**
 * Given either an array or object of colors, returns an array of
 * {@link ColorSpec} objects (with {@link RGB} values).
 *
 * @private
 * @param {Array.<string>|Object} colors An array of hex-based color strings, or
 *     an object mapping color *names* to hex values.
 * @return {Array.<ColorSpec>} An array of {@link ColorSpec} objects
 *     representing the same colors passed in.
 */
function mapColors(colors: Array<string>): Array<ColorSpec> {
  return colors.map((color) => createColorSpec(color));
}

/**
 * Provides a matcher to find the nearest color based on the provided list of
 * available colors.
 *
 * @public
 * @param {Array.<string>|Object} availableColors An array of hex-based color
 *     strings, or an object mapping color *names* to hex values.
 * @return {function(string):ColorMatch|string} A function with the same
 *     behavior as {@link nearestColor}, but with the list of colors
 *     predefined.
 *
 * @example
 * var colors = {
 *   'maroon': '#800',
 *   'light yellow': { r: 255, g: 255, b: 51 },
 *   'pale blue': '#def',
 *   'white': 'fff'
 * };
 *
 * var bgColors = [
 *   '#eee',
 *   '#444'
 * ];
 *
 * var invalidColors = {
 *   'invalid': 'foo'
 * };
 *
 * var getColor = nearestColor.from(colors);
 * var getBGColor = getColor.from(bgColors);
 * var getAnyColor = nearestColor.from(colors).or(bgColors);
 *
 * getColor('ffe');
 * // => { name: 'white', value: 'fff', rgb: { r: 255, g: 255, b: 255 }, distance: 17}
 *
 * getColor('#f00');
 * // => { name: 'maroon', value: '#800', rgb: { r: 136, g: 0, b: 0 }, distance: 119}
 *
 * getColor('#ff0');
 * // => { name: 'light yellow', value: '#ffff33', rgb: { r: 255, g: 255, b: 51 }, distance: 51}
 *
 * getBGColor('#fff'); // => '#eee'
 * getBGColor('#000'); // => '#444'
 *
 * getAnyColor('#f00');
 * // => { name: 'maroon', value: '#800', rgb: { r: 136, g: 0, b: 0 }, distance: 119}
 *
 * getAnyColor('#888'); // => '#444'
 *
 * nearestColor.from(invalidColors); // => throws
 */
export const nearestColorFrom = (
  availableColors: Array<string>
): ((hex: string) => string) => {
  const colors = mapColors(availableColors);
  return (hex: string) => nearestColor(hex, colors);
};

type ColorObject = {
  name: string;
  hex: string;
};

/**
 * Parses a color from a string.
 *
 * @private
 * @param {RGB|string} source
 * @return {RGB}
 *
 * @example
 * parseColor({ r: 3, g: 22, b: 111 }); // => { r: 3, g: 22, b: 111 }
 * parseColor('#f00');                  // => { r: 255, g: 0, b: 0 }
 * parseColor('#04fbc8');               // => { r: 4, g: 251, b: 200 }
 * parseColor('#FF0');                  // => { r: 255, g: 255, b: 0 }
 * parseColor('rgb(3, 10, 100)');       // => { r: 3, g: 10, b: 100 }
 * parseColor('rgb(50%, 0%, 50%)');     // => { r: 128, g: 0, b: 128 }
 * parseColor('aqua');                  // => { r: 0, g: 255, b: 255 }
 * parseColor('fff');                   // => { r: 255, g: 255, b: 255 }
 * parseColor('foo');                   // => throws
 */
function parseColor(source: RGB | string): RGB {
  var red, green, blue;

  if (typeof source === "object") {
    return source;
  }

  let hexMatchArr = source.match(/^#?((?:[0-9a-f]{3}){1,2})$/i);
  if (hexMatchArr) {
    let hexMatch = hexMatchArr[1];

    if (hexMatch.length === 3) {
      hexMatchArr = [
        hexMatch.charAt(0) + hexMatch.charAt(0),
        hexMatch.charAt(1) + hexMatch.charAt(1),
        hexMatch.charAt(2) + hexMatch.charAt(2),
      ];
    } else {
      hexMatchArr = [
        hexMatch.substring(0, 2),
        hexMatch.substring(2, 4),
        hexMatch.substring(4, 6),
      ];
    }

    red = parseInt(hexMatchArr[0], 16);
    green = parseInt(hexMatchArr[1], 16);
    blue = parseInt(hexMatchArr[2], 16);

    return { r: red, g: green, b: blue };
  }

  throw Error('"' + source + '" is not a valid color');
}

type RGB = {
  r: number;
  g: number;
  b: number;
};

type ColorMatch = {
  name: string;
  value: string;
  rgb: RGB;
  distance: number;
};

type ColorSpec = {
  source: string;
  rgb: RGB;
};

//   export function createColorSpec(input: string | RGB, name: string): ColorSpec;

//   // it can actually return a ColorMatch, but let's ignore that for simplicity
//   // in this app, it is never going to return ColorMatch because the input is hex instead of red
//   export function from(
//     availableColors: Array<String> | Object
//   ): (attr: string) => string;

/**
 * Creates a {@link ColorSpec} from either a string or an {@link RGB}.
 *
 * @private
 * @param {string|RGB} input
 * @param {string=} name
 * @return {ColorSpec}
 *
 * @example
 * createColorSpec('#800'); // => {
 *   source: '#800',
 *   rgb: { r: 136, g: 0, b: 0 }
 * }
 *
 * createColorSpec('#800', 'maroon'); // => {
 *   name: 'maroon',
 *   source: '#800',
 *   rgb: { r: 136, g: 0, b: 0 }
 * }
 */
function createColorSpec(input: string): ColorSpec {
  return {
    source: input,
    rgb: parseColor(input),
  };
}
