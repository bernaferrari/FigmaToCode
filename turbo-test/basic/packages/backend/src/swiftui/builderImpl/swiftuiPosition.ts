import { AltSceneNode } from "../../altNodes/altMixins";
import { numToAutoFixed } from "../../common/numToAutoFixed";
import { parentCoordinates } from "../../common/parentCoordinates";

export const swiftuiPosition = (
  node: AltSceneNode,
  parentId: string = ""
): string => {
  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (!node.parent || parentId === node.parent.id) {
    return "";
  }

  // check if view is in a stack. Group and Frames must have more than 1 element
  if (node.parent.isRelative === true) {
    const [parentX, parentY] = parentCoordinates(node.parent);

    const parentCenterX = parentX + node.parent.width / 2;
    const parentCenterY = parentY + node.parent.height / 2;

    const pointX = node.x - parentX + node.width / 2;
    const pointY = node.y - parentY + node.height / 2;

    // verify if items are centered, with a small threshold.
    // use abs because they can be negative.
    if (
      Math.abs(parentCenterX - pointX) < 2 &&
      Math.abs(parentCenterY - pointY) < 2
    ) {
      return "";
    } else {
      const x = numToAutoFixed(pointX - parentCenterX);
      const y = numToAutoFixed(pointY - parentCenterY);
      return `\n.offset(x: ${x}, y: ${y})`;
    }
  }

  return "";
};
