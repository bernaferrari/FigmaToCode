import {
  AltRectangleNode,
  AltFrameNode,
  AltGroupNode,
  AltSceneNode,
} from "./altMixins";
import { convertToAutoLayout } from "./convertToAutoLayout";

/**
 * Identify all nodes that are inside Rectangles and transform those Rectangles into Frames containing those nodes.
 */
export const convertNodesOnRectangle = (
  node: AltFrameNode | AltGroupNode
): AltFrameNode | AltGroupNode => {
  if (node.children.length < 2) {
    return node;
  }
  if (!node.id) {
    throw new Error(
      "Node is missing an id! This error should only happen in tests."
    );
  }

  const colliding = retrieveCollidingItems(node.children);

  const parentsKeys = Object.keys(colliding);
  // start with all children. This is going to be filtered.
  let updatedChildren: Array<AltSceneNode> = [...node.children];

  parentsKeys.forEach((key) => {
    // dangerous cast, but this is always true
    const parentNode = node.children.find(
      (d) => d.id === key
    ) as AltRectangleNode;

    // retrieve the position. Key should always be at the left side, so even when other items are removed, the index is kept the same.
    const indexPosition = updatedChildren.findIndex((d) => d.id === key);

    // filter the children to remove those that are being modified
    updatedChildren = updatedChildren.filter(
      (d) => !colliding[key].map((dd) => dd.id).includes(d.id) && key !== d.id
    );

    const frameNode = convertRectangleToFrame(parentNode);

    // todo when the soon-to-be-parent is larger than its parent, things get weird. Happens, for example, when a large image is used in the background. Should this be handled or is this something user should never do?

    frameNode.children = [...colliding[key]];
    colliding[key].forEach((d) => {
      d.parent = frameNode;
      d.x = d.x - frameNode.x;
      d.y = d.y - frameNode.y;
    });

    // try to convert the children to AutoLayout, and insert back at updatedChildren.
    updatedChildren.splice(indexPosition, 0, convertToAutoLayout(frameNode));
  });

  if (updatedChildren.length > 0) {
    node.children = updatedChildren;
  }

  // convert the resulting node to AutoLayout.
  node = convertToAutoLayout(node);

  return node;
};

const convertRectangleToFrame = (rect: AltRectangleNode) => {
  // if a Rect with elements inside were identified, extract this Rect
  // outer methods are going to use it.

  const frameNode = new AltFrameNode();

  frameNode.parent = rect.parent;

  frameNode.width = rect.width;
  frameNode.height = rect.height;
  frameNode.x = rect.x;
  frameNode.y = rect.y;
  frameNode.rotation = rect.rotation;
  frameNode.layoutMode = "NONE";

  // opacity should be ignored, else it will affect children

  // when invisible, add the layer but don't fill it; he designer might use invisible layers for alignment.
  // visible can be undefined in tests
  if (rect.visible !== false) {
    frameNode.fills = rect.fills;
    frameNode.fillStyleId = rect.fillStyleId;

    frameNode.strokes = rect.strokes;
    frameNode.strokeStyleId = rect.strokeStyleId;

    frameNode.effects = rect.effects;
    frameNode.effectStyleId = rect.effectStyleId;
  }

  // inner Rectangle shall get a FIXED size
  frameNode.counterAxisSizingMode = "FIXED";

  frameNode.strokeAlign = rect.strokeAlign;
  frameNode.strokeCap = rect.strokeCap;
  frameNode.strokeJoin = rect.strokeJoin;
  frameNode.strokeMiterLimit = rect.strokeMiterLimit;
  frameNode.strokeWeight = rect.strokeWeight;

  frameNode.cornerRadius = rect.cornerRadius;
  frameNode.cornerSmoothing = rect.cornerSmoothing;
  frameNode.topLeftRadius = rect.topLeftRadius;
  frameNode.topRightRadius = rect.topRightRadius;
  frameNode.bottomLeftRadius = rect.bottomLeftRadius;
  frameNode.bottomRightRadius = rect.bottomRightRadius;

  frameNode.id = rect.id;
  frameNode.name = rect.name;

  return frameNode;
};

/**
 * Iterate over each Rectangle and check if it has any child on top.
 * This is O(n^2), but is optimized to only do j=i+1 until length, and avoid repeated entries.
 * A Node can only have a single parent. The order is defined by layer order.
 */
const retrieveCollidingItems = (
  children: ReadonlyArray<AltSceneNode>
): Record<string, Array<AltSceneNode>> => {
  const used: Record<string, boolean> = {};
  const groups: Record<string, Array<AltSceneNode>> = {};

  for (let i = 0; i < children.length - 1; i++) {
    const item1 = children[i];

    // ignore items that are not Rectangles
    if (item1.type !== "RECTANGLE") {
      continue;
    }

    for (let j = i + 1; j < children.length; j++) {
      const item2 = children[j];

      if (
        !used[item2.id] &&
        item1.x <= item2.x &&
        item1.y <= item2.y &&
        item1.x + item1.width >= item2.x + item2.width &&
        item1.y + item1.height >= item2.y + item2.height
      ) {
        if (!groups[item1.id]) {
          groups[item1.id] = [item2];
        } else {
          groups[item1.id].push(item2);
        }
        used[item2.id] = true;
      }
    }
  }

  return groups;
};
