import {
  AltLayoutMixin,
  AltFrameMixin,
  AltFrameNode,
  AltSceneNode,
} from "./../common/altMixins";
import { pxToLayoutSize } from "./conversion_tables";

const paddingFromCenter = (node: AltSceneNode): string => {
  if (node.parent && "width" in node.parent) {
    let comp = "";

    const nodeCenteredPosX = node.x + node.width / 2;

    // if parent is Frame, X should be 0.
    const parentCenteredPosX =
      ("layoutMode" in node.parent ? 0 : node.parent.x) + node.parent.width / 2;

    const marginX = nodeCenteredPosX - parentCenteredPosX;

    if (marginX > 1) {
      comp += `ml-${pxToLayoutSize(marginX)} `;
    } else if (marginX < -1) {
      // abs is necessary because [pxToLayoutSize] only receives a positive number
      comp += `mr-${pxToLayoutSize(Math.abs(marginX))} `;
    }

    const nodeCenteredPosY = node.y + node.height / 2;

    // if parent is Frame, X should be 0.
    const parentCenteredPosY =
      ("layoutMode" in node.parent ? 0 : node.parent.y) +
      node.parent.height / 2;

    const marginY = nodeCenteredPosY - parentCenteredPosY;
    if (marginY > 1) {
      comp += `mt-${pxToLayoutSize(marginY)} `;
    } else if (marginY < -1) {
      // abs is necessary because [pxToLayoutSize] only receives a positive number
      comp += `mb-${pxToLayoutSize(Math.abs(marginY))} `;
    }

    return comp;
  }
  return "";
};

// function tailwindMargin(node: SceneNode): string {
//   const padding = findMargin(node);
//   if (padding === undefined) {
//     return "";
//   }

//   const { top, left, right, bottom } = padding;

//   if (top === bottom && top === left && top === right) {
//     return `m-${pxToLayoutSize(top)} `;
//   }

//   // is there a less verbose way of writing this?
//   let comp = "";

//   if (top === bottom && right === left) {
//     return `mx-${pxToLayoutSize(left)} py-${pxToLayoutSize(top)} `;
//   }

//   // py
//   if (top === bottom) {
//     comp += `my-${pxToLayoutSize(top)} `;
//     if (left > 0) {
//       comp += `ml-${pxToLayoutSize(left)} `;
//     }
//     if (right > 0) {
//       comp += `mr-${pxToLayoutSize(right)} `;
//     }

//     return comp;
//   }

//   // px
//   if (left === right) {
//     comp += `mx-${pxToLayoutSize(left)} `;
//     if (top > 0) {
//       comp += `mt-${pxToLayoutSize(top)} `;
//     }
//     if (bottom > 0) {
//       comp += `mb-${pxToLayoutSize(bottom)} `;
//     }
//     return comp;
//   }

//   // independent
//   if (top > 0) {
//     comp += `mt-${pxToLayoutSize(top)} `;
//   }
//   if (bottom > 0) {
//     comp += `mb-${pxToLayoutSize(bottom)} `;
//   }
//   if (left > 0) {
//     comp += `ml-${pxToLayoutSize(left)} `;
//   }
//   if (right > 0) {
//     comp += `mr-${pxToLayoutSize(right)} `;
//   }

//   return comp;
// }

// function findMargin(
//   node: SceneNode
// ):
//   | undefined
//   | {
//       top: number;
//       left: number;
//       right: number;
//       bottom: number;
//     } {
//   if (!node.parent || !("width" in node.parent)) {
//     return undefined;
//   }

//   const parentX = "layoutMode" in node.parent ? 0 : node.parent.x;
//   const parentY = "layoutMode" in node.parent ? 0 : node.parent.y;

//   if (CustomNodeMap[node.id].customAutoLayoutDirection === "sd-y") {
//     const left = node.x - parentX;
//     const right = node.parent.width - (node.width + node.x - parentX);
//     return { top: 0, left: left, right: right, bottom: 0 };
//   }

//   if (CustomNodeMap[node.id].customAutoLayoutDirection === "sd-x") {
//     const top = node.y - parentY;
//     const bottom = node.parent.height - (node.height + node.y - parentY);
//     return { top: top, left: 0, right: 0, bottom: bottom };
//   }

//   return undefined;
// }

