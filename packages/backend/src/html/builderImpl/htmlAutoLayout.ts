import { formatMultipleJSXArray } from "../../common/parseJSX";
import { hasProp, MapInterface } from "../../common/utils";


const getFlexDirection = (node: InferredAutoLayoutResult): string =>
  node.layoutMode === "HORIZONTAL" ? "" : "column";

const getJustifyContent = (node: InferredAutoLayoutResult): string => {
  switch (node.primaryAxisAlignItems) {
    case "MIN":
      return "flex-start";
    case "CENTER":
      return "center";
    case "MAX":
      return "flex-end";
    case "SPACE_BETWEEN":
      return "space-between";
  }
};

const getAlignItems = (node: InferredAutoLayoutResult): string => {
  switch (node.counterAxisAlignItems) {
    case "MIN":
      return "flex-start";
    case "CENTER":
      return "center";
    case "MAX":
      return "flex-end";
    case "BASELINE":
      return "baseline";
  }
};

const getAlignContent = (node: InferredAutoLayoutResult): string => {
  switch (node.primaryAxisAlignItems) {
    case "MIN":
      return "flex-start";
    case "CENTER":
      return "center";
    case "MAX":
      return "flex-end";
    default:
      return "";
  }
};

const getGap = (node: InferredAutoLayoutResult): string | number => {
  return node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? node.itemSpacing
    : "";
};

const getFlex = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult
): string =>
  node.parent &&
  "layoutMode" in node.parent &&
  node.parent.layoutMode === autoLayout.layoutMode
    ? "flex"
    : "inline-flex";

const getFlexWrap = (node: SceneNode) =>
  "layoutWrap" in node && node.layoutWrap === "WRAP"
    ? "wrap"
    : "";

export const htmlAutoLayoutProps = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
  isJsx: boolean
): string[] => {
  const wrap = getFlexWrap(node);
  const align = wrap ? "align-content" : "align-items";
  const props = {
    display: getFlex(node, autoLayout),
    "flex-direction": getFlexDirection(autoLayout),
    "justify-content": getJustifyContent(autoLayout),
    [align]: getAlignItems(autoLayout),
    "flex-wrap": wrap,
    gap: getGap(autoLayout),
  }
  return formatMultipleJSXArray(props, isJsx);
};

