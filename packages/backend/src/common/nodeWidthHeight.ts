type SizeResult = {
  readonly width: "fill" | number | null;
  readonly height: "fill" | number | null;
};

export const nodeSize = (node: SceneNode): SizeResult => {
  const hasLayout =
    "layoutAlign" in node && node.parent && "layoutMode" in node.parent;

  if (!hasLayout || ("layoutMode" in node && node.layoutMode === "NONE")) {
    return { width: node.width, height: node.height };
  }

  const parentLayoutMode = node.parent.layoutMode;
  // const parentLayoutMode = optimizeLayout
  //   ? node.parent.inferredAutoLayout?.layoutMode
  //   : null ?? node.parent.layoutMode;

  // const nodeAuto =
  //   (optimizeLayout && "inferredAutoLayout" in node
  //     ? node.inferredAutoLayout
  //     : null) ?? node;

  const isWidthFill =
    (parentLayoutMode === "HORIZONTAL" && node.layoutGrow === 1) ||
    (parentLayoutMode === "VERTICAL" && node.layoutAlign === "STRETCH");
  const isHeightFill =
    (parentLayoutMode === "HORIZONTAL" && node.layoutAlign === "STRETCH") ||
    (parentLayoutMode === "VERTICAL" && node.layoutGrow === 1);
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