export const retrieveContainerPosition = (
  node: AltSceneNode,
  parentId: string
): string => {
  // don't add position to the first (highest) node in the tree
  if (!node.parent || parentId === node.parent?.id) {
    return "";
  }

  // if node has only one child, ignore it; child will set the position
  // todo bring it back
  // if (
  //   "children" in node &&
  //   node.children.length === 1 &&
  //   node.width === node.children[0].width &&
  //   node.height === node.children[0].height
  // ) {
  //   return "AAA222";
  // }

  // if node is same size as height, position is not necessary
  // if (node.width === node.parent.width && node.height === node.parent.height) {
  //   return "AAA1";
  // }

  // Start FlexPos
  // Detect if parent is a CustomAutoLayout. If it is, need to set the child pos relative to it

  // Group
  if (node.parent.type === "GROUP") {
    if (node.parent.children.length === 1) {
      return paddingFromCenter(node);
    } else {
      // position is absolute, parent is relative
      return retrieveAbsolutePos(node);
    }
  }

  // Frame, Instance, Component
  if ("layoutMode" in node.parent) {
    if (node.parent.layoutMode !== "NONE") {
      if (node.layoutAlign === "MAX") {
        return "self-end ";
      } else if (node.layoutAlign === "MIN") {
        return "self-start ";
      } else {
        // for STRETCH or CENTER
        return "";
      }
    } else if (
      node.parent.layoutMode === "NONE" &&
      node.parent.children.length === 1
    ) {
      return paddingFromCenter(node);
    } else {
      return retrieveAbsolutePos(node);
    }
  }
  // if (
  //   node.parent.type === "GROUP" ||
  //   ("layoutMode" in node.parent &&
  //     node.parent.layoutMode === "NONE" &&
  //     node.parent.children.length > 1) ||
  //   ("children" in node &&
  //     "width" in node.parent &&
  //     node.children.every((d) => d.type === "VECTOR"))
  // ) {
  //   // when parent is GROUP or FRAME, try to position the node in it
  //   // check if view is in a stack. Group and Frames must have more than 1 element
  //   // [--x--][-width-][--x--]
  //   // that's how the formula below works, to see if view is centered

  //   // this is needed for Groups, where node.x is not relative to zero. This is ignored for Frame.
  //   // todo transform these into a helper function
  //   const parentX = "layoutMode" in node.parent ? 0 : node.parent.x;
  //   const parentY = "layoutMode" in node.parent ? 0 : node.parent.y;

  //   // < 4 is a threshold. If === is used, there can be rounding errors (28.002 !== 28)
  //   const centerX =
  //     Math.abs(2 * (node.x - parentX) + node.width - node.parent.width) < 4;
  //   const centerY =
  //     Math.abs(2 * (node.y - parentY) + node.height - node.parent.height) < 4;

  //   // if (centerY) {
  //   //   // this was the only I could manage to center a div with absolute
  //   //   // https://stackoverflow.com/a/59807846

  //   //   // frame don't need to be centered
  //   //   return "h-full flex items-center ";
  //   // }

  //   if (centerX && centerY) {
  //     const size = node.type === "TEXT" ? "w-full h-full " : "";
  //     return `${size}m-auto `;
  //   }
  //   // else if (centerX) {
  //   //   if (node.y === 0) {
  //   //     // y = top, x = center
  //   //     return "mt-0 mb-auto mx-auto ";
  //   //   } else if (node.y === node.parent.height) {
  //   //     // y = bottom, x = center
  //   //     return "mt-auto mb-0 mx-auto ";
  //   //   }
  //   //   // y = any, x = center
  //   //   // there is no Alignment for this, therefore it goes to manual mode.
  //   //   // since we are using return, manual mode will be calculated at the end
  //   // } else if (centerY) {
  //   //   if (node.x === 0) {
  //   //     // y = center, x = left
  //   //     return "my-auto ml-0 mr-auto ";
  //   //   } else if (node.x === node.parent.width) {
  //   //     // y = center, x = right
  //   //     return "my-auto ml-auto mr-0 ";
  //   //   }
  //   //   // y = center, x = any
  //   //   // there is no Alignment for this, therefore it goes to manual mode.
  //   // }

  //   // set the width to max if the view is near the corner
  //   // that will be complemented with margins from [retrieveContainerPosition]
  //   if (node.parent.type === "GROUP" || "layoutMode" in node.parent) {
  //     const sizeConverter = (attr: string, num: number): string => {
  //       const result = pxToLayoutSize(num);
  //       if (+result > 0) {
  //         return `${attr}-${result} `;
  //       }
  //       return "";
  //     };

  //     // when inside autoAutoLayout, mx will be useless (self-align will determine this)
  //     // todo calculate the margin together with spacing, so that items can be individually offseted

  //     // let prop = "";
  //     // this is necessary because Group uses relative position, while Frame is absolute
  //     // const parentX = parent.type === "GROUP" ? parent.x : 0;
  //     // const parentY = parent.type === "GROUP" ? parent.y : 0;

  //     //   const autoAutoLayout = isInsideAutoAutoLayout(parent);
  //     //   if (autoAutoLayout[0] === "sd-y" || "layoutMode" in node) {
  //     //     // centerX threshold
  //     //     // width - (40 - 0) * 2 + nodeWidth is zero when centered

  //     //     const mx = parent.width - ((node.x - parentX) * 2 + node.width);
  //     //     if (mx < 4 && mx > -4) {
  //     //       prop += sizeConverter("mx", node.x - parentX);
  //     //     } else {
  //     //       if (node.x - parentX > 0 && node.x - parentX < magicMargin) {
  //     //         prop += sizeConverter("ml", node.x - parentX);
  //     //       }
  //     //       if (parent.width - (node.x - parentX + node.width) < magicMargin) {
  //     //         prop += sizeConverter("mr", parent.width - node.x - node.width);
  //     //       }
  //     //     }
  //     //   }

  //     //   if (autoAutoLayout[0] === "sd-x" || "layoutMode" in node) {
  //     //     autoAutoLayout[1];

  //     //     // centerY threshold
  //     //     const my = parent.height - ((node.y - parentY) * 2 + node.height);
  //     //     if (my < 4 && my > -4) {
  //     //       prop += sizeConverter("my", node.y - parentY);
  //     //     } else {
  //     //       const mt = node.y - parentY;
  //     //       if (mt > 0 && mt < magicMargin) {
  //     //         prop += sizeConverter("mt", node.y - parentY);
  //     //       }
  //     //       const mb = parent.height - (node.y - parentY + node.height);
  //     //       if (mb < magicMargin) {
  //     //         prop += sizeConverter("mb", mb);
  //     //       }
  //     //     }
  //     //   }
  //     //   if (prop) {
  //     //     return prop;
  //     //   }
  //     //   // when inside an autoAutoLayout, there is no need to get the absolute position
  //     //   return "";
  //     // }
  //   }

  //   // manual mode, just use the position.
  //   return "";
  // }

  return "";
};

