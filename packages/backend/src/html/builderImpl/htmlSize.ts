import { nodeSize } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";
import { isPreviewGlobal } from "../htmlMain";

export const htmlSizePartial = (
  node: SceneNode,
  isJsx: boolean,
): { width: string; height: string; constraints: string[] } => {
  if (isPreviewGlobal && node.parent === undefined) {
    return {
      width: formatWithJSX("width", isJsx, "100%"),
      height: formatWithJSX("height", isJsx, "100%"),
      constraints: [],
    };
  }

  const size = nodeSize(node);
  const nodeParent = node.parent;

  let w = "";
  if (typeof size.width === "number") {
    w = formatWithJSX("width", isJsx, size.width);
  } else if (size.width === "fill") {
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "HORIZONTAL"
    ) {
      w = formatWithJSX("flex", isJsx, "1 1 0");
    } else {
      if (node.maxWidth) {
        w = formatWithJSX("width", isJsx, "100%");
      } else {
        w = formatWithJSX("align-self", isJsx, "stretch");
      }
    }
  }

  let h = "";
  if (typeof size.height === "number") {
    h = formatWithJSX("height", isJsx, size.height);
  } else if (typeof size.height === "string") {
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "VERTICAL"
    ) {
      h = formatWithJSX("flex", isJsx, "1 1 0");
    } else {
      if (node.maxHeight) {
        h = formatWithJSX("height", isJsx, "100%");
      } else {
        h = formatWithJSX("align-self", isJsx, "stretch");
      }
    }
  }

  // Handle min/max width/height constraints
  const constraints = [];

  if (node.maxWidth !== undefined && node.maxWidth !== null) {
    constraints.push(formatWithJSX("max-width", isJsx, node.maxWidth));
  }

  if (node.minWidth !== undefined && node.minWidth !== null) {
    constraints.push(formatWithJSX("min-width", isJsx, node.minWidth));
  }

  if (node.maxHeight !== undefined && node.maxHeight !== null) {
    constraints.push(formatWithJSX("max-height", isJsx, node.maxHeight));
  }

  if (node.minHeight !== undefined && node.minHeight !== null) {
    constraints.push(formatWithJSX("min-height", isJsx, node.minHeight));
  }

  // Return constraints separately instead of appending to width/height
  return {
    width: w,
    height: h,
    constraints: constraints,
  };
};
