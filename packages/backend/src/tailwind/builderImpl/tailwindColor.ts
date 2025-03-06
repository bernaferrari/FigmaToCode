import { gradientAngle } from "../../common/color";
import {
  getColorInfo,
  nearestOpacity,
  nearestValue,
} from "../conversionTables";
import { TailwindColorType } from "types";
import { addWarning } from "../../common/commonConversionWarnings";
import { retrieveTopFill } from "../../common/retrieveFill";

/**
 * Get a tailwind color value object
 * @param fill
 */
export function tailwindColor(fill: SolidPaint) {
  const { hex, colorType, colorName, meta } = getColorInfo(fill);
  const exportValue = tailwindSolidColor(fill, "bg");
  return {
    exportValue,
    colorName,
    colorType,
    hex,
    meta,
  };
}

/**
 * Calculate effective opacity from a fill or color stop
 * @param fill The color fill or stop to process
 * @param parentOpacity Optional parent opacity to factor in
 * @returns The calculated effective opacity value
 */
function calculateEffectiveOpacity(
  fill: SolidPaint | ColorStop,
  parentOpacity?: number,
): number {
  let effectiveOpacity =
    typeof parentOpacity === "number" ? parentOpacity : 1.0;

  // Apply fill-specific opacity
  if ("opacity" in fill && typeof fill.opacity === "number") {
    effectiveOpacity *= fill.opacity;
  }

  // For ColorStop, also consider the alpha channel in the color
  if ("color" in fill && "a" in fill.color) {
    effectiveOpacity *= fill.color.a;
  }

  return effectiveOpacity;
}

/**
 * Get the tailwind token name for a given color
 *
 * @param fill The color fill to process
 * @param kind Parameter specifying how the color will be used (e.g., 'text', 'bg')
 * @returns Tailwind color string with prefix (e.g., text-red-500)
 */
export const tailwindSolidColor = (
  fill: SolidPaint | ColorStop,
  kind: TailwindColorType,
): string => {
  const { colorName } = getColorInfo(fill);
  const effectiveOpacity = calculateEffectiveOpacity(fill);

  // Only add opacity suffix if it's not 1.0
  const opacity =
    effectiveOpacity !== 1.0 ? `/${nearestOpacity(effectiveOpacity)}` : "";

  // example: text-red-500, text-[#123abc], text-custom-color-700/25
  return `${kind}-${colorName}${opacity}`;
};

/**
 * Get the color name for a gradient stop, including opacity if needed
 *
 * @param stop The gradient color stop
 * @param parentOpacity The opacity of the parent gradient
 * @returns Color name with optional opacity suffix
 */
export const tailwindGradientStop = (
  stop: ColorStop,
  parentOpacity: number = 1.0,
): string => {
  const { colorName } = getColorInfo(stop);
  const effectiveOpacity = calculateEffectiveOpacity(stop, parentOpacity);

  // Only add opacity suffix if it's not 1.0
  const opacity =
    effectiveOpacity !== 1.0 ? `/${nearestOpacity(effectiveOpacity)}` : "";

  return `${colorName}${opacity}`;
};

// retrieve the SOLID color for tailwind
export const tailwindColorFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
  kind: TailwindColorType,
): string => {
  // [when testing] fills can be undefined

  const fill = retrieveTopFill(fills);
  if (fill && fill.type === "SOLID") {
    return tailwindSolidColor(fill, kind);
  } else if (
    fill &&
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_RADIAL" ||
      fill.type === "GRADIENT_DIAMOND")
  ) {
    if (fill.gradientStops.length > 0) {
      return tailwindSolidColor(fill.gradientStops[0], kind);
    }
  }
  return "";
};

export const tailwindGradientFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  const fill = retrieveTopFill(fills);

  // Return early if no fill exists
  if (!fill) {
    return "";
  }

  if (fill.type === "GRADIENT_LINEAR") {
    return tailwindGradient(fill);
  }

  // Show warning if there's a non-linear gradient
  if (
    fill.type === "GRADIENT_ANGULAR" ||
    fill.type === "GRADIENT_RADIAL" ||
    fill.type === "GRADIENT_DIAMOND"
  ) {
    addWarning(
      "Gradients are not fully supported in Tailwind except for Linear Gradients.",
    );
  }

  return "";
};

export const tailwindGradient = (fill: GradientPaint): string => {
  const direction = gradientDirection(gradientAngle(fill));

  // Get the overall fill opacity
  const globalOpacity = fill.opacity !== undefined ? fill.opacity : 1.0;

  if (fill.gradientStops.length === 1) {
    const fromColor = tailwindGradientStop(
      fill.gradientStops[0],
      globalOpacity,
    );
    return `${direction} from-${fromColor}`;
  } else if (fill.gradientStops.length === 2) {
    const fromColor = tailwindGradientStop(
      fill.gradientStops[0],
      globalOpacity,
    );
    const toColor = tailwindGradientStop(fill.gradientStops[1], globalOpacity);
    return `${direction} from-${fromColor} to-${toColor}`;
  } else {
    const fromColor = tailwindGradientStop(
      fill.gradientStops[0],
      globalOpacity,
    );
    // middle (second color)
    const viaColor = tailwindGradientStop(fill.gradientStops[1], globalOpacity);
    // last
    const toColor = tailwindGradientStop(
      fill.gradientStops[fill.gradientStops.length - 1],
      globalOpacity,
    );
    return `${direction} from-${fromColor} via-${viaColor} to-${toColor}`;
  }
};

const gradientDirection = (angle: number): string => {
  switch (nearestValue(angle, [-180, -135, -90, -45, 0, 45, 90, 135, 180])) {
    case 0:
      return "bg-gradient-to-r";
    case 45:
      return "bg-gradient-to-br";
    case 90:
      return "bg-gradient-to-b";
    case 135:
      return "bg-gradient-to-bl";
    case -45:
      return "bg-gradient-to-tr";
    case -90:
      return "bg-gradient-to-t";
    case -135:
      return "bg-gradient-to-tl";
    default:
      // 180 and -180
      return "bg-gradient-to-l";
  }
};
