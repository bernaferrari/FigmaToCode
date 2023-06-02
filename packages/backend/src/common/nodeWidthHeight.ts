type SizeResult = {
  readonly width: "fill" | number | null;
  readonly height: "fill" | number | null;
};

export const nodeSize = (node: SceneNode): SizeResult => {
  const hasLayout =
    "layoutAlign" in node && node.parent && "layoutMode" in node.parent;
  const parentLayoutMode = hasLayout ? node.parent.layoutMode : null;
  const isWidthFill =
    hasLayout &&
    ((parentLayoutMode === "HORIZONTAL" && node.layoutGrow === 1) ||
      (parentLayoutMode === "VERTICAL" && node.layoutAlign === "STRETCH"));
  const isHeightFill =
    hasLayout &&
    ((parentLayoutMode === "HORIZONTAL" && node.layoutAlign === "STRETCH") ||
      (parentLayoutMode === "VERTICAL" && node.layoutGrow === 1));
  const modesSwapped = hasLayout && parentLayoutMode === "HORIZONTAL";
  const primaryAxisMode =
    hasLayout && modesSwapped
      ? "counterAxisSizingMode"
      : "primaryAxisSizingMode";
  const counterAxisMode =
    hasLayout && modesSwapped
      ? "primaryAxisSizingMode"
      : "counterAxisSizingMode";

  return {
    width: isWidthFill
      ? "fill"
      : "layoutMode" in node && node[primaryAxisMode] === "AUTO"
      ? null
      : node.width,
    height: isHeightFill
      ? "fill"
      : "layoutMode" in node && node[counterAxisMode] === "AUTO"
      ? null
      : node.height,
  };
};
