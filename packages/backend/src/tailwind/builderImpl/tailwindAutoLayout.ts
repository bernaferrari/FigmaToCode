import { pxToLayoutSize } from "../conversionTables";

const getFlexDirection = (node: InferredAutoLayoutResult): string =>
  node.layoutMode === "HORIZONTAL" ? "" : "flex-col";

const getJustifyContent = (node: InferredAutoLayoutResult): string => {
  switch (node.primaryAxisAlignItems) {
    case undefined:
    case "MIN":
      return "justify-start";
    case "CENTER":
      return "justify-center";
    case "MAX":
      return "justify-end";
    case "SPACE_BETWEEN":
      return "justify-between";
  }
};

const getAlignItems = (node: InferredAutoLayoutResult): string => {
  switch (node.counterAxisAlignItems) {
    case undefined:
    case "MIN":
      return "items-start";
    case "CENTER":
      return "items-center";
    case "MAX":
      return "items-end";
    case "BASELINE":
      return "items-baseline";
  }
};

const getGap = (node: InferredAutoLayoutResult): string =>
  node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? `gap-${pxToLayoutSize(node.itemSpacing)}`
    : "";

const getFlexWrap = (node: InferredAutoLayoutResult): string =>
  node.layoutWrap === "WRAP" ? "flex-wrap" : "";

const getAlignContent = (node: InferredAutoLayoutResult): string => {
  if (node.layoutWrap !== "WRAP") return "";

  switch (node.counterAxisAlignItems) {
    case undefined:
    case "MIN":
      return "content-start";
    case "CENTER":
      return "content-center";
    case "MAX":
      return "content-end";
    case "BASELINE":
      return "content-baseline";
    default:
      return "content-normal";
  }
};

const getFlex = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
): string =>
  node.parent &&
  "layoutMode" in node.parent &&
  node.parent.layoutMode === autoLayout.layoutMode
    ? "flex"
    : "inline-flex";

export const tailwindAutoLayoutProps = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
): string => {
  const classes = [
    getFlex(node, autoLayout),
    getFlexDirection(autoLayout),
    getJustifyContent(autoLayout),
    getAlignItems(autoLayout),
    getGap(autoLayout),
    getFlexWrap(autoLayout),
    getAlignContent(autoLayout),
  ].filter(Boolean);

  return classes.join(" ");
};