// this was extracted because is going to be used by both FRAMEs and GROUPs
const retrieveAbsolutePos = (node: AltSceneNode): string => {
  // if node is same size as height, position is not necessary

  if (
    !node.parent ||
    (node.width === node.parent.width && node.height === node.parent.height)
  ) {
    return "";
  }

  // position is absolute, parent is relative
  // return "absolute inset-0 m-auto ";

  const parentX = "layoutMode" in node.parent ? 0 : node.parent.x;
  const parentY = "layoutMode" in node.parent ? 0 : node.parent.y;

  // < 4 is a threshold. If === is used, there can be rounding errors (28.002 !== 28)
  const centerX =
    Math.abs(2 * (node.x - parentX) + node.width - node.parent.width) < 8;
  const centerY =
    Math.abs(2 * (node.y - parentY) + node.height - node.parent.height) < 8;

  const minX = node.x - parentX < 8;
  const minY = node.y - parentY < 8;

  const maxX = node.parent.width - (node.x - parentX + node.width) < 8;
  const maxY = node.parent.height - (node.y - parentY + node.height) < 8;

  if (centerX && centerY) {
    return "absolute m-auto inset-0 ";
  }

  if (centerX) {
    if (minY) {
      // x center, y top
      return "absolute inset-x-0 top-0 mx-auto ";
    }
    if (maxY) {
      // x center, y bottom
      return "absolute inset-x-0 bottom-0 mx-auto ";
    }
  } else if (centerY) {
    if (minX) {
      // x left, y center
      return "absolute inset-y-0 left-0 my-auto ";
    }
    if (maxX) {
      // x right, y center
      return "absolute inset-y-0 right-0 my-auto ";
    }
  }

  if (minX && minY) {
    // x left, y left
    return "absolute left-0 top-0 ";
  } else if (minX && maxY) {
    // x left, y bottom
    return "absolute left-0 bottom-0 ";
  } else if (maxX && minY) {
    // x right, y top
    return "absolute right-0 top-0 ";
  } else if (maxX && maxY) {
    // x right, y bottom
    return "absolute right-0 bottom-0 ";
  }

  return "absoluteManualLayout";
};
