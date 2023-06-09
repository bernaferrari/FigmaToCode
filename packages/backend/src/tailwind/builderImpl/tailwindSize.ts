import { pxToLayoutSize } from "../conversionTables";
import { nodeSize } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";

export const tailwindSizePartial = (
  node: SceneNode,
  optimizeLayout: boolean
): { width: string; height: string } => {
  const size = nodeSize(node, optimizeLayout);

  let w = "";
  if (typeof size.width === "number") {
    w = `w-${pxToLayoutSize(size.width)}`;
  } else if (size.width === "fill") {
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "HORIZONTAL"
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
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "VERTICAL"
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
  isJSX: boolean
): [string, string] => {
  return [
    formatWithJSX("width", isJSX, node.width),
    formatWithJSX("height", isJSX, node.height),
  ];
};
