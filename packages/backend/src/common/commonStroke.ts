type BorderSideType =
  | { all: number }
  | {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };

export const commonStroke = (node: SceneNode, divideBy: number = 1): BorderSideType | null => {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    return null;
  }

  if ("strokeTopWeight" in node) {
    if (
      node.strokeTopWeight === node.strokeBottomWeight &&
      node.strokeTopWeight === node.strokeLeftWeight &&
      node.strokeTopWeight === node.strokeRightWeight
    ) {
      return { all: node.strokeTopWeight / divideBy };
    }

    return {
      left: node.strokeLeftWeight / divideBy,
      top: node.strokeTopWeight / divideBy,
      right: node.strokeRightWeight / divideBy,
      bottom: node.strokeBottomWeight / divideBy,
    };
  } else if (node.strokeWeight !== figma.mixed && node.strokeWeight !== 0) {
    return { all: node.strokeWeight / divideBy };
  }

  return null;
};
