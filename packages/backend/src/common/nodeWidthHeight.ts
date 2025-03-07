import { Size } from "types";

export const nodeSize = (node: SceneNode, optimizeLayout: boolean): Size => {
  const nodeAuto =
    (optimizeLayout && "inferredAutoLayout" in node
      ? node.inferredAutoLayout
      : null) ?? node;

  // Check for explicit layout sizing properties
  if (
    "layoutSizingHorizontal" in nodeAuto &&
    "layoutSizingVertical" in nodeAuto
  ) {
    const width =
      nodeAuto.layoutSizingHorizontal === "FILL"
        ? "fill"
        : nodeAuto.layoutSizingHorizontal === "HUG"
          ? null
          : node.width;

    const height =
      nodeAuto.layoutSizingVertical === "FILL"
        ? "fill"
        : nodeAuto.layoutSizingVertical === "HUG"
          ? null
          : node.height;

    return { width, height };
  }

  if ("layoutMode" in nodeAuto && nodeAuto.layoutMode === "NONE") {
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
