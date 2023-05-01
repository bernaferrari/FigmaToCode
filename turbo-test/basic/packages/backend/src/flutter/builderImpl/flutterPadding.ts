import { AltSceneNode } from "../../altNodes/altMixins";
import { numToAutoFixed } from "../../common/numToAutoFixed";
import { commonPadding } from "../../common/commonPadding";

// Add padding if necessary!
// This must happen before Stack or after the Positioned, but not before.
export const flutterPadding = (node: AltSceneNode): string => {
  if (!("layoutMode" in node)) {
    return "";
  }

  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    return `\npadding: const EdgeInsets.all(${numToAutoFixed(padding.all)}),`;
  }

  // horizontal and vertical, as the default AutoLayout
  if (
    padding.horizontal + padding.vertical !== 0 &&
    padding.top + padding.bottom + padding.left + padding.right === 0
  ) {
    const propHorizontalPadding =
      padding.horizontal > 0
        ? `horizontal: ${numToAutoFixed(padding.horizontal)}, `
        : "";

    const propVerticalPadding =
      padding.vertical > 0
        ? `vertical: ${numToAutoFixed(padding.vertical)}, `
        : "";

    return `\npadding: const EdgeInsets.symmetric(${propHorizontalPadding}${propVerticalPadding}),`;
  }

  let comp = "";

  // if left and right exists, verify if they are the same after [pxToLayoutSize] conversion.
  if (padding.left) {
    comp += `left: ${numToAutoFixed(padding.left)}, `;
  }
  if (padding.right) {
    comp += `right: ${numToAutoFixed(padding.right)}, `;
  }
  if (padding.top) {
    comp += `top: ${numToAutoFixed(padding.top)}, `;
  }
  if (padding.bottom) {
    comp += `bottom: ${numToAutoFixed(padding.bottom)}, `;
  }

  if (comp !== "") {
    return `\npadding: const EdgeInsets.only(${comp}),`;
  }

  return "";
};
