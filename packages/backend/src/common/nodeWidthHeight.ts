import { Size } from "types";

export const nodeSize = (node: SceneNode): Size => {
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

  return { width: node.width, height: node.height };
};
