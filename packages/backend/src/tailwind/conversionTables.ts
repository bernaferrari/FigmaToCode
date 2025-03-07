import { nearestColorFrom } from "../nearest-color/nearestColor";
import { numberToFixedString } from "../common/numToAutoFixed";
import { localTailwindSettings } from "./tailwindMain";
import { config } from "./tailwindConfig";
import { rgbTo6hex } from "../common/color";

export const nearestValue = (goal: number, array: Array<number>): number => {
  return array.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
};

// New function to get nearest value only if it's within acceptable threshold
export const nearestValueWithThreshold = (
  goal: number,
  array: Array<number>,
  thresholdPercent: number = 15,
): number | null => {
  const nearest = nearestValue(goal, array);
  const diff = Math.abs(nearest - goal);
  const percentDiff = (diff / goal) * 100;

  if (percentDiff <= thresholdPercent) {
    return nearest;
  }
  return null;
};

export const exactValue = (
  goal: number,
  array: Array<number>,
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
  conversionMap: Record<number, string>,
): string => {
  const keys = Object.keys(conversionMap).map((d) => +d);
  const remValue = value / 16;
  const convertedValue = exactValue(remValue, keys);

  if (convertedValue) {
    return conversionMap[convertedValue];
  } else if (localTailwindSettings.roundTailwindValues) {
    // Only round if the nearest value is within acceptable threshold
    const thresholdValue = nearestValueWithThreshold(remValue, keys, 15);

    if (thresholdValue !== null) {
      return conversionMap[thresholdValue];
    }
  }

  return `[${numberToFixedString(value)}px]`;
};

const pxToTailwind = (
  value: number,
  conversionMap: Record<number, string>,
): string | null => {
  const keys = Object.keys(conversionMap).map((d) => +d);
  const convertedValue = exactValue(value, keys);

  if (convertedValue) {
    return conversionMap[convertedValue];
  } else if (localTailwindSettings.roundTailwindValues) {
    // Only round if the nearest value is within acceptable threshold
    const thresholdValue = nearestValueWithThreshold(value, keys, 15);

    if (thresholdValue !== null) {
      return conversionMap[thresholdValue];
    }
  }

  return `[${numberToFixedString(value)}px]`;
};

export const pxToLetterSpacing = (value: number): string => {
  return pxToRemToTailwind(value, config.letterSpacing);
};

export const pxToLineHeight = (value: number): string => {
  return pxToRemToTailwind(value, config.lineHeight);
};

export const pxToFontSize = (value: number): string => {
  return pxToRemToTailwind(value, config.fontSize);
};

export const pxToBorderRadius = (value: number): string => {
  return pxToRemToTailwind(value, config.borderRadius);
};

export const pxToBlur = (value: number): string | null => {
  return pxToTailwind(value, config.blur);
};

export const pxToLayoutSize = (value: number): string => {
  // First check if it's a direct match to avoid rounding errors
  const exactValue = Object.keys(config.layoutSize)
    .map(Number)
    .find((size) => Math.abs(value - size) < 0.05);

  if (exactValue !== undefined) {
    return (config.layoutSize as any)[exactValue];
  }

  // If not an exact match but rounding is enabled, check for a close match
  if (localTailwindSettings.roundTailwindValues) {
    const thresholdValue = nearestValueWithThreshold(
      value,
      Object.keys(config.layoutSize).map(Number),
      15, // 15% threshold for layout sizes
    );

    if (thresholdValue !== null) {
      return (config.layoutSize as any)[thresholdValue];
    }
  }

  // No match found, return arbitrary value
  return `[${numberToFixedString(value)}px]`;
};

export const nearestOpacity = (nodeOpacity: number): number => {
  return nearestValue(nodeOpacity * 100, config.opacity);
};

export const nearestColor = nearestColorFrom(Object.keys(config.color));

/**
 * @return Tailwind color name and Hex value with leading #
 */
export const nearestColorFromRgb = (color: RGB) => {
  // figma uses r,g,b in [0, 1], while nearestColor uses it in [0, 255]
  const colorMultiplied = {
    r: color.r * 255,
    g: color.g * 255,
    b: color.b * 255,
  };
  const value = nearestColor(colorMultiplied);
  const name = config.color[value];
  return { name, value };
};

export const variableToColorName = async (id: string) => {
  return (
    (await figma.variables.getVariableByIdAsync(id))?.name
      .replaceAll("/", "-")
      .replaceAll(" ", "-") || id.toLowerCase().replaceAll(":", "-")
  );
};

/**
 * Get color information based on given color and user settings
 *
 * Returns type, name, hex and meta values
 */
export function getColorInfo(fill: SolidPaint | ColorStop) {
  // variables
  let colorName: string;
  let colorType: "arbitrary" | "tailwind" | "variable";
  let hex: string = "#" + rgbTo6hex(fill.color);
  let meta: string = "";

  console.log(
    "(fill as any).variableColorName",
    fill,
    (fill as any).variableColorName,
  );
  // variable
  if ((fill as any).variableColorName) {
    // Use pre-computed variable name if available
    colorName = (fill as any).variableColorName; // || variableToColorName(fill.boundVariables.color);
    colorType = "variable";
    meta = "custom";

    return {
      colorType,
      colorName,
      hex,
      meta,
    };
  }

  // Check for pure black/white first
  if (fill.color.r === 0 && fill.color.g === 0 && fill.color.b === 0) {
    return {
      colorType: "tailwind",
      colorName: "black",
      hex: "#000000",
      meta: "",
    };
  } else if (fill.color.r === 1 && fill.color.g === 1 && fill.color.b === 1) {
    return {
      colorType: "tailwind",
      colorName: "white",
      hex: "#ffffff",
      meta: "",
    };
  } else {
    // get tailwind color as comparison
    const { name, value } = nearestColorFromRgb(fill.color);

    // round color
    if (localTailwindSettings.roundTailwindColors || hex === value) {
      colorName = name;
      colorType = "tailwind";
      if (hex !== value) {
        meta = "rounded";
      }

      // must come last, as previous comparison
      hex = value;
    }

    // exact color
    else {
      colorName = `[${hex}]`;
      colorType = "arbitrary";
    }
  }

  return {
    colorType,
    colorName,
    hex,
    meta,
  };
}
