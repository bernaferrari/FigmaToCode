export const getMainAxisAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  switch (node.primaryAxisAlignItems) {
    case undefined:
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
    case undefined:
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

export const getWrapAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  switch (node.primaryAxisAlignItems) {
    case undefined:
    case "MIN":
      return "WrapAlignment.start";
    case "CENTER":
      return "WrapAlignment.center";
    case "MAX":
      return "WrapAlignment.end";
    case "SPACE_BETWEEN":
      return "WrapAlignment.spaceBetween";
  }
};

export const getWrapRunAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  if (node.counterAxisAlignContent == "SPACE_BETWEEN") {
    return "WrapAlignment.spaceBetween";
  }
  switch (node.counterAxisAlignItems) {
    case undefined:
    case "MIN":
      return "WrapAlignment.start";
    case "CENTER":
    case "BASELINE":
      return "WrapAlignment.center";
    case "MAX":
      return "WrapAlignment.end";
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
