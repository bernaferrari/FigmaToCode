import { pxToLayoutSize } from "../conversionTables";
import { nodeSize } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";

export const tailwindSizePartial = (
  node: SceneNode,
  optimizeLayout: boolean,
): { width: string; height: string } => {
  const size = nodeSize(node, optimizeLayout);

  const nodeParent =
    (node.parent && optimizeLayout && "inferredAutoLayout" in node.parent
      ? node.parent.inferredAutoLayout
      : null) ?? node.parent;

  let w = "";
  if (
    typeof size.width === "number" &&
    "layoutSizingHorizontal" in node &&
    node.layoutSizingHorizontal === "FIXED"
  ) {
    w = `w-${pxToLayoutSize(size.width)}`;
  } else if (size.width === "fill") {
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "HORIZONTAL"
    ) {
      w = `grow shrink basis-0`;
    } else {
      w = `self-stretch`;
    }
  }

  let h = "";
  if (typeof size.height === "number") {
    h = `h-${pxToLayoutSize(size.height)}`;
  } else if (size.height === "fill") {
    if (
      size.height === "fill" &&
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "VERTICAL"
    ) {
      h = `grow shrink basis-0`;
    } else {
      h = `self-stretch`;
    }
  }

  return { width: w, height: h };
};

export const htmlSizePartialForTailwind = (
  node: SceneNode,
  isJSX: boolean,
): [string, string] => {
  return [
    formatWithJSX("width", isJSX, node.width),
    formatWithJSX("height", isJSX, node.height),
  ];
};
