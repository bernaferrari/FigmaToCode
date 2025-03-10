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

  // No position when parent is inferred auto layout.
  // if (
  //   optimizeLayout &&
  //   node.parent &&
  //   "layoutMode" in node.parent &&
  //   node.parent.inferredAutoLayout !== null
  // ) {
  //   return false;
  // }

  if (!node.parent || node.parent === undefined) {
    return false;
  }

  const parentLayoutIsNone =
    "layoutMode" in node.parent && node.parent.layoutMode === "NONE";
  const hasNoLayoutMode = !("layoutMode" in node.parent);

  if (parentLayoutIsNone || hasNoLayoutMode) {
    return true;
  }

  return false;
};
