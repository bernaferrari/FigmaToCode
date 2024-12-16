import { pxToLayoutSize } from "../conversionTables";

const getFlexDirection = (node: InferredAutoLayoutResult): string =>
  node.layoutMode === "HORIZONTAL" ? "" : "flex-col";

const getJustifyContent = (node: InferredAutoLayoutResult): string => {
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

const getAlignItems = (node: InferredAutoLayoutResult): string => {
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

const getGap = (node: InferredAutoLayoutResult): string =>
  node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? `gap-${pxToLayoutSize(node.itemSpacing)}`
    : "";

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
