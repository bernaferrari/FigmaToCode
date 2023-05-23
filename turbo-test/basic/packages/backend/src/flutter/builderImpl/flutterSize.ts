import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { sliceNum } from "../../common/numToAutoFixed";

// Used in tests.
export const flutterSizeWH = (node: SceneNode): string => {
  const fSize = flutterSize(node);
  const size = fSize.width + fSize.height;
  return size;
};

export const flutterSize = (
  node: SceneNode
): { width: string; height: string; isExpanded: boolean } => {
  const size = nodeWidthHeight(node, false);

  let isExpanded: boolean = false;

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    propWidth = sliceNum(size.width);
  } else if (size.width === "full") {
    // When parent is a Row, child must be Expanded.
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "HORIZONTAL"
    ) {
      isExpanded = true;
    } else {
      propWidth = `double.infinity`;
    }
  }

  let propHeight = "";
  if (typeof size.height === "number") {
    propHeight = sliceNum(size.height);
  } else if (size.height === "full") {
    // When parent is a Column, child must be Expanded.
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "VERTICAL"
    ) {
      isExpanded = true;
    } else {
      propHeight = `double.infinity`;
    }
  }

  return { width: propWidth, height: propHeight, isExpanded };
};
