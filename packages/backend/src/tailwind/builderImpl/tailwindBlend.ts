import { Paint } from "../../api_types";
import { numberToFixedString } from "../../common/numToAutoFixed";
import { exactValue, nearestOpacity } from "../conversionTables";

/**
 * https://tailwindcss.com/docs/opacity/
 * default is [0, 25, 50, 75, 100], but '100' will be ignored:
 * if opacity was changed, let it be visible. Therefore, 98% => 75
 * node.opacity is between [0, 1]; output will be [0, 100]
 */
export const tailwindOpacity = (node: MinimalBlendMixin): string => {
  // [when testing] node.opacity can be undefined
  if (node.opacity !== undefined && node.opacity !== 1) {
    return `opacity-${nearestOpacity(node.opacity)}`;
  }
  return "";
};

// https://tailwindcss.com/docs/mix-blend-mode
export const tailwindBlendMode = (node: MinimalBlendMixin): string => {
  if (node.blendMode !== "NORMAL" && node.blendMode !== "PASS_THROUGH") {
    switch (node.blendMode) {
      case "MULTIPLY":
        return "mix-blend-multiply";
      case "SCREEN":
        return "mix-blend-screen";
      case "OVERLAY":
        return "mix-blend-overlay";
      case "DARKEN":
        return "mix-blend-darken";
      case "LIGHTEN":
        return "mix-blend-lighten";
      case "COLOR_DODGE":
        return "mix-blend-color-dodge";
      case "COLOR_BURN":
        return "mix-blend-color-burn";
      case "HARD_LIGHT":
        return "mix-blend-hard-light";
      case "SOFT_LIGHT":
        return "mix-blend-soft-light";
      case "DIFFERENCE":
        return "mix-blend-difference";
      case "EXCLUSION":
        return "mix-blend-exclusion";
      case "HUE":
        return "mix-blend-hue";
      case "SATURATION":
        return "mix-blend-saturation";
      case "COLOR":
        return "mix-blend-color";
      case "LUMINOSITY":
        return "mix-blend-luminosity";
    }
    return "";
  }
  return "";
};

/**
 * Convert a Figma background blend mode to a Tailwind bg-blend-* class
 *
 * @param paintArray The array of paint fills that may have blend modes
 * @returns Tailwind background blend mode class if applicable
 */
export const tailwindBackgroundBlendMode = (
  paintArray: ReadonlyArray<Paint>,
): string => {
  if (
    paintArray.length === 0 ||
    paintArray.every(
      (d) => d.blendMode === "NORMAL" || d.blendMode === "PASS_THROUGH",
    )
  ) {
    return "";
  }

  // Get the top fill's blend mode (in Figma, the last item is the top one)
  const topFill = paintArray[paintArray.length - 1];
  if (topFill.blendMode === "NORMAL" || topFill.blendMode === "PASS_THROUGH") {
    return "";
  }

  const blendMode =
    topFill.blendMode?.toLowerCase()?.replaceAll("_", "-") || "normal";
  return `bg-blend-${blendMode}`;
};

/**
 * https://tailwindcss.com/docs/visibility/
 * example: invisible
 */
export const tailwindVisibility = (node: SceneNodeMixin): string => {
  // [when testing] node.visible can be undefined

  // When something is invisible in Figma, it isn't gone. Groups can make use of it.
  // Therefore, instead of changing the visibility (which causes bugs in nested divs),
  // this plugin is going to ignore color and stroke
  if (node.visible !== undefined && !node.visible) {
    return "invisible";
  }
  return "";
};

/**
 * https://tailwindcss.com/docs/rotate/
 * default is [-180, -90, -45, 0, 45, 90, 180], but '0' will be ignored:
 * if rotation was changed, let it be perceived. Therefore, 1 => 45
 */
export const tailwindRotation = (node: LayoutMixin): string => {
  // that's how you convert angles to clockwise radians: angle * -pi/180
  // using 3.14159 as Pi for enough precision and to avoid importing math lib.
  if (node.rotation !== undefined && Math.round(node.rotation) !== 0) {
    const allowedValues = [
      -180, -90, -45, -12, -6, -3, -2, -1, 1, 2, 3, 6, 12, 45, 90, 180,
    ];
    let nearest = exactValue(-node.rotation, allowedValues);
    if (nearest) {
      let minusIfNegative = "";
      if (nearest < 0) {
        minusIfNegative = "-";
        nearest = -nearest;
      }

      return `origin-top-left ${minusIfNegative}rotate-${nearest}`;
    } else {
      return `origin-top-left rotate-[${numberToFixedString(-node.rotation)}deg]`;
    }
  }
  return "";
};
