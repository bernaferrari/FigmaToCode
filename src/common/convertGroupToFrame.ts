import { AltSceneNode, AltFrameNode, AltGroupNode } from "./altMixins";

export const convertGroupToFrame = (node: AltGroupNode): AltFrameNode => {
  const newNode = new AltFrameNode();

  newNode.id = node.id;
  newNode.name = node.name;

  newNode.x = node.x;
  newNode.y = node.y;
  newNode.width = node.width;
  newNode.height = node.height;
  newNode.rotation = node.rotation;

  newNode.fills = [];
  newNode.strokes = [];
  newNode.effects = [];
  newNode.cornerRadius = 0;

  newNode.layoutMode = "NONE";
  newNode.counterAxisSizingMode = "AUTO";

  newNode.parent = node.parent;
  newNode.children = node.children;

  newNode.children.forEach((d) => {
    // update the parent of each child
    d.parent = newNode;
  });

  const updatedNode = updateChildrenXY(node);

  // don't need to take care of newNode.parent.children because method is recursive.
  // node is hopefully going to be eliminated from the memory here.
  //
  // .children =... calls convertGroupToFrame() which returns the correct node

  // this condition should always be true
  if (updatedNode.type === "FRAME") {
    return updatedNode;
  }

  return newNode;
};

/**
 * Recursively update all children's X and Y value from a Group.
 * Group uses relative values, while Frame use absolute. So child.x - group.x = child.x on Frames.
 *
 * This must be called with a GroupNode. Param accepts anything because of the recurison.
 * Result of a Group with x,y = (250, 250) and child at (260, 260) must be child at (10, 10)
 */
const updateChildrenXY = (node: AltSceneNode): AltSceneNode => {
  if (node.type === "GROUP") {
    node.children.forEach((d) => {
      d.x = d.x - node.x;
      d.y = d.y - node.y;
      updateChildrenXY(d);
    });
    return node;
  } else {
    return node;
  }
};
