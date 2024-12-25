import { LayoutMode } from "types";
import { parentCoordinates } from "./parentCoordinates";

export const commonPosition = (
  node: SceneNode & DimensionAndPositionMixin,
): LayoutMode => {
  // if node is same size as height, position is not necessary

  // detect if Frame's width is same as Child when Frame has Padding.
  // warning: this may return true even when false, if size is same, but position is different. However, it would be an unexpected layout.
  let hPadding = 0;
  let vPadding = 0;
  if (node.parent && "layoutMode" in node.parent) {
    hPadding = node.parent.paddingLeft + node.parent.paddingRight;
    vPadding = node.parent.paddingTop + node.parent.paddingBottom;
  }

  if (
    !node.parent ||
    !("width" in node.parent) ||
    (node.width === node.parent.width - hPadding &&
      node.height === node.parent.height - vPadding)
  ) {
    return "";
  }

  // position is absolute, parent is relative
  // return "absolute inset-0 m-auto ";

  const [parentX, parentY] = parentCoordinates(node.parent);

  // if view is too small, anything will be detected; this is necessary to reduce the tolerance.
  let threshold = 8;
  if (node.width < 16 || node.height < 16) {
    threshold = 1;
  }

  // < 4 is a threshold. If === is used, there can be rounding errors (28.002 !== 28)
  const centerX =
    Math.abs(2 * (node.x - parentX) + node.width - node.parent.width) <
    threshold;
  const centerY =
    Math.abs(2 * (node.y - parentY) + node.height - node.parent.height) <
    threshold;

  const minX = node.x - parentX < threshold;
  const minY = node.y - parentY < threshold;

  const maxX = node.parent.width - (node.x - parentX + node.width) < threshold;
  const maxY =
    node.parent.height - (node.y - parentY + node.height) < threshold;

  // this needs to be on top, because Tailwind is incompatible with Center, so this will give preference.
  if (minX && minY) {
    // x left, y top
    return "TopStart";
  } else if (minX && maxY) {
    // x left, y bottom
    return "BottomStart";
  } else if (maxX && minY) {
    // x right, y top
    return "TopEnd";
  } else if (maxX && maxY) {
    // x right, y bottom
    return "BottomEnd";
  }

  if (centerX && centerY) {
    return "Center";
  }

  if (centerX) {
    if (minY) {
      // x center, y top
      return "TopCenter";
    }
    if (maxY) {
      // x center, y bottom
      return "BottomCenter";
    }
  } else if (centerY) {
    if (minX) {
      // x left, y center
      return "CenterStart";
    }
    if (maxX) {
      // x right, y center
      return "CenterEnd";
    }
  }

  return "Absolute";
};

export const getCommonPositionValue = (
  node: SceneNode,
): { x: number; y: number } => {
  if (node.parent && node.parent.type === "GROUP") {
    return {
      x: node.x - node.parent.x,
      y: node.y - node.parent.y,
    };
  }

  return {
    x: node.x,
    y: node.y,
  };
};

export const commonIsAbsolutePosition = (
  node: SceneNode,
  optimizeLayout: boolean,
) => {
  // No position when parent is inferred auto layout.
  if (
    optimizeLayout &&
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.inferredAutoLayout !== null
  ) {
    return false;
  }

  if ("layoutAlign" in node) {
    if (!node.parent || node.parent === undefined) {
      return false;
    }

    const parentLayoutIsNone =
      "layoutMode" in node.parent && node.parent.layoutMode === "NONE";
    const hasNoLayoutMode = !("layoutMode" in node.parent);

    if (
      node.layoutPositioning === "ABSOLUTE" ||
      parentLayoutIsNone ||
      hasNoLayoutMode
    ) {
      return true;
    }
  }
  return false;
};
