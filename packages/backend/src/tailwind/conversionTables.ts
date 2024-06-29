import { nearestColorFrom } from "../nearest-color/nearestColor";
import { sliceNum } from "../common/numToAutoFixed";
import { localTailwindSettings } from "./tailwindMain";
import { config } from "./tailwindConfig";

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

export const pxToLetterSpacing = (value: number): string =>
  pxToRemToTailwind(value, config.letterSpacing);

export const pxToLineHeight = (value: number): string =>
  pxToRemToTailwind(value, config.lineHeight);

export const pxToFontSize = (value: number): string =>
  pxToRemToTailwind(value, config.fontSize);

export const pxToBorderRadius = (value: number): string =>
  pxToRemToTailwind(value, config.borderRadius);

export const pxToBlur = (value: number): string | null =>
  pxToTailwind(value, config.blur);

export const pxToLayoutSize = (value: number): string => {
  const tailwindValue = pxToTailwind(value, config.layoutSize);
  if (tailwindValue) {
    return tailwindValue;
  }

  return `[${sliceNum(value)}px]`;
};

export const nearestOpacity = (nodeOpacity: number): number =>
  nearestValue(nodeOpacity * 100, config.opacity);

export const nearestColor = nearestColorFrom(Object.keys(config.color));

export const nearestColorFromRgb = (color: RGB) => {
  // figma uses r,g,b in [0, 1], while nearestColor uses it in [0, 255]
  const colorMultiplied = {
    r: color.r * 255,
    g: color.g * 255,
    b: color.b * 255,
  };
  return config.color[nearestColor(colorMultiplied)];
}

export const variableToToken = (alias: VariableAlias) => {
  return figma.variables.getVariableById(alias.id)?.name.replaceAll("/", "-") || alias.id.toLowerCase().replaceAll(":", "-");
};
