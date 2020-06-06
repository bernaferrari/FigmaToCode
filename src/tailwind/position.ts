import { pxToLayoutSize } from "./conversion_tables";
import { CustomNodeMap, AffectedByCustomAutoLayout } from "./custom_node";

const paddingFromCenter = (node: SceneNode): string => {
  if (node.parent && "width" in node.parent) {
    let comp = "";

    const nodeCenteredPosX = node.x + node.width / 2;

    // if parent is Frame, X should be 0.
    const parentCenteredPosX =
      ("layoutMode" in node.parent ? 0 : node.parent.x) + node.parent.width / 2;

    const marginX = nodeCenteredPosX - parentCenteredPosX;

    if (marginX > 0) {
      comp += `ml-${pxToLayoutSize(marginX)} `;
    } else if (marginX < 0) {
      // abs is necessary because [pxToLayoutSize] only receives a positive number
      comp += `mr-${pxToLayoutSize(Math.abs(marginX))} `;
    }

    const nodeCenteredPosY = node.y + node.height / 2;

    // if parent is Frame, X should be 0.
    const parentCenteredPosY =
      ("layoutMode" in node.parent ? 0 : node.parent.y) +
      node.parent.height / 2;

    const marginY = nodeCenteredPosY - parentCenteredPosY;
    if (marginY > 0) {
      comp += `mt-${pxToLayoutSize(marginY)} `;
    } else if (marginY < 0) {
      // abs is necessary because [pxToLayoutSize] only receives a positive number
      comp += `mb-${pxToLayoutSize(Math.abs(marginY))} `;
    }

    return comp;
  }
  return "";
};

const flexSelfFromCenter = (node: SceneNode): string => {
  if (!node.parent) {
    return "";
  }

  const parent = CustomNodeMap[node.parent.id].largestNode;

  if (parent && "width" in parent) {
    let comp = "";

    if (CustomNodeMap[node.parent.id].customAutoLayoutDirection === "sd-y") {
      const nodeCenteredPosX = node.x + node.width / 2;

      // if parent is Frame, X should be 0.
      const parentCenteredPosX =
        ("layoutMode" in parent ? 0 : parent.x) + parent.width / 2;

      const marginX = nodeCenteredPosX - parentCenteredPosX;

      // allow a small threshold as rounding error
      if (marginX > 2) {
        comp += `self-end `;
      } else if (marginX < -2) {
        // abs is necessary because [pxToLayoutSize] only receives a positive number
        comp += `self-start `;
      }
    } else {
      const nodeCenteredPosY = node.y + node.height / 2;

      // if parent is Frame, X should be 0.
      const parentCenteredPosY =
        ("layoutMode" in node.parent ? 0 : parent.y) + parent.height / 2;

      const marginY = nodeCenteredPosY - parentCenteredPosY;

      console.log("nodeY: ", node.y, " -- nodeH: ", node.height);
      console.log("parentY: ", parent.y, " -- parentH: ", parent.height);
      console.log(AffectedByCustomAutoLayout);
      console.log(CustomNodeMap);

      // allow a small threshold as rounding error
      if (marginY > 2) {
        comp += `self-start `;
      } else if (marginY < -2) {
        // abs is necessary because [pxToLayoutSize] only receives a positive number
        comp += `self-end `;
      }
    }

    return comp;
  }
  return "";
};

