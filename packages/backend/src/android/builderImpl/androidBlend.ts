import { sliceNum } from "../../common/numToAutoFixed";
import { Modifier } from "./androidParser";

/**
 * https://developer.apple.com/documentation/android/view/opacity(_:)
 */
export const androidOpacity = (node: MinimalBlendMixin): Modifier | null => {
  if (node.opacity !== undefined && node.opacity !== 1) {
    return ["opacity", sliceNum(node.opacity)];
  }
  return null;
};

/**
 * https://developer.apple.com/documentation/swiftui/view/hidden()
 */
export const androidVisibility = (node: SceneNodeMixin): Modifier | null => {
  // [when testing] node.visible can be undefined
  if (node.visible !== undefined && !node.visible) {
    return ["hidden", ""];
  }
  return null;
};

/**
 * https://developer.apple.com/documentation/swiftui/modifiedcontent/rotationeffect(_:anchor:)
 */
export const androidRotation = (node: LayoutMixin): Modifier | null => {
  if (node.rotation !== undefined && Math.round(node.rotation) !== 0) {
    return ["rotationEffect", `.degrees(${sliceNum(node.rotation)})`];
  }
  return null;
};

/**
 * https://developer.apple.com/documentation/swiftui/blendmode
 */
export const androidBlendMode = (node: MinimalBlendMixin): Modifier | null => {
  const fromBlendEnum = blendModeEnum(node);
  if (fromBlendEnum) {
    return ["blendMode", fromBlendEnum];
  }

  return null;
};

const blendModeEnum = (node: MinimalBlendMixin): string => {
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
