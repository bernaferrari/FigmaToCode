import { nearestValue } from "./tailwind_wrappers";

// retrieve the SOLID color for tailwind
export const tailwindColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
  kind: string
) => {
  // kind can be text, bg, border...
  if (fills !== figma.mixed && fills.length > 0) {
    let fill = fills[0];
    if (fill.type === "SOLID") {
      const hex =
        ((fill.color.r * 255) | (1 << 8)).toString(16).slice(1) +
        ((fill.color.g * 255) | (1 << 8)).toString(16).slice(1) +
        ((fill.color.b * 255) | (1 << 8)).toString(16).slice(1);

      let opacity = fill.opacity ?? 1.0;

      // example: text-opacity-50
      //
      // https://tailwindcss.com/docs/opacity/
      // default is [0, 25, 50, 75, 100]
      // ignore the 100. If opacity was changed, let it be visible.
      const opacityProp =
        opacity !== 1.0
          ? `${kind}-opacity-${nearestValue(opacity, [0, 25, 50, 75])} `
          : "";

      // example: text-red-500
      const colorProp = `${kind}-${getTailwindColor(hex)} `;

      // if fill isn't visible, it shouldn't be painted.
      return fill.visible ? `${colorProp}${opacityProp}` : "";
    }
  }

  return "";
};

// Convert RGB (r,g,b: [0, 1]) + alpha [0, 1] to 8 digit hex
// Convert RGBA (r,g,b,a: [0, 1]) to 8 digit hex
export const rgbTohexNoAlpha = (
  color: RGB | RGBA,
  alpha: number = "a" in color ? color.a : 1.0
): string => {
  // when color is RGBA, alpha is set automatically
  // when color is RGB, alpha need to be set manually (default: 1.0)
  const hex =
    ((alpha * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.r * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.g * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.b * 255) | (1 << 8)).toString(16).slice(1);

  return hex;
};

// Convert generic named weights to numbers, which is the way tailwind understands
export const convertFontWeight = (weight: string) => {
  // todo italic
  switch (weight) {
    case "Thin":
      return "100";
    case "Extra Light":
      return "200";
    case "Light":
      return "300";
    case "Regular":
      return "400";
    case "Medium":
      return "500";
    case "Semi Bold":
      return "600";
    case "Bold":
      return "700";
    case "Extra Bold":
      return "800";
    case "Black":
      return "900";
    default:
      return "400";
  }
};

export const tailwindColors: Record<string, string> = {
  "#000000": "black",
  "#ffffff": "white",

  "#f7fafc": "gray-100",
  "#edf2f7": "gray-200",
  "#e2e8f0": "gray-300",
  "#cbd5e0": "gray-400",
  "#a0aec0": "gray-500",
  "#718096": "gray-600",
  "#4a5568": "gray-700",
  "#2d3748": "gray-800",
  "#1a202c": "gray-900",

  "#fff5f5": "red-100",
  "#fed7d7": "red-200",
  "#feb2b2": "red-300",
  "#fc8181": "red-400",
  "#f56565": "red-500",
  "#e53e3e": "red-600",
  "#c53030": "red-700",
  "#9b2c2c": "red-800",
  "#742a2a": "red-900",

  "#fffaf0": "orange-100",
  "#feebc8": "orange-200",
  "#fbd38d": "orange-300",
  "#f6ad55": "orange-400",
  "#ed8936": "orange-500",
  "#dd6b20": "orange-600",
  "#c05621": "orange-700",
  "#9c4221": "orange-800",
  "#7b341e": "orange-900",
};

export const tailwindColorsKeys = Object.keys(tailwindColors);

export const nearestColor = require("nearest-color").from(tailwindColorsKeys);

export const getTailwindColor = (color: string): string => {
  return tailwindColors[nearestColor(color)];
};

// https://stackoverflow.com/a/20762713
export const mostFrequentString = (arr: Array<any>) => {
  return arr
    .sort(
      (a, b) =>
        arr.filter((v) => v === a).length - arr.filter((v) => v === b).length
    )
    .pop();
};
