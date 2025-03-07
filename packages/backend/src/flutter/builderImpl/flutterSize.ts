import { nodeSize } from "../../common/nodeWidthHeight";
import { numberToFixedString } from "../../common/numToAutoFixed";

// Used in tests.
export const flutterSizeWH = (node: SceneNode): string => {
  const fSize = flutterSize(node, false);
  const size = fSize.width + fSize.height;
  return size;
};

export const flutterSize = (
  node: SceneNode,
  optimizeLayout: boolean,
): { width: string; height: string; isExpanded: boolean; constraints: Record<string, string> } => {
  const size = nodeSize(node, optimizeLayout);
  let isExpanded: boolean = false;

  const nodeParent =
    (node.parent && optimizeLayout && "inferredAutoLayout" in node.parent
      ? node.parent.inferredAutoLayout
      : null) ?? node.parent;

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    propWidth = numberToFixedString(size.width);
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
    propHeight = numberToFixedString(size.height);
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

  // Handle min/max constraints
  const constraints: Record<string, string> = {};
  
  if (node.minWidth !== undefined && node.minWidth !== null) {
    constraints.minWidth = numberToFixedString(node.minWidth);
  }
  
  if (node.maxWidth !== undefined && node.maxWidth !== null) {
    constraints.maxWidth = numberToFixedString(node.maxWidth);
  }
  
  if (node.minHeight !== undefined && node.minHeight !== null) {
    constraints.minHeight = numberToFixedString(node.minHeight);
  }
  
  if (node.maxHeight !== undefined && node.maxHeight !== null) {
    constraints.maxHeight = numberToFixedString(node.maxHeight);
  }

  return { width: propWidth, height: propHeight, isExpanded, constraints };
};
