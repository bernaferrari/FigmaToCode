import {
  AltRectangleNode,
  AltFrameNode,
  AltGroupNode,
  AltSceneNode,
} from "./altMixins";
import { convertGroupToFrame } from "./convertGroupToFrame";

// Return the updated node
export const convertNodeIfChildIsBigRect = (
  node: AltFrameNode | AltGroupNode
): AltFrameNode | AltGroupNode => {
  const rect = identifyRectAsBackground(node.children);

  // if a Rect with elements inside were identified, extract this Rect
  // outer methods are going to use it.
  if (rect) {
    let updatedNode: AltFrameNode;

    // if node is GROUP, must be converted to FRAME
    if (node.type === "GROUP") {
      updatedNode = convertGroupToFrame(node);
    } else {
      // if node is FRAME, just override with Rect properties
      updatedNode = node;
    }

    updatedNode.children = node.children.filter((d) => d !== rect);

    // ignore fill if it isn't visible
    // visible can be undefinied in tests
    if (rect.visible !== false) {
      updatedNode.fills = rect.fills;
      updatedNode.fillStyleId = rect.fillStyleId;

      updatedNode.strokes = rect.strokes;
      updatedNode.strokeStyleId = rect.strokeStyleId;

      updatedNode.effects = rect.effects;
      updatedNode.effectStyleId = rect.effectStyleId;
    }

    // inner Rectangle shall get a FIXED size
    updatedNode.counterAxisSizingMode = "FIXED";

    updatedNode.strokeAlign = rect.strokeAlign;
    updatedNode.strokeCap = rect.strokeCap;
    updatedNode.strokeJoin = rect.strokeJoin;
    updatedNode.strokeMiterLimit = rect.strokeMiterLimit;
    updatedNode.strokeWeight = rect.strokeWeight;

    updatedNode.cornerRadius = rect.cornerRadius;
    updatedNode.cornerSmoothing = rect.cornerSmoothing;
    updatedNode.topLeftRadius = rect.topLeftRadius;
    updatedNode.topRightRadius = rect.topRightRadius;
    updatedNode.bottomLeftRadius = rect.bottomLeftRadius;
    updatedNode.bottomRightRadius = rect.bottomRightRadius;

    updatedNode.id = rect.id;
    updatedNode.name = rect.name;

    return updatedNode;
  }

  return node;
};

const identifyRectAsBackground = (
  children: ReadonlyArray<AltSceneNode>
): AltRectangleNode | undefined => {
  // needs at least two items (rect in bg and something else in fg)
  if (children.length < 2) {
    return undefined;
  }

  const maxH = Math.max(...children.map((d) => d.height));
  const maxW = Math.max(...children.map((d) => d.width));
  const largestChild = children.find(
    (d) => d.width === maxW && d.height === maxH
  );

  if (!largestChild) {
    return undefined;
  }

  const childrenInside = isChildInsideNodeArea(largestChild, children);

  if (childrenInside && largestChild.type === "RECTANGLE") {
    return largestChild;
  } else {
    return undefined;
  }
};

const isChildInsideNodeArea = (
  node: AltSceneNode,
  children: ReadonlyArray<AltSceneNode>
) => {
  return children.every((child) => {
    if (child === node) {
      return true;
    }

    return (
      child.x >= node.x &&
      child.y >= node.y &&
      child.x + child.width - node.x <= node.width &&
      child.y + child.height - node.y <= node.height
    );
  });
};
