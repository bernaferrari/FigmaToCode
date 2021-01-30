import { formatWithJSX } from "./../../common/parseJSX";
import { numToAutoFixed } from "../../common/numToAutoFixed";
import { AltFrameMixin, AltDefaultShapeMixin } from "../../altNodes/altMixins";
import { commonPadding } from "../../common/commonPadding";

/**
 * https://tailwindcss.com/docs/margin/
 * example: px-2 py-8
 */
export const htmlPadding = (
  node: AltFrameMixin | AltDefaultShapeMixin,
  isJsx: boolean
): string => {
  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    return formatWithJSX("padding", isJsx, padding.all);
  }

  let comp = "";

  // horizontal and vertical, as the default AutoLayout
  if (padding.horizontal) {
    comp += formatWithJSX("padding-left", isJsx, padding.horizontal);
    comp += formatWithJSX("padding-right", isJsx, padding.horizontal);
  }
  if (padding.vertical) {
    comp += formatWithJSX("padding-top", isJsx, padding.vertical);
    comp += formatWithJSX("padding-bottom", isJsx, padding.vertical);
  }
  if (padding.top) {
    comp += formatWithJSX("padding-top", isJsx, padding.top);
  }
  if (padding.bottom) {
    comp += formatWithJSX("padding-bottom", isJsx, padding.bottom);
  }
  if (padding.left) {
    comp += formatWithJSX("padding-left", isJsx, padding.left);
  }
  if (padding.right) {
    comp += formatWithJSX("padding-right", isJsx, padding.right);
  }

  // todo use REM

  return comp;
};
