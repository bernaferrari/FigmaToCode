import {
  AltBlendMixin,
  AltLayoutMixin,
  AltSceneNode,
} from "../../altNodes/altMixins";
import { sliceNum } from "../../common/numToAutoFixed";
import { indentString } from "../../common/indentString";

/**
 * https://api.flutter.dev/flutter/widgets/Opacity-class.html
 */
export const flutterOpacity = (node: AltBlendMixin, child: string): string => {
  if (node.opacity !== undefined && node.opacity !== 1 && child !== "") {
    const prop = `\nopacity: ${sliceNum(node.opacity)},\nchild: ${child}`;

    return `Opacity(${indentString(prop)}\n),`;
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

  if (node.visible !== undefined && !node.visible && child !== "") {
    const prop = `\nvisible: ${node.visible},\nchild: ${child}`;

    return `Visibility(${indentString(prop)}\n),`;
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
    const prop = `\nangle: ${sliceNum(
      node.rotation * (-3.14159 / 180)
    )},\nchild: ${child}`;

    return `Transform.rotate(${indentString(prop)}\n),`;
  }
  return child;
};
