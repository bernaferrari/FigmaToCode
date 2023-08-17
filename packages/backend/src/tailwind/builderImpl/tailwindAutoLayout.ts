import { pxToLayoutSize } from "../conversionTables";

const getFlexDirection = (node: inferredAutoLayoutResult): string =>
  node.layoutMode === "HORIZONTAL" ? "" : "flex-col";

const getJustifyContent = (node: inferredAutoLayoutResult): string => {
  switch (node.primaryAxisAlignItems) {
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

const getAlignItems = (node: inferredAutoLayoutResult): string => {
  switch (node.counterAxisAlignItems) {
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

const getGap = (node: inferredAutoLayoutResult): string =>
  node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? `gap-${pxToLayoutSize(node.itemSpacing)}`
    : "";

const getFlex = (
  node: SceneNode,
  autoLayout: inferredAutoLayoutResult
): string =>
  node.parent &&
  "layoutMode" in node.parent &&
  node.parent.layoutMode === autoLayout.layoutMode
    ? "flex"
    : "inline-flex";

export const tailwindAutoLayoutProps = (
  node: SceneNode,
  autoLayout: inferredAutoLayoutResult
): string =>
  Object.values({
    flexDirection: getFlexDirection(autoLayout),
    justifyContent: getJustifyContent(autoLayout),
    alignItems: getAlignItems(autoLayout),
    gap: getGap(autoLayout),
    flex: getFlex(node, autoLayout),
  })
    .filter((value) => value !== "")
    .join(" ");
