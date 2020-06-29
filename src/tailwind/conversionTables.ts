export const nearestValue = (goal: number, array: Array<number>) => {
  return array.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
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

const mapAbsoluteLineHeight: Record<number, string> = {
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
  4: "6xl",
};

const mapBorderRadius: Record<number, string> = {
  // 0: "none",
  0.125: "-sm",
  0.25: "",
  0.375: "-md",
  0.5: "-lg",
  10: "-full",
};

const mapWidthHeightSize: Record<number, string> = {
  // 0: "0",
  0.25: "1",
  0.5: "2",
  0.75: "3",
  1: "4",
  1.25: "5",
  1.5: "6",
  2: "8",
  2.5: "10",
  3: "12",
  4: "16",
  5: "20",
  6: "24",
  8: "32",
  10: "40",
  12: "48",
  14: "56",
  16: "64",
};

export const pxToMapLetterSpacing = (value: number) =>
  pixelToTailwindValue(value, mapLetterSpacing);

// visually, percent / 100 => rem works nicely
export const percentToAbsoluteLineHeight = (value: number) =>
  mapAbsoluteLineHeight[
    nearestValue(
      value / 100,
      Object.keys(mapAbsoluteLineHeight).map((d) => +d)
    )
  ];

export const pxToAbsoluteLineHeight = (value: number): string =>
  pixelToTailwindValue(value, mapAbsoluteLineHeight);

export const pxToFontSize = (value: number): string =>
  pixelToTailwindValue(value, mapFontSize);

export const pxToBorderRadius = (value: number): string =>
  pixelToTailwindValue(value, mapBorderRadius);

export const pxToLayoutSize = (value: number): string =>
  pixelToTailwindValue(value, mapWidthHeightSize);
