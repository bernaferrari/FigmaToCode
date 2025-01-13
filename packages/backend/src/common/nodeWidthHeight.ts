import { Size, SizeValue } from "types";

export const nodeSize = (node: SceneNode, optimizeLayout: boolean): Size => {
  const n = node as LayoutMixin;
  const mapMode: Record<typeof n.layoutSizingHorizontal, SizeValue> = {
    FILL: "fill",
    HUG: null,
    FIXED: 0,
  };
  const wMode = mapMode[n.layoutSizingHorizontal ?? "FIXED"];
  const hMode = mapMode[n.layoutSizingVertical ?? "FIXED"];

  let width: SizeValue = n.width;
  let height: SizeValue = n.height;

  if (wMode === null || wMode === "fill") {
    width = wMode;
  }
  if (hMode === null || hMode === "fill") {
    height = hMode;
  }

  return { width, height };

  const hasLayout =
    "layoutAlign" in node && node.parent && "layoutMode" in node.parent;

  if (!hasLayout) {
    return { width: node.width, height: node.height };
  }

  const nodeAuto =
    (optimizeLayout && "inferredAutoLayout" in node
      ? node.inferredAutoLayout
      : null) ?? node;

  if ("layoutMode" in nodeAuto && nodeAuto.layoutMode === "NONE") {
    return { width: node.width, height: node.height };
  }

  // const parentLayoutMode = node.parent.layoutMode;
  const parentLayoutMode = optimizeLayout
    ? node.parent.inferredAutoLayout?.layoutMode
    : node.parent.layoutMode;

  const isWidthFill =
    (parentLayoutMode === "HORIZONTAL" && nodeAuto.layoutGrow === 1) ||
    (parentLayoutMode === "VERTICAL" && nodeAuto.layoutAlign === "STRETCH");
  const isHeightFill =
    (parentLayoutMode === "HORIZONTAL" && nodeAuto.layoutAlign === "STRETCH") ||
    (parentLayoutMode === "VERTICAL" && nodeAuto.layoutGrow === 1);
  const modesSwapped = parentLayoutMode === "HORIZONTAL";
  const primaryAxisMode = modesSwapped
    ? "counterAxisSizingMode"
    : "primaryAxisSizingMode";
  const counterAxisMode = modesSwapped
    ? "primaryAxisSizingMode"
    : "counterAxisSizingMode";

  return {
    width: isWidthFill
      ? "fill"
      : "layoutMode" in nodeAuto && nodeAuto[primaryAxisMode] === "AUTO"
        ? null
        : node.width,
    height: isHeightFill
      ? "fill"
      : "layoutMode" in nodeAuto && nodeAuto[counterAxisMode] === "AUTO"
        ? null
        : node.height,
  };
};
