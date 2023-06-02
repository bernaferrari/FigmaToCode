type BorderSideType =
  | { all: number }
  | {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };

export const commonStroke = (node: SceneNode): BorderSideType | null => {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    return null;
  }

  if ("strokeTopWeight" in node) {
    return {
      left: node.strokeLeftWeight,
      top: node.strokeTopWeight,
      right: node.strokeRightWeight,
      bottom: node.strokeBottomWeight,
    };
  } else if (node.strokeWeight !== figma.mixed && node.strokeWeight !== 0) {
    return { all: node.strokeWeight };
  }

  return null;
};
