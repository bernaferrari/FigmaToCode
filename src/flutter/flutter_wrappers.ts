export const wrapOpacity = (node: BlendMixin, child: string): string => {
  if (node.opacity !== 1) {
    return `Opacity(
      opacity: ${node.opacity},
      child: ${child}
      ),`;
  }
  return child;
};

export const wrapVisibility = (node: SceneNode, child: string): string => {
  if (!node.visible) {
    return `Visibility(
      visible: ${node.visible},
      child: ${child}
      ),`;
  }
  return child;
};

// that's how you convert angles to clockwise radians: angle * -pi/180
// using 3.14159 as Pi for enough precision and to avoid importing math lib.
export const wrapRotation = (node: LayoutMixin, child: string): string => {
  if (node.rotation > 0) {
    return `Transform.rotate(angle: ${
      node.rotation * (-3.14159 / 180)
    }, child: ${child})`;
  }
  return child;
};

export const wrapContainerPosition = (
  node: SceneNode,
  child: string,
  parentId: string
): string => {
  const parent = node.parent;

  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (parent === null || parentId === parent.id) {
    return child;
  }

  // check if view is in a stack. Group and Frames must have more than 1 element
  if (
    (parent.type === "GROUP" && parent.children.length > 1) ||
    ((parent.type === "FRAME" ||
      parent.type === "INSTANCE" ||
      parent.type === "COMPONENT") &&
      parent.layoutMode === "NONE" &&
      parent.children.length > 1)
  ) {
    // [--x--][-width-][--x--]
    // that's how the formula below works, to see if view is centered
    const centerX = 2 * node.x + node.width === parent.width;
    const centerY = 2 * node.y + node.height === parent.height;

    const positionedAlign = (align: string) =>
      `Positioned.fill(child: Align(alingment: Alingment.${align}, child: ${child}),),`;

    if (centerX && centerY) {
      return `Positioned.fill(child: Center(child: ${child}),),`;
    } else if (centerX) {
      if (node.y === 0) {
        // y = top, x = center
        return positionedAlign(`topCenter`);
      } else if (node.y === parent.height) {
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
      } else if (node.x === parent.width) {
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

export const wrapTextAutoResize = (node: TextNode, child: string): string => {
  if (node.textAutoResize === "NONE") {
    // = instead of += because we want to replace it
    return `
        SizedBox(
          width: ${node.width},
          height: ${node.height},
          child: ${child}
        ),
        `;
  } else if (node.textAutoResize === "HEIGHT") {
    // if HEIGHT is set, it means HEIGHT will be calculated automatically, but width won't
    // = instead of += because we want to replace it
    return `
        SizedBox(
          width: ${node.width},
          child: ${child}
        ),
        `;
  }

  return child;
};

export const wrapTextInsideAlign = (node: TextNode, child: string): string => {
  let alignment;
  if (node.layoutAlign === "CENTER") {
    if (node.textAlignHorizontal === "LEFT") alignment = "centerLeft";
    if (node.textAlignHorizontal === "RIGHT") alignment = "centerRight";
    if (node.textAlignHorizontal === "CENTER") alignment = "center";
    // no support for justified yet
  } else if (node.layoutAlign === "MAX") {
    if (node.textAlignHorizontal === "LEFT") alignment = "leftBottom";
    if (node.textAlignHorizontal === "RIGHT") alignment = "rightBottom";
    if (node.textAlignHorizontal === "CENTER") alignment = "centerBottom";
  }
  // [node.layoutAlign === "MIN"] is the default, so no need to specify it.
  if (!alignment) alignment = "center";

  // there are many ways to align a text
  if (node.textAlignVertical === "BOTTOM" && node.textAutoResize === "NONE") {
    alignment = "bottomCenter";
  }

  if (
    node.layoutAlign !== "MIN" ||
    (node.textAlignVertical === "BOTTOM" && node.textAutoResize === "NONE")
  ) {
    return `
      Align(
        alignment: Alignment.${alignment},
        child: ${child}
      ),`;
  }
  return child;
};
