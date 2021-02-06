import { AltSceneNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { numToAutoFixed } from "../../common/numToAutoFixed";

// Used in tests.
export const flutterSizeWH = (node: AltSceneNode): string => {
  const fSize = flutterSize(node);
  const size = fSize.width + fSize.height;
  return size;
};

export const flutterSize = (
  node: AltSceneNode
): { width: string; height: string; isExpanded: boolean } => {
  const size = nodeWidthHeight(node, false);

  let isExpanded: boolean = false;

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    propWidth = `\nwidth: ${numToAutoFixed(size.width)},`;
  } else if (size.width === "full") {
    // When parent is a Row, child must be Expanded.
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "HORIZONTAL"
    ) {
      isExpanded = true;
    } else {
      propWidth = `\nwidth: double.infinity,`;
    }
  }

  let propHeight = "";
  if (typeof size.height === "number") {
    propHeight = `\nheight: ${numToAutoFixed(size.height)},`;
  } else if (size.height === "full") {
    // When parent is a Column, child must be Expanded.
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "VERTICAL"
    ) {
      isExpanded = true;
    } else {
      propHeight = `\nheight: double.infinity,`;
    }
  }

  return { width: propWidth, height: propHeight, isExpanded: isExpanded };
};
