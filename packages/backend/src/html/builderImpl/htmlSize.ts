import { nodeSize } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";
import { isPreviewGlobal } from "../htmlMain";
import { getProp, hasProp } from "../../common/utils";

type Size = {
  width: string
  height: string
  shrink: string
}

export const htmlSizePartial = (
  node: SceneNode,
  isJsx: boolean,
  optimizeLayout: boolean
): Size => {
  // variables
  const parent = node.parent;

  if (isPreviewGlobal && parent === undefined) {
    return {
      width: formatWithJSX("width", isJsx, "100%"),
      height: formatWithJSX("height", isJsx, "100%"),
      shrink: "",
    };
  }

  // variables
  const size = nodeSize(node, optimizeLayout);
  const layoutMode = getProp(node.parent as AutoLayoutMixin | undefined, 'layoutMode')
  const isWrap = hasProp(parent, "layoutWrap", "WRAP");

  // variables
  let width = "";
  let height = "";
  let shrink = "";

  // width
  if (typeof size.width === "number") {
    width = formatWithJSX("width", isJsx, size.width);
  } else if (size.width === "fill") {
    if (layoutMode === "HORIZONTAL") {
      width = formatWithJSX("flex", isJsx, "1 1 0");
    } else {
      width = formatWithJSX("align-self", isJsx, "stretch");
    }
  }

  // height
  if (typeof size.height === "number") {
    height = formatWithJSX("height", isJsx, size.height);
  } else if (typeof size.height === "string") {
    if (layoutMode === "VERTICAL") {
      height = formatWithJSX("flex", isJsx, "1 1 0");
    } else {
      height = formatWithJSX("align-self", isJsx, "stretch");
    }
  }

  // shrink
  if (layoutMode && !isWrap && (typeof size.height === "number" || typeof size.width === "number")) {
    shrink = 'flex-shrink: 0';
  }

  return { width, height, shrink };
};
