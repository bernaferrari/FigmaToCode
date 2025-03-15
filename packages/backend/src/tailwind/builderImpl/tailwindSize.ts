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
    const converted = pxToLayoutSize(size.width);
    w = `w-${converted}`;
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
    const converted = pxToLayoutSize(size.height);
    h = `h-${converted}`;
  } else if (size.height === "fill") {
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "VERTICAL"
    ) {
      h = `grow shrink basis-0`;
    } else {
      h = `self-stretch`;
    }
  }

  // If both width and height are fixed number classes and they have the same value,
  // combine them into a single "size-XX" class.
  if (w.startsWith("w-") && h.startsWith("h-")) {
    const wValue = w.substring(2);
    const hValue = h.substring(2);
    if (wValue === hValue) {
      return { width: `size-${wValue}`, height: "" };
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
