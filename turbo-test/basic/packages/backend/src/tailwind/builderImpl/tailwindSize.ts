import { pxToLayoutSize } from "../conversionTables";
import { nodeWidthHeightTailwind } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";

export const tailwindSizePartial = (
  node: SceneNode
): { width: string; height: string } => {
  const size = nodeWidthHeightTailwind(node, true);

  let w = "";
  if (typeof size.width === "number") {
    w += `w-${pxToLayoutSize(size.width)}`;
  } else if (typeof size.width === "string") {
    if (
      size.width === "full" &&
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "HORIZONTAL"
    ) {
      w += `flex-1`;
    } else {
      w += `w-${size.width}`;
    }
  }

  let h = "";

  if (typeof size.height === "number") {
    h = `h-${pxToLayoutSize(size.height)}`;
  } else if (typeof size.height === "string") {
    if (
      size.height === "full" &&
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "VERTICAL"
    ) {
      h += `flex-1`;
    } else {
      h += `h-${size.height}`;
    }
  }

  return { width: w, height: h };
};

/**
 * https://www.w3schools.com/css/css_dimension.asp
 */
export const htmlSizeForTailwind = (
  node: SceneNode,
  isJSX: boolean
): string => {
  return htmlSizePartialForTailwind(node, isJSX).join("");
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
