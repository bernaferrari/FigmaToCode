import { AltBlendMixin } from "../../altNodes/altMixins";
import { AltLayoutMixin, AltSceneNode } from "../../altNodes/altMixins";
import { numToAutoFixed } from "../../common/numToAutoFixed";

/**
 * https://developer.apple.com/documentation/swiftui/view/opacity(_:)
 */
export const swiftuiOpacity = (node: AltBlendMixin): string => {
  if (node.opacity !== undefined && node.opacity !== 1) {
    return `\n.opacity(${numToAutoFixed(node.opacity)})`;
  }
  return "";
};

/**
 * https://developer.apple.com/documentation/swiftui/view/hidden()
 */
export const swiftuiVisibility = (node: AltSceneNode): string => {
  // [when testing] node.visible can be undefined
  if (node.visible !== undefined && node.visible === false) {
    return `\n.hidden()`;
  }
  return "";
};

/**
 * https://developer.apple.com/documentation/swiftui/modifiedcontent/rotationeffect(_:anchor:)
 */
export const swiftuiRotation = (node: AltLayoutMixin): string => {
  if (node.rotation !== undefined && Math.round(node.rotation) !== 0) {
    return `.rotationEffect(.degrees(${numToAutoFixed(node.rotation)}))`;
  }
  return "";
};

/**
 * https://developer.apple.com/documentation/swiftui/blendmode
 */
export const swiftuiBlendMode = (node: AltSceneNode): string => {
  const fromBlendEnum = blendModeEnum(node);
  if (fromBlendEnum) {
    return `\n.blendMode(${fromBlendEnum})`;
  }

  return "";
};

const blendModeEnum = (node: AltSceneNode): string => {
  switch (node.blendMode) {
    case "COLOR":
      return ".color";
    case "COLOR_BURN":
      return ".colorBurn";
    case "COLOR_DODGE":
      return ".colorDodge";
    case "DIFFERENCE":
      return ".difference";
    case "EXCLUSION":
      return ".exclusion";
    case "HARD_LIGHT":
      return ".hardLight";
    case "HUE":
      return ".hue";
    case "LIGHTEN":
      return ".lighten";
    case "LUMINOSITY":
      return ".luminosity";
    case "MULTIPLY":
      return ".multiply";
    case "OVERLAY":
      return ".overlay";
    case "SATURATION":
      return ".saturation";
    case "SCREEN":
      return ".screen";
    case "SOFT_LIGHT":
      return ".softLight";
    default:
      // PASS_THROUGH, NORMAL, LINEAR_DODGE
      return "";
  }
};
