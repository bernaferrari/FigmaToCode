import { Size } from "types";

export const nodeSize = (node: SceneNode, optimizeLayout: boolean): Size => {
  if ("layoutSizingHorizontal" in node && "layoutSizingVertical" in node) {
    const width =
      node.layoutSizingHorizontal === "FILL"
        ? "fill"
        : node.layoutSizingHorizontal === "HUG"
          ? null
          : node.width;

    const height =
      node.layoutSizingVertical === "FILL"
        ? "fill"
        : node.layoutSizingVertical === "HUG"
          ? null
          : node.height;

    return { width, height };
  }

  const nodeAuto =
    (optimizeLayout && "inferredAutoLayout" in node
      ? node.inferredAutoLayout
      : null) ?? node;

  if (
    nodeAuto &&
    typeof nodeAuto === "object" &&
    "layoutMode" in nodeAuto &&
    nodeAuto.layoutMode === "NONE"
  ) {
    return { width: node.width, height: node.height };
  }

  const hasLayout =
    "layoutAlign" in node && node.parent && "layoutMode" in node.parent;

  if (!hasLayout) {
    return { width: node.width, height: node.height };
  }

  return { width: node.width, height: node.height };

  // const isWidthFill =
  //   (parentLayoutMode === "HORIZONTAL" && nodeAuto.layoutGrow === 1) ||
  //   (parentLayoutMode === "VERTICAL" && nodeAuto.layoutAlign === "STRETCH");
  // const isHeightFill =
  //   (parentLayoutMode === "HORIZONTAL" && nodeAuto.layoutAlign === "STRETCH") ||
  //   (parentLayoutMode === "VERTICAL" && nodeAuto.layoutGrow === 1);
  // const modesSwapped = parentLayoutMode === "HORIZONTAL";
  // const primaryAxisMode = modesSwapped
  //   ? "counterAxisSizingMode"
  //   : "primaryAxisSizingMode";
  // const counterAxisMode = modesSwapped
  //   ? "primaryAxisSizingMode"
  //   : "counterAxisSizingMode";

  // return {
  //   width: isWidthFill
  //     ? "fill"
  //     : "layoutMode" in nodeAuto && nodeAuto[primaryAxisMode] === "AUTO"
  //       ? null
  //       : node.width,
  //   height: isHeightFill
  //     ? "fill"
  //     : "layoutMode" in nodeAuto && nodeAuto[counterAxisMode] === "AUTO"
  //       ? null
  //       : node.height,
};
