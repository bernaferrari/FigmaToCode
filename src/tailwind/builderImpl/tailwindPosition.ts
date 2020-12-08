import { AltSceneNode } from "../../altNodes/altMixins";
import { commonPosition } from "../../common/commonPosition";

export const tailwindPosition = (
  node: AltSceneNode,
  parentId: string = "",
  hasFixedSize: boolean = false
): string => {
  // don't add position to the first (highest) node in the tree
  if (!node.parent || parentId === node.parent.id) {
    return "";
  }

  // Group
  if (node.parent.isRelative === true) {
    // position is absolute, needs to be relative
    return retrieveAbsolutePos(node, hasFixedSize);
  }

  return "";
};

const retrieveAbsolutePos = (
  node: AltSceneNode,
  hasFixedSize: boolean
): string => {
  // everything related to Center requires a defined width and height. Therefore, we use hasFixedSize.
  switch (commonPosition(node)) {
    case "":
      return "";
    case "Absolute":
      return "absoluteManualLayout";
    case "TopCenter":
      if (hasFixedSize) {
        return "absolute inset-x-0 top-0 mx-auto ";
      }
      return "absoluteManualLayout";
    case "CenterStart":
      if (hasFixedSize) {
        return "absolute inset-y-0 left-0 my-auto ";
      }
      return "absoluteManualLayout";
    case "Center":
      if (hasFixedSize) {
        return "absolute m-auto inset-0 ";
      }
      return "absoluteManualLayout";
    case "CenterEnd":
      if (hasFixedSize) {
        return "absolute inset-y-0 right-0 my-auto ";
      }
      return "absoluteManualLayout";
    case "BottomCenter":
      if (hasFixedSize) {
        return "absolute inset-x-0 bottom-0 mx-auto ";
      }
      return "absoluteManualLayout";
    case "TopStart":
      return "absolute left-0 top-0 ";
    case "TopEnd":
      return "absolute right-0 top-0 ";
    case "BottomStart":
      return "absolute left-0 bottom-0 ";
    case "BottomEnd":
      return "absolute right-0 bottom-0 ";
  }
};