export const retrieveContainerPosition = (
  node: SceneNode,
  parentId: string
): string => {
  const parent = node.parent;

  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (parent === null || parentId === parent.id) {
    return "";
  }

  // if node is a Group and has only one child, ignore it; child will set the size
  if (
    parent.type === "GROUP" &&
    parent.children.length === 1 &&
    parent.width === node.width &&
    parent.height === node.height
  ) {
    return "";
  }

  if (AffectedByCustomAutoLayout[node.id] === "changed") {
    const customPadding = paddingFromCenter(node);
    return customPadding;
    // return `inline-flex items-center justify-center ${customPadding}`;
  }

  if (AffectedByCustomAutoLayout[node.id] === "child") {
    return flexSelfFromCenter(node);
  }

  // if parent and node are same size
  // but what if it needs to center the child?
  if (
    "width" in parent &&
    parent.width === node.width &&
    parent.height === node.height
  ) {
    return "";
  }

  if (node.parent && CustomNodeMap[node.parent?.id]?.isCustomAutoLayout) {
    // when in AutoAutoLayout, it is inside a Flex, therefore the position doesn't matter
    return "";
  }

  if (AffectedByCustomAutoLayout[node.id] === "parent") {
    const customPadding = paddingFromCenter(node);
    // center child
    return `inline-flex items-center justify-center ${customPadding}`;
  }

  console.log("isAffected: ", AffectedByCustomAutoLayout[node.id]);

  // if node was a Rect and now is a Frame containing other items
  // or if node is a child of that rect
  if (AffectedByCustomAutoLayout[node.id]) {
    return "";
  }

  if (AffectedByCustomAutoLayout[parent.id]) {
    // todo first thing tomorrow
    return "";
  }

  if (
    parent.type === "GROUP" ||
    ("layoutMode" in parent &&
      parent.layoutMode === "NONE" &&
      parent.children.length > 1) ||
    ("children" in node &&
      "width" in parent &&
      node.children.every((d) => d.type === "VECTOR"))
  ) {
    // when parent is GROUP or FRAME, try to position the node in it
    // check if view is in a stack. Group and Frames must have more than 1 element
    // [--x--][-width-][--x--]
    // that's how the formula below works, to see if view is centered

    // this is needed for Groups, where node.x is not relative to zero. This is ignored for Frame.
    // todo transform these into a helper function
    const parentX = "layoutMode" in parent ? 0 : parent.x;
    const parentY = "layoutMode" in parent ? 0 : parent.y;

    // < 4 is a threshold. If === is used, there can be rounding errors (28.002 !== 28)
    const centerX =
      Math.abs(2 * (node.x - parentX) + node.width - parent.width) < 4;
    const centerY =
      Math.abs(2 * (node.y - parentY) + node.height - parent.height) < 4;

    // if (centerY) {
    //   // this was the only I could manage to center a div with absolute
    //   // https://stackoverflow.com/a/59807846

    //   // frame don't need to be centered
    //   return "h-full flex items-center ";
    // }

    if (centerX && centerY) {
      const size = node.type === "TEXT" ? "w-full h-full " : "";
      return `${size}absolute inset-0 m-auto `;
    } else if (centerX) {
      if (node.y === 0) {
        // y = top, x = center
        return "mt-0 mb-auto mx-auto ";
      } else if (node.y === parent.height) {
        // y = bottom, x = center
        return "mt-auto mb-0 mx-auto ";
      }
      // y = any, x = center
      // there is no Alignment for this, therefore it goes to manual mode.
      // since we are using return, manual mode will be calculated at the end
    } else if (centerY) {
      if (node.x === 0) {
        // y = center, x = left
        return "my-auto ml-0 mr-auto ";
      } else if (node.x === parent.width) {
        // y = center, x = right
        return "my-auto ml-auto mr-0 ";
      }
      // y = center, x = any
      // there is no Alignment for this, therefore it goes to manual mode.
    }

    // set the width to max if the view is near the corner
    // that will be complemented with margins from [retrieveContainerPosition]
    if (parent.type === "GROUP" || "layoutMode" in parent) {
      const sizeConverter = (attr: string, num: number): string => {
        const result = pxToLayoutSize(num);
        if (+result > 0) {
          return `${attr}-${result} `;
        }
        return "";
      };

      // when inside autoAutoLayout, mx will be useless (self-align will determine this)
      // todo calculate the margin together with spacing, so that items can be individually offseted

      // let prop = "";
      // this is necessary because Group uses relative position, while Frame is absolute
      // const parentX = parent.type === "GROUP" ? parent.x : 0;
      // const parentY = parent.type === "GROUP" ? parent.y : 0;

      //   const autoAutoLayout = isInsideAutoAutoLayout(parent);
      //   if (autoAutoLayout[0] === "sd-y" || "layoutMode" in node) {
      //     // centerX threshold
      //     // width - (40 - 0) * 2 + nodeWidth is zero when centered

      //     const mx = parent.width - ((node.x - parentX) * 2 + node.width);
      //     if (mx < 4 && mx > -4) {
      //       prop += sizeConverter("mx", node.x - parentX);
      //     } else {
      //       if (node.x - parentX > 0 && node.x - parentX < magicMargin) {
      //         prop += sizeConverter("ml", node.x - parentX);
      //       }
      //       if (parent.width - (node.x - parentX + node.width) < magicMargin) {
      //         prop += sizeConverter("mr", parent.width - node.x - node.width);
      //       }
      //     }
      //   }

      //   if (autoAutoLayout[0] === "sd-x" || "layoutMode" in node) {
      //     autoAutoLayout[1];

      //     // centerY threshold
      //     const my = parent.height - ((node.y - parentY) * 2 + node.height);
      //     if (my < 4 && my > -4) {
      //       prop += sizeConverter("my", node.y - parentY);
      //     } else {
      //       const mt = node.y - parentY;
      //       if (mt > 0 && mt < magicMargin) {
      //         prop += sizeConverter("mt", node.y - parentY);
      //       }
      //       const mb = parent.height - (node.y - parentY + node.height);
      //       if (mb < magicMargin) {
      //         prop += sizeConverter("mb", mb);
      //       }
      //     }
      //   }
      //   if (prop) {
      //     return prop;
      //   }
      //   // when inside an autoAutoLayout, there is no need to get the absolute position
      //   return "";
      // }
    }

    // manual mode, just use the position.
    return "absoluteManualLayout";
  }

  return "";
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
