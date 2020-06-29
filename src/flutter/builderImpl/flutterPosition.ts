import {
  AltSceneNode,
  AltTextNode,
} from "../../altNodes/altMixins";

export const flutterPosition = (
  node: AltSceneNode,
  child: string,
  parentId: string
): string => {
  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (!node.parent || parentId === node.parent.id) {
    return child;
  }

  // check if view is in a stack. Group and Frames must have more than 1 element
  if (
    (node.parent.type === "GROUP" && node.parent.children.length > 1) ||
    (node.parent.type === "FRAME" &&
      node.parent.layoutMode === "NONE" &&
      node.parent.children.length > 1)
  ) {
    // [--x--][-width-][--x--]
    // that's how the formula below works, to see if view is centered
    const centerX = 2 * node.x + node.width === node.parent.width;
    const centerY = 2 * node.y + node.height === node.parent.height;

    const positionedAlign = (align: string) =>
      `Positioned.fill(child: Align(alingment: Alingment.${align}, child: ${child}),),`;

    if (centerX && centerY) {
      return `Positioned.fill(child: Center(child: ${child}),),`;
    } else if (centerX) {
      if (node.y === 0) {
        // y = top, x = center
        return positionedAlign(`topCenter`);
      } else if (node.y === node.parent.height) {
        // y = bottom, x = center
        return positionedAlign(`bottomCenter`);
      }
      // y = any, x = center
      // there is no Alignment for this, therefore it goes to manual mode.
      // since we are using return, manual mode will be calculated at the end
    } else if (centerY) {
      if (node.x === 0) {
        // y = center, x = left
        return positionedAlign(`centerLeft`);
      } else if (node.x === node.parent.width) {
        // y = center, x = right
        return positionedAlign(`centerRight`);
      }
      // y = center, x = any
      // there is no Alignment for this, therefore it goes to manual mode.
    }

    // manual mode, just use the position.
    return `Positioned(left: ${node.x}, top: ${node.y}, child: ${child}),`;
  }

  return child;
};
