export const getMainAxisAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  switch (node.primaryAxisAlignItems) {
    case undefined:
    case "MIN":
      return "Arrangement.Start";
    case "CENTER":
      return "Arrangement.Center";
    case "MAX":
      return "Arrangement.End";
    case "SPACE_BETWEEN":
      return "Arrangement.SpaceBetween";
    default:
      return "Arrangement.Start";
  }
};

export const getCrossAxisAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  // For Row (horizontal layout), cross axis is vertical
  // For Column (vertical layout), cross axis is horizontal
  if (node.layoutMode === "HORIZONTAL") {
    switch (node.counterAxisAlignItems) {
      case undefined:
      case "MIN":
        return "Alignment.Top";
      case "CENTER":
        return "Alignment.CenterVertically";
      case "MAX":
        return "Alignment.Bottom";
      case "BASELINE":
        return "Alignment.CenterVertically"; // Compose doesn't have baseline alignment for Row
      default:
        return "Alignment.Top";
    }
  } else {
    // VERTICAL layout mode
    switch (node.counterAxisAlignItems) {
      case undefined:
      case "MIN":
        return "Alignment.Start";
      case "CENTER":
        return "Alignment.CenterHorizontally";
      case "MAX":
        return "Alignment.End";
      case "BASELINE":
        return "Alignment.CenterHorizontally"; // Baseline not applicable for Column
      default:
        return "Alignment.Start";
    }
  }
};

export const getWrapAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  switch (node.primaryAxisAlignItems) {
    case undefined:
    case "MIN":
      return "Arrangement.Start";
    case "CENTER":
      return "Arrangement.Center";
    case "MAX":
      return "Arrangement.End";
    case "SPACE_BETWEEN":
      return "Arrangement.SpaceBetween";
    default:
      return "Arrangement.Start";
  }
};

export const getWrapRunAlignment = (
  node: InferredAutoLayoutResult,
): string => {
  if (node.counterAxisAlignContent === "SPACE_BETWEEN") {
    return "Arrangement.SpaceBetween";
  }
  
  // For FlowRow/FlowColumn, the cross axis alignment depends on layout mode
  if (node.layoutMode === "HORIZONTAL") {
    // FlowRow - vertical alignment
    switch (node.counterAxisAlignItems) {
      case undefined:
      case "MIN":
        return "Arrangement.Top";
      case "CENTER":
      case "BASELINE":
        return "Arrangement.Center";
      case "MAX":
        return "Arrangement.Bottom";
      default:
        return "Arrangement.Top";
    }
  } else {
    // FlowColumn - horizontal alignment
    switch (node.counterAxisAlignItems) {
      case undefined:
      case "MIN":
        return "Arrangement.Start";
      case "CENTER":
      case "BASELINE":
        return "Arrangement.Center";
      case "MAX":
        return "Arrangement.End";
      default:
        return "Arrangement.Start";
    }
  }
};