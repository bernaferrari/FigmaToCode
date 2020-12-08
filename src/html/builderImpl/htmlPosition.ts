import { AltSceneNode } from "../../altNodes/altMixins";

export const htmlPosition = (
  node: AltSceneNode,
  parentId: string = ""
): string => {
  // don't add position to the first (highest) node in the tree
  if (!node.parent || parentId === node.parent.id) {
    return "";
  }

  // Group
  if (node.parent.isRelative === true) {
    // position is absolute, needs to be relative
    return "absoluteManualLayout";
  }

  return "";
};
