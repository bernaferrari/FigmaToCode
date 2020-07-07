import { AltSceneNode } from "../altNodes/altMixins";

type position =
  | ""
  | "Absolute"
  | "TopStart"
  | "TopCenter"
  | "TopEnd"
  | "CenterStart"
  | "Center"
  | "CenterEnd"
  | "BottomStart"
  | "BottomCenter"
  | "BottomEnd";

export const commonPosition = (node: AltSceneNode): position => {
  // if node is same size as height, position is not necessary

  // detect if Frame's width is same as Child when Frame has Padding.
  let hPadding = 0;
  let vPadding = 0;
  if (node.parent && "layoutMode" in node.parent) {
    hPadding = 2 * (node.parent.horizontalPadding ?? 0);
    vPadding = 2 * (node.parent.verticalPadding ?? 0);
  }

  if (
    !node.parent ||
    (node.width === node.parent.width - hPadding &&
      node.height === node.parent.height - vPadding)
  ) {
    return "";
  }

  // position is absolute, parent is relative
  // return "absolute inset-0 m-auto ";

  const parentX = "layoutMode" in node.parent ? 0 : node.parent.x;
  const parentY = "layoutMode" in node.parent ? 0 : node.parent.y;

  // < 4 is a threshold. If === is used, there can be rounding errors (28.002 !== 28)
  const centerX =
    Math.abs(2 * (node.x - parentX) + node.width - node.parent.width) < 8;
  const centerY =
    Math.abs(2 * (node.y - parentY) + node.height - node.parent.height) < 8;

  const minX = node.x - parentX < 8;
  const minY = node.y - parentY < 8;

  const maxX = node.parent.width - (node.x - parentX + node.width) < 8;
  const maxY = node.parent.height - (node.y - parentY + node.height) < 8;

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

  return "Absolute";
};
