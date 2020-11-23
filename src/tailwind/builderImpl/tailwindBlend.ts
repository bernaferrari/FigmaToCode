import { AltBlendMixin } from "../../altNodes/altMixins";
import { nearestValue } from "../conversionTables";
import { AltLayoutMixin, AltSceneNode } from "../../altNodes/altMixins";

/**
 * https://tailwindcss.com/docs/opacity/
 * default is [0, 25, 50, 75, 100], but '100' will be ignored:
 * if opacity was changed, let it be visible. Therefore, 98% => 75
 * node.opacity is between [0, 1]; output will be [0, 100]
 */
export const tailwindOpacity = (node: AltBlendMixin): string => {
  // [when testing] node.opacity can be undefined
  if (node.opacity !== undefined && node.opacity !== 1) {
    const allowedValues = [
      0,
      5,
      10,
      20,
      25,
      30,
      40,
      50,
      60,
      70,
      75,
      80,
      90,
      95,
    ];
    return `opacity-${nearestValue(node.opacity * 100, allowedValues)} `;
  }
  return "";
};

/**
 * https://tailwindcss.com/docs/visibility/
 * example: invisible
 */
export const tailwindVisibility = (node: AltSceneNode): string => {
  // [when testing] node.visible can be undefined

  // When something is invisible in Figma, it isn't gone. Groups can make use of it.
  // Therefore, instead of changing the visibility (which causes bugs in nested divs),
  // this plugin is going to ignore color and stroke
  if (node.visible !== undefined && !node.visible) {
    return "invisible ";
  }
  return "";
};

/**
 * https://tailwindcss.com/docs/rotate/
 * default is [-180, -90, -45, 0, 45, 90, 180], but '0' will be ignored:
 * if rotation was changed, let it be perceived. Therefore, 1 => 45
 */
export const tailwindRotation = (node: AltLayoutMixin): string => {
  // that's how you convert angles to clockwise radians: angle * -pi/180
  // using 3.14159 as Pi for enough precision and to avoid importing math lib.
  if (node.rotation !== undefined && Math.round(node.rotation) !== 0) {
    const allowedValues = [
      -180,
      -90,
      -45,
      -12,
      -6,
      -3,
      -2,
      -1,
      1,
      2,
      3,
      6,
      12,
      45,
      90,
      180,
    ];
    let nearest = nearestValue(node.rotation, allowedValues);
    let minusIfNegative = "";
    if (nearest < 0) {
      minusIfNegative = "-";
      nearest = -nearest;
    }

    return `${minusIfNegative}rotate-${nearest} `;
  }
  return "";
};
