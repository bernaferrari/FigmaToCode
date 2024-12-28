import { CornerRadius } from "types";

export const getCommonRadius = (node: SceneNode): CornerRadius => {
  if (
    "cornerRadius" in node &&
    node.cornerRadius !== figma.mixed &&
    node.cornerRadius
  ) {
    return { all: node.cornerRadius };
  }

  if ("topLeftRadius" in node) {
    if (
      node.topLeftRadius === node.topRightRadius &&
      node.topLeftRadius === node.bottomRightRadius &&
      node.topLeftRadius === node.bottomLeftRadius
    ) {
      return { all: node.topLeftRadius };
    }

    return {
      topLeft: node.topLeftRadius,
      topRight: node.topRightRadius,
      bottomRight: node.bottomRightRadius,
      bottomLeft: node.bottomLeftRadius,
    };
  }

  return { all: 0 };
};
