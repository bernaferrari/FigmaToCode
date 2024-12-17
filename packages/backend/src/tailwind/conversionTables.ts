import { nearestColorFrom } from "../nearest-color/nearestColor";
import { sliceNum } from "../common/numToAutoFixed";
import { localTailwindSettings } from "./tailwindMain";
import { config } from "./tailwindConfig";
import { rgbTo6hex } from "../common/color";

export const nearestValue = (goal: number, array: Array<number>): number => {
  return array.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
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
  const convertedValue = exactValue(value / 16, keys);

  if (convertedValue) {
    return conversionMap[convertedValue];
  } else if (localTailwindSettings.roundTailwindValues) {
    return conversionMap[nearestValue(value / 16, keys)];
  }

  return `[${sliceNum(value)}px]`;
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
    return conversionMap[nearestValue(value, keys)];
  }

  return `[${sliceNum(value)}px]`;
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
  const tailwindValue = pxToTailwind(value, config.layoutSize);
  if (tailwindValue) {
    return tailwindValue;
  }

  return `[${sliceNum(value)}px]`;
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

export const variableToColorName = (alias: VariableAlias) => {
  return (
    figma.variables.getVariableById(alias.id)?.name.replaceAll("/", "-").replaceAll(" ", "-") || 
    alias.id.toLowerCase().replaceAll(":", "-")
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

  // Check for pure black/white first
  if (fill.color.r === 0 && fill.color.g === 0 && fill.color.b === 0) {
    return {
      colorType: "tailwind",
      colorName: "black",
      hex: "#000000",
      meta: ''
    };
  }

  if (fill.color.r === 1 && fill.color.g === 1 && fill.color.b === 1) {
    return {
      colorType: "tailwind", 
      colorName: "white",
      hex: "#ffffff",
      meta: ''
    };
  }

  // variable
  if (
    localTailwindSettings.customTailwindColors &&
    fill.boundVariables?.color
  ) {
    colorName = variableToColorName(fill.boundVariables.color);
    colorType = "variable";
    meta = "custom";
  }

  // solid color
  else {
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
