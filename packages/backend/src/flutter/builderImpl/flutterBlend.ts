import { generateWidgetCode, sliceNum } from "../../common/numToAutoFixed";

/**
 * https://api.flutter.dev/flutter/widgets/Opacity-class.html
 */
export const flutterOpacity = (
  node: MinimalBlendMixin,
  child: string,
): string => {
  if (node.opacity !== undefined && node.opacity !== 1 && child !== "") {
    return generateWidgetCode("Opacity", {
      opacity: sliceNum(node.opacity),
      child: child,
    });
  }
  return child;
};

/**
 * https://api.flutter.dev/flutter/widgets/Visibility-class.html
 */
export const flutterVisibility = (node: SceneNode, child: string): string => {
  // [when testing] node.visible can be undefined

  if (node.visible !== undefined && !node.visible && child !== "") {
    return generateWidgetCode("Visibility", {
      visible: `${node.visible}`,
      child: child,
    });
  }
  return child;
};

/**
 * https://api.flutter.dev/flutter/widgets/Transform-class.html
 * that's how you convert angles to clockwise radians: angle * -pi/180
 * using 3.14159 as Pi for enough precision and to avoid importing math lib.
 */
export const flutterRotation = (node: LayoutMixin, child: string): string => {
  if (
    node.rotation !== undefined &&
    child !== "" &&
    Math.round(node.rotation) !== 0
  ) {
    return generateWidgetCode("Transform", {
      transform: `Matrix4.identity()..translate(0.0, 0.0)..rotateZ(${sliceNum(
        node.rotation * (-3.14159 / 180),
      )})`,
      child: child,
    });
  }
  return child;
};
