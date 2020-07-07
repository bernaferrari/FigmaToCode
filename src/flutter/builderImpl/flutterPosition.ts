import { AltSceneNode } from "../../altNodes/altMixins";
import { commonPosition } from "../../common/commonPosition";

export const flutterPosition = (
  node: AltSceneNode,
  child: string,
  parentId: string = ""
): string => {
  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (!node.parent || parentId === node.parent.id) {
    return child;
  }

  // check if view is in a stack. Group and Frames must have more than 1 element
  if (node.parent.isRelative === true) {
    return retrieveAbsolutePos(node, child);
  }

  return child;
};

const retrieveAbsolutePos = (node: AltSceneNode, child: string): string => {
  const positionedAlign = (align: string) =>
    `Positioned.fill(child: Align(alingment: Alingment.${align}, child: ${child}),),`;

  switch (commonPosition(node)) {
    case "":
      return "";
    case "Absolute":
      return `Positioned(left: ${node.x}, top: ${node.y}, child: ${child}),`;
    case "TopStart":
      return positionedAlign("topLeft");
    case "TopCenter":
      return positionedAlign("topCenter");
    case "TopEnd":
      return positionedAlign("topRight");
    case "CenterStart":
      return positionedAlign("centerLeft");
    case "Center":
      return positionedAlign("center");
    case "CenterEnd":
      return positionedAlign("centerRight");
    case "BottomStart":
      return positionedAlign("bottomLeft");
    case "BottomCenter":
      return positionedAlign("bottomCenter");
    case "BottomEnd":
      return positionedAlign("bottomRight");
  }
};
