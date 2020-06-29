import { AltSceneNode } from "../../altNodes/altMixins";

export const tailwindPosition = (
  node: AltSceneNode,
  parentId: string
): string => {
  // don't add position to the first (highest) node in the tree
  if (!node.parent || parentId === node.parent.id) {
    return "";
  }

  // Group
  if (
    node.parent.type === "GROUP" ||
    ("layoutMode" in node.parent && node.parent.layoutMode === "NONE")
  ) {
    // position is absolute, needs to be relative
    return retrieveAbsolutePos(node);
  }

  // Frame, Instance, Component
  if ("layoutMode" in node.parent && node.parent.layoutMode !== "NONE") {
    if (node.layoutAlign === "MAX") {
      return "self-end ";
    } else if (node.layoutAlign === "MIN") {
      return "self-start ";
    }
    // STRETCH or CENTER are already centered by the parent
  }

  return "";
};

// this was extracted because is going to be used by both FRAMEs and GROUPs
const retrieveAbsolutePos = (node: AltSceneNode): string => {
  // if node is same size as height, position is not necessary

  if (
    !node.parent ||
    (node.width === node.parent.width && node.height === node.parent.height)
  ) {
    return "";
  }

  // position is absolute, parent is relative
  // return "absolute inset-0 m-auto ";

  const parentX = "layoutMode" in node.parent ? 0 : node.parent.x;
  const parentY = "layoutMode" in node.parent ? 0 : node.parent.y;

  // < 4 is a threshold. If === is used, there can be rounding errors (28.002 !== 28)
  const centerX =
    Math.abs(2 * (node.x - parentX) + node.width - node.parent.width) < 8;
  const centerY =
    Math.abs(2 * (node.y - parentY) + node.height - node.parent.height) < 8;

  const minX = node.x - parentX < 8;
  const minY = node.y - parentY < 8;

  const maxX = node.parent.width - (node.x - parentX + node.width) < 8;
  const maxY = node.parent.height - (node.y - parentY + node.height) < 8;

  if (centerX && centerY) {
    return "absolute m-auto inset-0 ";
  }

  if (centerX) {
    if (minY) {
      // x center, y top
      return "absolute inset-x-0 top-0 mx-auto ";
    }
    if (maxY) {
      // x center, y bottom
      return "absolute inset-x-0 bottom-0 mx-auto ";
    }
  } else if (centerY) {
    if (minX) {
      // x left, y center
      return "absolute inset-y-0 left-0 my-auto ";
    }
    if (maxX) {
      // x right, y center
      return "absolute inset-y-0 right-0 my-auto ";
    }
  }

  if (minX && minY) {
    // x left, y left
    return "absolute left-0 top-0 ";
  } else if (minX && maxY) {
    // x left, y bottom
    return "absolute left-0 bottom-0 ";
  } else if (maxX && minY) {
    // x right, y top
    return "absolute right-0 top-0 ";
  } else if (maxX && maxY) {
    // x right, y bottom
    return "absolute right-0 bottom-0 ";
  }

  return "absoluteManualLayout";
};
