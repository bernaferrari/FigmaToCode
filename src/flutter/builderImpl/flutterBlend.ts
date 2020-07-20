import { AltBlendMixin } from "../../altNodes/altMixins";
import { AltLayoutMixin, AltSceneNode } from "../../altNodes/altMixins";
import { numToAutoFixed } from "../../common/numToAutoFixed";

/**
 * https://api.flutter.dev/flutter/widgets/Opacity-class.html
 */
export const flutterOpacity = (node: AltBlendMixin, child: string): string => {
  if (node.opacity !== undefined && node.opacity !== 1 && child !== "") {
    return `Opacity(opacity: ${numToAutoFixed(
      node.opacity
    )}, child: ${child}),`;
  }
  return child;
};

/**
 * https://api.flutter.dev/flutter/widgets/Visibility-class.html
 */
export const flutterVisibility = (
  node: AltSceneNode,
  child: string
): string => {
  // [when testing] node.visible can be undefined

  if (node.visible !== undefined && node.visible === false && child !== "") {
    return `Visibility(visible: ${node.visible}, child: ${child}),`;
  }
  return child;
};

/**
 * https://api.flutter.dev/flutter/widgets/Transform-class.html
 * that's how you convert angles to clockwise radians: angle * -pi/180
 * using 3.14159 as Pi for enough precision and to avoid importing math lib.
 */
export const flutterRotation = (
  node: AltLayoutMixin,
  child: string
): string => {
  if (
    node.rotation !== undefined &&
    child !== "" &&
    Math.round(node.rotation) !== 0
  ) {
    return `Transform.rotate(angle: ${numToAutoFixed(
      node.rotation * (-3.14159 / 180)
    )}, child: ${child})`;
  }
  return child;
};
