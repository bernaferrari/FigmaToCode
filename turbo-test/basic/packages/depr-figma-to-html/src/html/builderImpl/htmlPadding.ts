import { CSSProperties } from "react";
import { numToAutoFixed } from "../../common/numToAutoFixed";
import { AltFrameMixin, AltDefaultShapeMixin } from "../../altMixins";
import { commonPadding } from "../../common/commonPadding";
import { formatWithJSX } from "../../common/parseJSX";

/**
 * https://tailwindcss.com/docs/margin/
 * example: px-2 py-8
 */
export const htmlPadding = (
  node: AltFrameMixin | AltDefaultShapeMixin
): CSSProperties => {
  const padding = commonPadding(node);
  if (padding === null) {
    return {};
  }

  if ("all" in padding) {
    return { padding: padding.all };
  }

  let comp: CSSProperties = {};

  // horizontal and vertical, as the default AutoLayout
  if (padding.horizontal) {
    comp.paddingLeft = padding.horizontal;
    comp.paddingRight = padding.horizontal;
  }
  if (padding.vertical) {
    comp.paddingTop = padding.vertical;
    comp.paddingBottom = padding.vertical;
  }
  if (padding.top) {
    comp.paddingTop = padding.top;
  }
  if (padding.bottom) {
    comp.paddingBottom = padding.bottom;
  }
  if (padding.left) {
    comp.paddingLeft = padding.left;
  }
  if (padding.right) {
    comp.paddingRight = padding.right;
  }

  // todo use REM
  return comp;
};
