import { commonPosition } from "../../common/commonPosition";
import { generateWidgetCode, sliceNum } from "../../common/numToAutoFixed";
import { parentCoordinates } from "../../common/parentCoordinates";

export const flutterPosition = (
  node: SceneNode,
  child: string,
  parentId: string = ""
): string => {
  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (!node.parent || parentId === node.parent.id || child === "") {
    return child;
  }

  // check if view is in a stack. Group and Frames must have more than 1 element
  // if (node.parent.isRelative === true) {
  const pos = retrieveAbsolutePos(node, child);
  if (pos !== "Absolute") {
    return pos;
  } else {
    const parentNode = node.parent;
    if (!("x" in parentNode)) {
      return child;
    }
    // this is necessary because Group have absolute position, while Frame is relative.
    // output is always going to be relative to the parent.
    const [parentX, parentY] = parentCoordinates(parentNode);

    const diffX = sliceNum(node.x - parentX);
    const diffY = sliceNum(node.y - parentY);

    return generateWidgetCode("Positioned", {
      left: diffX,
      top: diffY,
      child: child,
    });
  }
  // }

  return child;
};

const retrieveAbsolutePos = (node: SceneNode, child: string): string => {
  const positionedAlign = (align: string) => {
    return generateWidgetCode("Positioned.fill", {
      child: generateWidgetCode("Align", {
        alignment: `Alignment.${align}`,
        child: child,
      }),
    });
  };

  switch (commonPosition(node)) {
    case "":
      return child;
    case "Absolute":
      return "Absolute";
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
