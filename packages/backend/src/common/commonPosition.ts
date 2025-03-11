export const getCommonPositionValue = (
  node: SceneNode,
): { x: number; y: number } => {
  if (node.parent && node.parent.type === "GROUP") {
    return {
      x: node.x - node.parent.x,
      y: node.y - node.parent.y,
    };
  }

  return {
    x: node.x,
    y: node.y,
  };
};

export const commonIsAbsolutePosition = (node: SceneNode) => {
  if ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE") {
    return true;
  }

  if (!node.parent || node.parent === undefined) {
    return false;
  }

  if (
    ("layoutMode" in node.parent && node.parent.layoutMode === "NONE") ||
    !("layoutMode" in node.parent)
  ) {
    return true;
  }

  return false;
};
