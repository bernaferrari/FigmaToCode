export const getMainAxisAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  switch (node.primaryAxisAlignItems) {
    case "MIN":
      return "MainAxisAlignment.start";
    case "CENTER":
      return "MainAxisAlignment.center";
    case "MAX":
      return "MainAxisAlignment.end";
    case "SPACE_BETWEEN":
      return "MainAxisAlignment.spaceBetween";
  }
};

export const getCrossAxisAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  switch (node.counterAxisAlignItems) {
    case "MIN":
      return "CrossAxisAlignment.start";
    case "CENTER":
      return "CrossAxisAlignment.center";
    case "MAX":
      return "CrossAxisAlignment.end";
    case "BASELINE":
      return "CrossAxisAlignment.baseline";
  }
};

const getFlex = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
): string =>
  node.parent &&
  "layoutMode" in node.parent &&
  node.parent.layoutMode === autoLayout.layoutMode
    ? "MainAxisSize.max"
    : "MainAxisSize.min";
