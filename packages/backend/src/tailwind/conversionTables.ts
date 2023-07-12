import { sliceNum } from "../common/numToAutoFixed";
import { localTailwindSettings } from "./tailwindMain";

export const nearestValue = (goal: number, array: Array<number>): number => {
  return array.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
};

export const exactValue = (
  goal: number,
  array: Array<number>
): number | null => {
  for (let i = 0; i < array.length; i++) {
    const diff = Math.abs(goal - array[i]);

    if (diff <= 0.05) {
      return array[i];
    }
  }

  return null;
};

/**
 * convert pixel values to Tailwind attributes.
 * by default, Tailwind uses rem, while Figma uses px.
 * Therefore, a conversion is necessary. Rem = Pixel / 16.abs
 * Then, find in the corresponding table the closest value.
 */
const pxToRemToTailwind = (
  value: number,
  conversionMap: Record<number, string>
): string => {
  const keys = Object.keys(conversionMap).map((d) => +d);
  const convertedValue = exactValue(value / 16, keys);

  if (convertedValue) {
    return conversionMap[convertedValue];
  } else if (localTailwindSettings.roundTailwind) {
    return conversionMap[nearestValue(value / 16, keys)];
  }

  return `[${sliceNum(value)}px]`;
};

const pxToTailwind = (
  value: number,
  conversionMap: Record<number, string>
): string | null => {
  const keys = Object.keys(conversionMap).map((d) => +d);
  const convertedValue = exactValue(value, keys);

  if (convertedValue) {
    return conversionMap[convertedValue];
  } else if (localTailwindSettings.roundTailwind) {
    return conversionMap[nearestValue(value, keys)];
  }

  return `[${sliceNum(value)}px]`;
};

const mapFontSize: Record<number, string> = {
  0.75: "xs",
  0.875: "sm",
  1: "base",
  1.125: "lg",
  1.25: "xl",
  1.5: "2xl",
  1.875: "3xl",
  2.25: "4xl",
  3: "5xl",
  3.75: "6xl",
  4.5: "7xl",
  6: "8xl",
  8: "9xl",
};

const mapBorderRadius: Record<number, string> = {
  // 0: "none",
  0.125: "sm",
  0.25: "",
  0.375: "md",
  0.5: "lg",
  0.75: "xl",
  1.0: "2xl",
  1.5: "3xl",
  10: "full",
};

// This uses pixels.
const mapBlur: Record<number, string> = {
  0: "none",
  4: "sm",
  8: "",
  12: "md",
  16: "lg",
  24: "xl",
  40: "2xl",
  64: "3xl",
};

const mapWidthHeightSize: Record<number, string> = {
  // '0: 0',
  1: "px",
  2: "0.5",
  4: "1",
  6: "1.5",
  8: "2",
  10: "2.5",
  12: "3",
  14: "3.5",
  16: "4",
  20: "5",
  24: "6",
  28: "7",
  32: "8",
  36: "9",
  40: "10",
  44: "11",
  48: "12",
  56: "14",
  64: "16",
  80: "20",
  96: "24",
  112: "28",
  128: "32",
  144: "36",
  160: "40",
  176: "44",
  192: "48",
  208: "52",
  224: "56",
  240: "60",
  256: "64",
  288: "72",
  320: "80",
  384: "96",
};

export const opacityValues = [
  0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95,
];

export const nearestOpacity = (nodeOpacity: number): number =>
  nearestValue(nodeOpacity * 100, opacityValues);

const mapLetterSpacing: Record<number, string> = {
  "-0.05": "tighter",
  "-0.025": "tight",
  // 0: "normal",
  0.025: "wide",
  0.05: "wider",
  0.1: "widest",
};

export const pxToLetterSpacing = (value: number): string =>
  pxToRemToTailwind(value, mapLetterSpacing);

const mapLineHeight: Record<number, string> = {
  0.75: "3",
  1: "none",
  1.25: "tight",
  1.375: "snug",
  1.5: "normal",
  1.625: "relaxed",
  2: "loose",
  1.75: "7",
  2.25: "9",
  2.5: "10",
};

export const pxToLineHeight = (value: number): string =>
  pxToRemToTailwind(value, mapLineHeight);

export const pxToFontSize = (value: number): string =>
  pxToRemToTailwind(value, mapFontSize);

export const pxToBorderRadius = (value: number): string =>
  pxToRemToTailwind(value, mapBorderRadius);

export const pxToBlur = (value: number): string | null =>
  pxToTailwind(value, mapBlur);

export const pxToLayoutSize = (value: number): string => {
  const tailwindValue = pxToTailwind(value, mapWidthHeightSize);
  if (tailwindValue) {
    return tailwindValue;
  }

  return `[${sliceNum(value)}px]`;
};
