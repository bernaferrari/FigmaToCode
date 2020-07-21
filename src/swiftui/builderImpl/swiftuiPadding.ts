import { AltSceneNode } from "../../altNodes/altMixins";
import { numToAutoFixed } from "../../common/numToAutoFixed";
import { commonPadding } from "../../common/commonPadding";

// Add padding if necessary!
// This must happen before Stack or after the Positioned, but not before.
export const swiftuiPadding = (node: AltSceneNode): string => {
  if (!("layoutMode" in node)) {
    return "";
  }

  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    return `\n.padding(${numToAutoFixed(padding.all)})`;
  }

  let comp = "";

  // horizontal and vertical, as the default AutoLayout
  if (padding.horizontal) {
    comp += `\n.padding(.horizontal, ${numToAutoFixed(padding.horizontal)})`;
  }
  if (padding.vertical) {
    comp += `\n.padding(.vertical, ${numToAutoFixed(padding.vertical)})`;
  }

  // if left and right exists, verify if they are the same after [pxToLayoutSize] conversion.
  if (padding.left) {
    comp += `\n.padding(.leading, ${numToAutoFixed(padding.left)})`;
  }
  if (padding.right) {
    comp += `\n.padding(.trailing, ${numToAutoFixed(padding.right)})`;
  }
  if (padding.top) {
    comp += `\n.padding(.top, ${numToAutoFixed(padding.top)})`;
  }
  if (padding.bottom) {
    comp += `\n.padding(.bottom, ${numToAutoFixed(padding.bottom)})`;
  }

  return comp;
};
