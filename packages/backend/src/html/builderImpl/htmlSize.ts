import { nodeSize } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";
import { isPreviewGlobal } from "../htmlMain";

export const htmlSizePartial = (
  node: SceneNode,
  isJsx: boolean,
  optimizeLayout: boolean,
): { width: string; height: string } => {
  if (isPreviewGlobal && node.parent === undefined) {
    return {
      width: formatWithJSX("width", isJsx, "100%"),
      height: formatWithJSX("height", isJsx, "100%"),
    };
  }

  const size = nodeSize(node, optimizeLayout);
  const nodeParent =
    (node.parent && optimizeLayout && "inferredAutoLayout" in node.parent
      ? node.parent.inferredAutoLayout
      : null) ?? node.parent;

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
      w = formatWithJSX("align-self", isJsx, "stretch");
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
      h = formatWithJSX("align-self", isJsx, "stretch");
    }
  }

  return { width: w, height: h };
};
