import { sliceNum } from "../common/numToAutoFixed";

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
const pixelToTailwindValue = (
  value: number,
  conversionMap: Record<number, string>
) => {
  return conversionMap[
    nearestValue(
      value / 16,
      Object.keys(conversionMap).map((d) => +d)
    )
  ];
};

const mapLetterSpacing: Record<number, string> = {
  "-0.05": "tighter",
  "-0.025": "tight",
  // 0: "normal",
  0.025: "wide",
  0.05: "wider",
  0.1: "widest",
};

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
  0.125: "-sm",
  0.25: "",
  0.375: "-md",
  0.5: "-lg",
  0.75: "-xl",
  1.0: "-2xl",
  1.5: "-3xl",
  10: "-full",
};

const mapWidthHeightSize: Record<number, string> = {
  // 0: "0",
  0.5: "2",
  1: "4",
  1.5: "6",
  2: "8",
  2.5: "10",
  3: "12",
  3.5: "14",
  4: "16",
  5: "20",
  6: "24",
  7: "28",
  8: "32",
  9: "36",
  10: "40",
  11: "44",
  12: "48",
  14: "56",
  16: "64",
  20: "80",
  24: "96",
  28: "112",
  32: "128",
  36: "144",
  40: "160",
  44: "176",
  48: "192",
  52: "208",
  56: "224",
  60: "240",
  64: "256",
  72: "288",
  80: "320",
  96: "384",
};

export const opacityValues = [
  0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95,
];

export const nearestOpacity = (nodeOpacity: number): number =>
  nearestValue(nodeOpacity * 100, opacityValues);

export const pxToLetterSpacing = (value: number): string =>
  pixelToTailwindValue(value, mapLetterSpacing);

export const pxToLineHeight = (value: number): string =>
  pixelToTailwindValue(value, mapLineHeight);

export const pxToFontSize = (value: number): string =>
  pixelToTailwindValue(value, mapFontSize);

export const pxToBorderRadius = (value: number): string =>
  pixelToTailwindValue(value, mapBorderRadius);

export const pxToLayoutSize = (value: number): string => {
  if (value > 384) {
    return `[${sliceNum(value)}px]`;
  }
  return pixelToTailwindValue(value, mapWidthHeightSize);
};
