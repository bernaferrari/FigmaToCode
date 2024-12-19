import { pxToLayoutSize } from "../conversionTables";
import { PluginSettings } from "../../code";

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

const getAlignItems = (node: InferredAutoLayoutResult, settings: PluginSettings): string => {
  const prefix = settings?.tailwindPrefix || "";
  switch (node.counterAxisAlignItems) {
    case "MIN":
      return `${prefix}items-start`;
    case "CENTER":
      return `${prefix}items-center`;
    case "MAX":
      return `${prefix}items-end`;
    case "BASELINE":
      return `${prefix}items-baseline`;
  }
};

const getGap = (node: InferredAutoLayoutResult, settings: PluginSettings): string => {
  const prefix = settings?.tailwindPrefix || "";
  return node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? `${prefix}gap-${pxToLayoutSize(node.itemSpacing)}`
    : "";
};

const getFlex = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
  settings: PluginSettings,
): string => {
  const prefix = settings?.tailwindPrefix || "";
  return node.parent &&
    "layoutMode" in node.parent &&
    node.parent.layoutMode === autoLayout.layoutMode
    ? `${prefix}flex`
    : `${prefix}inline-flex`;
};

export const tailwindAutoLayoutProps = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
  settings: PluginSettings,
): string =>
  Object.values({
    flexDirection: getFlexDirection(autoLayout),
    justifyContent: getJustifyContent(autoLayout),
    alignItems: getAlignItems(autoLayout, settings),
    gap: getGap(autoLayout, settings),
    flex: getFlex(node, autoLayout, settings),
  })
    .filter((value) => value !== "")
    .join(" ");
