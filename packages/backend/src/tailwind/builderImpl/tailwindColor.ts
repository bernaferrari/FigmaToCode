import { retrieveTopFill } from "../../common/retrieveFill";
import { gradientAngle } from "../../common/color";
import {
  getColorInfo,
  nearestOpacity,
  nearestValue,
} from "../conversionTables";
import { TailwindColorType } from "types";
import { addWarning } from "../../common/commonConversionWarnings";

/**
 * Get a tailwind color value object
 * @param fill
 */
export function tailwindColor(fill: SolidPaint) {
  const { hex, colorType, colorName, meta } = getColorInfo(fill);
  const exportValue = tailwindSolidColor(fill, "solid");
  return {
    exportValue,
    colorName,
    colorType,
    hex,
    meta,
  };
}

/**
 * Get the tailwind token name for a given color
 *
 * - variables: uses the tokenised variable name
 * - colors:    uses the nearest Tailwind color name
 */
export const tailwindSolidColor = (
  fill: SolidPaint | ColorStop,
  kind?: TailwindColorType,
): string => {
  // example: stone-500 or custom-color-700
  const { colorName } = getColorInfo(fill);

  // if no kind, it's a variable stop, so just return the name
  if (!kind) {
    return colorName;
  }

  // grab opacity, or set it to full
  const opacity =
    "opacity" in fill && fill.opacity !== 1.0
      ? `/${nearestOpacity(fill.opacity ?? 1.0)}`
      : "";

  // example: text-red-500, text-[#123abc], text-custom-color-700/25
  return `${kind}-${colorName}${opacity}`;
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

/**
 * https://tailwindcss.com/docs/box-shadow/
 * example: shadow
 */
export const tailwindGradientFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  // [when testing] node.effects can be undefined

  const fill = retrieveTopFill(fills);

  if (fill?.type === "GRADIENT_LINEAR") {
    return tailwindGradient(fill);
  }

  addWarning(
    "Gradients are not fully supported in Tailwind except for Linear Gradients.",
  );

  return "";
};

export const tailwindGradient = (fill: GradientPaint): string => {
  const direction = gradientDirection(gradientAngle(fill));

  if (fill.gradientStops.length === 1) {
    const fromColor = tailwindSolidColor(fill.gradientStops[0]);

    return `${direction} from-${fromColor}`;
  } else if (fill.gradientStops.length === 2) {
    const fromColor = tailwindSolidColor(fill.gradientStops[0]);
    const toColor = tailwindSolidColor(fill.gradientStops[1]);

    return `${direction} from-${fromColor} to-${toColor}`;
  } else {
    const fromColor = tailwindSolidColor(fill.gradientStops[0]);

    // middle (second color)
    const viaColor = tailwindSolidColor(fill.gradientStops[1]);

    // last
    const toColor = tailwindSolidColor(
      fill.gradientStops[fill.gradientStops.length - 1],
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
