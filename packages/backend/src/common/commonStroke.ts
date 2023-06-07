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
      left: node.strokeLeftWeight / 2,
      top: node.strokeTopWeight / 2,
      right: node.strokeRightWeight / 2,
      bottom: node.strokeBottomWeight / 2,
    };
  } else if (node.strokeWeight !== figma.mixed && node.strokeWeight !== 0) {
    return { all: node.strokeWeight / 2 };
  }

  return null;
};
