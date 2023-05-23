import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";
import { isPreviewGlobal } from "../htmlMain";

export const htmlSizePartial = (
  node: SceneNode,
  isJsx: boolean
): { width: string; height: string } => {
  if (isPreviewGlobal && node.parent === undefined) {
    return {
      width: formatWithJSX("width", isJsx, "100%"),
      height: formatWithJSX("height", isJsx, "100%"),
    };
  }

  const size = nodeWidthHeight(node, false);

  let w = "";
  if (typeof size.width === "number") {
    w += formatWithJSX("width", isJsx, size.width);
  } else if (size.width === "full") {
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "HORIZONTAL"
    ) {
      w += formatWithJSX("flex", isJsx, "1 1 0%");
    } else {
      w += formatWithJSX("width", isJsx, "100%");
    }
  }

  let h = "";
  if (typeof size.height === "number") {
    h += formatWithJSX("height", isJsx, size.height);
  } else if (typeof size.height === "string") {
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "VERTICAL"
    ) {
      h += formatWithJSX("flex", isJsx, "1 1 0%");
    } else {
      h += formatWithJSX("height", isJsx, "100%");
    }
  }

  return { width: w, height: h };
};
