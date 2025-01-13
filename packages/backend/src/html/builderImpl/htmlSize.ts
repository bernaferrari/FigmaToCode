import { ParentNode, SizeValue } from "types";
import { nodeSize } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";
import { isPreviewGlobal } from "../htmlMain";

const getStyleForSize = (
  isJsx: boolean,
  property: string,
  value: SizeValue,
  optimizeLayout: boolean,
  parent: ParentNode | InferredAutoLayoutResult | null,
): string => {
  if (typeof value === "number") {
    return formatWithJSX(property, isJsx, Number(value) + "px");
  }

  if (value === "fill") {
    if (parent === null || optimizeLayout === false)
      return formatWithJSX(property, isJsx, "100%");
    if (
      "layoutMode" in parent &&
      ((property === "width" && parent.layoutMode === "HORIZONTAL") ||
        (property === "height" && parent.layoutMode === "VERTICAL"))
    ) {
      return formatWithJSX("flex", isJsx, "1 1 0");
    } else {
      return formatWithJSX("align-self", isJsx, "stretch");
    }
  }

  // Else, presume it's null which is like width:"auto"
  return "";
};

export const htmlSizePartial = (
  node: SceneNode,
  isJsx: boolean,
  optimizeLayout: boolean,
): {
  width: string;
  height: string;
  maxWidth: string;
  maxHeight: string;
  overflow: string;
  shrink: string;
} => {
  const size = nodeSize(node, optimizeLayout);

  let parent: InferredAutoLayoutResult | ParentNode | null =
    node.parent !== null &&
    "inferredAutoLayout" in node.parent &&
    node.parent.inferredAutoLayout !== null
      ? node.parent.inferredAutoLayout
      : node.parent;

  let width = getStyleForSize(
    isJsx,
    "width",
    size.width,
    optimizeLayout,
    parent,
  );
  let height = getStyleForSize(
    isJsx,
    "height",
    size.height,
    optimizeLayout,
    parent,
  );

  let overflow = "";
  if ("clipsContent" in node) {
    overflow = formatWithJSX(
      "overflow",
      isJsx,
      node.clipsContent ? "hidden" : "visible",
    );
  }

  const maxWidth =
    node.maxWidth === null
      ? ""
      : formatWithJSX("max-width", isJsx, Number(node.maxWidth) + "px");
  const maxHeight =
    node.maxHeight === null
      ? ""
      : formatWithJSX("max-height", isJsx, Number(node.maxHeight + "px"));

  const shrink =
    parent === null ? "" : formatWithJSX("flex-shrink", isJsx, "0");

  return { width, height, maxWidth, maxHeight, overflow, shrink };
};
