import { sliceNum } from "../../common/numToAutoFixed";
import { commonPadding } from "../../common/commonPadding";

// Add padding if necessary!
// This must happen before Stack or after the Positioned, but not before.
export const swiftuiPadding = (node: SceneNode): string => {
  if (!("layoutMode" in node)) {
    return "";
  }

  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    return `\n.padding(${sliceNum(padding.all)})`;
  }

  let comp = "";

  // horizontal and vertical, as the default AutoLayout
  if (padding.horizontal) {
    comp += `\n.padding(.horizontal, ${sliceNum(padding.horizontal)})`;
  }
  if (padding.vertical) {
    comp += `\n.padding(.vertical, ${sliceNum(padding.vertical)})`;
  }

  // if left and right exists, verify if they are the same after [pxToLayoutSize] conversion.
  if (padding.left) {
    comp += `\n.padding(.leading, ${sliceNum(padding.left)})`;
  }
  if (padding.right) {
    comp += `\n.padding(.trailing, ${sliceNum(padding.right)})`;
  }
  if (padding.top) {
    comp += `\n.padding(.top, ${sliceNum(padding.top)})`;
  }
  if (padding.bottom) {
    comp += `\n.padding(.bottom, ${sliceNum(padding.bottom)})`;
  }

  return comp;
};
