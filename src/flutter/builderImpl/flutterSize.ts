import { AltSceneNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { numToAutoFixed } from "../../common/numToAutoFixed";

export const flutterSize = (
  node: AltSceneNode
): { size: string; isExpanded: boolean } => {
  const size = nodeWidthHeight(node, false);

  let isExpanded: boolean = false;

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    propWidth = `width: ${numToAutoFixed(size.width)}, `;
  } else if (size.width === "full") {
    // When parent is a Row, child must be Expanded.
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "HORIZONTAL"
    ) {
      isExpanded = true;
    } else {
      propWidth = `width: double.infinity, `;
    }
  }

  let propHeight = "";
  if (typeof size.height === "number") {
    propHeight = `height: ${numToAutoFixed(size.height)}, `;
  } else if (size.height === "full") {
    // When parent is a Column, child must be Expanded.
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "VERTICAL"
    ) {
      isExpanded = true;
    } else {
      propHeight = `height: double.infinity, `;
    }
  }

  return { size: `${propWidth}${propHeight}`, isExpanded: isExpanded };
};
