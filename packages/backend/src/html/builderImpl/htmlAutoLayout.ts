import { formatMultipleJSXArray } from "../../common/parseJSX";

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

const getGap = (node: InferredAutoLayoutResult): string | number =>
  node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? node.itemSpacing
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

export const htmlAutoLayoutProps = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
  isJsx: boolean,
): string[] =>
  formatMultipleJSXArray(
    {
      "flex-direction": getFlexDirection(autoLayout),
      "justify-content": getJustifyContent(autoLayout),
      "align-items": getAlignItems(autoLayout),
      gap: getGap(autoLayout),
      display: getFlex(node, autoLayout),
    },
    isJsx,
  );
