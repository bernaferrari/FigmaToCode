import { nodeSize } from "../../common/nodeWidthHeight";
import { sliceNum } from "../../common/numToAutoFixed";

// Used in tests.
export const flutterSizeWH = (node: SceneNode): string => {
  const fSize = flutterSize(node, false);
  const size = fSize.width + fSize.height;
  return size;
};

export const flutterSize = (
  node: SceneNode,
  optimizeLayout: boolean,
): { width: string; height: string; isExpanded: boolean } => {
  const size = nodeSize(node, optimizeLayout);
  let isExpanded: boolean = false;

  const nodeParent =
    (node.parent && optimizeLayout && "inferredAutoLayout" in node.parent
      ? node.parent.inferredAutoLayout
      : null) ?? node.parent;

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    propWidth = sliceNum(size.width);
  } else if (size.width === "fill") {
    // When parent is a Row, child must be Expanded.
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "HORIZONTAL"
    ) {
      isExpanded = true;
    } else {
      propWidth = `double.infinity`;
    }
  }

  let propHeight = "";
  if (typeof size.height === "number") {
    propHeight = sliceNum(size.height);
  } else if (size.height === "fill") {
    // When parent is a Column, child must be Expanded.
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "VERTICAL"
    ) {
      isExpanded = true;
    } else {
      propHeight = `double.infinity`;
    }
  }

  return { width: propWidth, height: propHeight, isExpanded };
};
