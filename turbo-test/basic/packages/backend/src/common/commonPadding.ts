import { AltFrameMixin, AltDefaultShapeMixin } from "../altNodes/altMixins";

type paddingType = {
  horizontal: number;
  left: number;
  right: number;
  vertical: number;
  top: number;
  bottom: number;
};

/**
 * Add padding if necessary.
 * Padding is currently only valid for auto layout.
 * Padding can have values even when AutoLayout is off
 */
export const commonPadding = (
  node: AltFrameMixin | AltDefaultShapeMixin
): { all: number } | paddingType | null => {
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    // round the numbers to avoid 5 being different than 5.00001
    // fix it if undefined (in tests)
    node.paddingLeft = Math.round(node.paddingLeft ?? 0);
    node.paddingRight = Math.round(node.paddingRight ?? 0);
    node.paddingTop = Math.round(node.paddingTop ?? 0);
    node.paddingBottom = Math.round(node.paddingBottom ?? 0);

    const arr: paddingType = {
      horizontal: 0,
      vertical: 0,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };

    if (
      node.paddingLeft > 0 &&
      node.paddingLeft === node.paddingRight &&
      node.paddingLeft === node.paddingBottom &&
      node.paddingTop === node.paddingBottom
    ) {
      return { all: node.paddingLeft };
    } else if (node.paddingLeft > 0 && node.paddingLeft === node.paddingRight) {
      // horizontal padding + vertical + individual paddings
      arr.horizontal = node.paddingLeft;

      if (node.paddingTop > 0 && node.paddingTop === node.paddingBottom) {
        arr.vertical = node.paddingTop;
      } else {
        if (node.paddingTop > 0) {
          arr.top = node.paddingTop;
        }
        if (node.paddingBottom > 0) {
          arr.bottom = node.paddingBottom;
        }
      }
    } else if (node.paddingTop > 0 && node.paddingTop === node.paddingBottom) {
      // vertical padding + individual paddings
      arr.vertical = node.paddingBottom;

      if (node.paddingLeft > 0) {
        arr.left = node.paddingLeft;
      }
      if (node.paddingRight > 0) {
        arr.right = node.paddingRight;
      }
    } else {
      // individual paddings
      if (node.paddingLeft > 0) {
        arr.left = node.paddingLeft;
      }
      if (node.paddingRight > 0) {
        arr.right = node.paddingRight;
      }
      if (node.paddingTop > 0) {
        arr.top = node.paddingTop;
      }
      if (node.paddingBottom > 0) {
        arr.bottom = node.paddingBottom;
      }
    }

    return arr;
  }

  return null;
};
