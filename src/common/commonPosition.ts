import { AltSceneNode } from "../altNodes/altMixins";
import { parentCoordinates } from "./parentCoordinates";

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
  // warning: this may return true even when false, if size is same, but position is different. However, it would be an unexpected layout.
  let hPadding = 0;
  let vPadding = 0;
  if (node.parent && "layoutMode" in node.parent) {
    hPadding = (node.parent.paddingLeft ?? 0) + (node.parent.paddingRight ?? 0);
    vPadding = (node.parent.paddingTop ?? 0) + (node.parent.paddingBottom ?? 0);
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
