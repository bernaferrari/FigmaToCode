import { retrieveTopFill } from "./retrieveFill";
import { numberToFixedString } from "./numToAutoFixed";

// ---- Color Format Conversion ----
export const rgbTo6hex = (color: RGB | RGBA): string => {
  const hex =
    ((color.r * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.g * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.b * 255) | (1 << 8)).toString(16).slice(1);

  return hex;
};

export const rgbTo8hex = (color: RGB, alpha: number): string => {
  // when color is RGBA, alpha is set automatically
  // when color is RGB, alpha need to be set manually (default: 1.0)
  const hex =
    ((alpha * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.r * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.g * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.b * 255) | (1 << 8)).toString(16).slice(1);

  return hex;
};

/**
 * Converts RGB values to CSS hex or rgba format
 * @param color The RGB color object
 * @param alpha The opacity value
 * @returns A CSS color string
 */
export const rgbToCssColor = (color: RGB | RGBA, alpha: number = 1): string => {
  // Special cases for common colors
  if (color.r === 1 && color.g === 1 && color.b === 1 && alpha === 1) {
    return "white";
  }

  if (color.r === 0 && color.g === 0 && color.b === 0 && alpha === 1) {
    return "black";
  }

  // Return hex when possible (no transparency)
  if (alpha === 1) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);

    const toHex = (num: number): string => num.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  // Use rgba for transparent colors
  const r = numberToFixedString(color.r * 255);
  const g = numberToFixedString(color.g * 255);
  const b = numberToFixedString(color.b * 255);
  const a = numberToFixedString(alpha);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// ---- Gradient Transformation ----
export const gradientAngle = (fill: GradientPaint): number => {
  // Thanks Gleb and Liam for helping!
  const decomposed = decomposeRelativeTransform(
    fill.gradientTransform[0],
    fill.gradientTransform[1],
  );

  return (decomposed.rotation * 180) / Math.PI;
};

// Calculate gradient angle for CSS (different coordinate system)
export const cssGradientAngle = (angle: number): number => {
  // Normalize angle: if negative, add 360 to make it positive.
  return angle < 0 ? angle + 360 : angle;
};

// Calculate gradient coordinates for a matrix transform
export const getGradientTransformCoordinates = (
  gradientTransform: number[][],
): { centerX: string; centerY: string; radiusX: string; radiusY: string } => {
  const a = gradientTransform[0][0];
  const b = gradientTransform[0][1];
  const c = gradientTransform[1][0];
  const d = gradientTransform[1][1];
  const e = gradientTransform[0][2];
  const f = gradientTransform[1][2];

  const scaleX = Math.sqrt(a ** 2 + b ** 2);
  const scaleY = Math.sqrt(c ** 2 + d ** 2);

  const centerX = ((e * scaleX * 100) / (1 - scaleX)).toFixed(2);
  const centerY = (((1 - f) * scaleY * 100) / (1 - scaleY)).toFixed(2);

  const radiusX = (scaleX * 100).toFixed(2);
  const radiusY = (scaleY * 100).toFixed(2);

  return { centerX, centerY, radiusX, radiusY };
};

// from https://math.stackexchange.com/a/2888105
export const decomposeRelativeTransform = (
  t1: [number, number, number],
  t2: [number, number, number],
): {
  translation: [number, number];
  rotation: number;
  scale: [number, number];
  skew: [number, number];
} => {
  const a: number = t1[0];
  const b: number = t1[1];
  const c: number = t1[2];
  const d: number = t2[0];
  const e: number = t2[1];
  const f: number = t2[2];

  const delta = a * d - b * c;

  const result: {
    translation: [number, number];
    rotation: number;
    scale: [number, number];
    skew: [number, number];
  } = {
    translation: [e, f],
    rotation: 0,
    scale: [0, 0],
    skew: [0, 0],
  };

  // Apply the QR-like decomposition.
  if (a !== 0 || b !== 0) {
    const r = Math.sqrt(a * a + b * b);
    result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
    result.scale = [r, delta / r];
    result.skew = [Math.atan((a * c + b * d) / (r * r)), 0];
  }
  // these are not currently being used.
  // else if (c != 0 || d != 0) {
  //   const s = Math.sqrt(c * c + d * d);
  //   result.rotation =
  //     Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
  //   result.scale = [delta / s, s];
  //   result.skew = [0, Math.atan((a * c + b * d) / (s * s))];
  // } else {
  //   // a = b = c = d = 0
  // }

  return result;
};

// ---- Common color check helpers ----

/**
 * Checks if color is black
 */
export const isBlack = (color: RGB, opacity: number = 1): boolean =>
  color.r === 0 && color.g === 0 && color.b === 0 && opacity === 1;

/**
 * Checks if color is white
 */
export const isWhite = (color: RGB, opacity: number = 1): boolean =>
  color.r === 1 && color.g === 1 && color.b === 1 && opacity === 1;

/**
 * Helper for calculating gradient stops in a consistent way across frameworks
 */
export const processGradientStops = (
  stops: ReadonlyArray<ColorStop>,
  opacity: number = 1,
  colorFormatter: (color: RGB | RGBA, alpha: number) => string,
): string => {
  return stops
    .map((stop) => {
      const color = colorFormatter(stop.color, stop.color.a * opacity);
      const position = `${(stop.position * 100).toFixed(0)}%`;
      return `${color} ${position}`;
    })
    .join(", ");
};
