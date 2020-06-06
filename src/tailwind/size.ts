let shouldOptimize: boolean;
shouldOptimize = true;

import { pxToLayoutSize } from "./conversion_tables";
import { AffectedByCustomAutoLayout, CustomNodeMap } from "./custom_node";

export const magicMargin = 32;

export const getContainerSizeProp = (node: SceneNode): string => {
  /// WIDTH AND HEIGHT

  // if parent is a page, width can't get past w-64, therefore let it be free
  // if (node.parent?.type === "PAGE" && node.width > 256) {
  //   return "";
  // }

  if (!node.parent || !("width" in node.parent)) {
    return "";
  }

  // when parent is HORIZONTAL and node is HORIZONTAL, let the child define the size
  if ("layoutMode" in node.parent && "layoutMode" in node) {
    if (
      node.layoutMode !== "NONE" &&
      node.parent.layoutMode === node.layoutMode
    ) {
      return "";
    }
  }

  // if layoutAlign is STRETCH, w/h should be full
  if (node.layoutAlign === "STRETCH" && "layoutMode" in node.parent) {
    if (node.parent.layoutMode === "HORIZONTAL") {
      return "w-full ";
    } else if (node.parent.layoutMode === "VERTICAL") {
      // TODO. h-full? It isn't always reliable, but it is inside a Frame anyway..
    }
  }

  // if currentFrame has a rect that became a frame, let it define the size
  if (
    CustomNodeMap[node.id] &&
    CustomNodeMap[node.id].largestNode &&
    CustomNodeMap[node.id].orderedChildren.length === 1
  ) {
    return "";
  }

  // experimental, set size to auto, like in the real autolayout
  if (AffectedByCustomAutoLayout[node.id] === "changed") {
    return "";
  }

  const [nodeWidth, nodeHeight] = getNodeSizeWithStrokes(node);

  const hRem = pxToLayoutSize(nodeHeight);
  const wRem = pxToLayoutSize(nodeWidth);

  let propHeight = `h-${hRem} `;
  let propWidth = `w-${wRem} `;

  // if FRAME is too big for tailwind to handle, just let it be w-full or h-auto
  // if its width is larger than 256 or the sum of its children
  if (
    node.width > 256 ||
    ("children" in node &&
      node.children.filter((d) => d.width + d.x - node.x > 256).length > 0)
  ) {
    propWidth = "w-full ";
  }

  // compare if width is same as parent, with a small threshold
  // parent must be a frame (gets weird in groups)
  if ("layoutMode" in node.parent && node.parent.width - node.width < 2) {
    propWidth = "w-full ";
  }

  // 799 / 400 - 2 = -0,0025
  // 0.01 of tolerance is enough for 5% of diff, i.e.: 804 / 400
  if (Math.abs(node.parent.width / node.width - 2) < 0.01) {
    propWidth = "w-1/2 ";
  }

  // compare if height is same as parent, with a small threshold
  // commented because h-auto is better than h-full most of the time on responsiviness
  // todo improve this. Buggy in small layouts, good in big.
  // RECTANGLE can't have relative height

  // don't want to set the height to auto when autolayout is FIXED
  const autoHeight =
    ("layoutMode" in node && node.counterAxisSizingMode !== "FIXED") ||
    !("layoutMode" in node);

  if (node.type !== "RECTANGLE" && autoHeight) {
    if (
      // todo Secondary button has issues with this
      node.parent.height - node.height < 2 ||
      node.height > 256 ||
      ("children" in node &&
        node.children.filter((d) => d.height + d.y - node.y > 256).length > 0)
    ) {
      // propHeight = "h-full ";
      propHeight = "AAAAA";
    }
  }

  // when the child has the same size as the parent, don't set the size of the parent (twice)
  // exception: when it is 1/2
  if (
    "children" in node &&
    node.children.length === 1 &&
    propWidth !== "w-1/2 "
  ) {
    const child = node.children[0];
    if (child.width === node.width && child.height === node.height) {
      return "";
    }
  } else {
    // if (!("strokes" in node)) {
    //   // ignore Group
    //   return "";
    // }
  }

  if (node.parent !== null && "width" in node.parent) {
    // set the width to max if the view is near the corner
    // that will be complemented with margins from [retrieveContainerPosition]
    // the third check [parentWidth - nodeWidth >= 2 * magicMargin]
    // was made to avoid setting h-full when parent is almost the same size as children

    // nodeWidth / node.parent.width >= 0.8: this means only when it covers 80% of the frame
    if (
      node.x - node.parent.x <= magicMargin &&
      nodeWidth / node.parent.width >= 0.8 &&
      nodeWidth + 2 * magicMargin >= node.parent.width &&
      node.parent.width - nodeWidth >= 2 * magicMargin
    ) {
      propWidth = "w-full ";
    }

    if (
      node.y - node.parent.y <= magicMargin &&
      nodeHeight / node.parent.height >= 0.8 &&
      nodeHeight + 2 * magicMargin >= node.parent.height &&
      node.parent.height - nodeHeight >= 2 * magicMargin
    ) {
      propHeight = "h-full ";
    }
  }

  if ("layoutMode" in node) {
    // if counterAxisSizingMode === "AUTO", width and height won't be set. For every other case, it will be.
    if (node.counterAxisSizingMode === "FIXED") {
      // when AutoLayout is HORIZONTAL, width is set by Figma and height is auto.
      if (node.layoutMode === "HORIZONTAL") {
        return `${propHeight}`;
      } else if (node.layoutMode === "VERTICAL") {
        // when AutoLayout is VERTICAL, height is set by Figma and width is auto.
        return `${propWidth}`;
      }
      return `${propWidth}${propHeight}`;
    } else {
      // exception, override it when this is detected
      if (propWidth === "w-1/2 ") {
        return `${propWidth}`;
      }
    }
  } else {
    return `${propWidth}${propHeight}`;
  }

  return "";
};

// makes the view size bigger when there is a stroke
const getNodeSizeWithStrokes = (node: SceneNode): Array<number> => {
  let nodeHeight = node.height;
  let nodeWidth = node.width;

  if (!("strokes" in node)) {
    return [nodeWidth, nodeHeight];
  }

  // tailwind doesn't support OUTSIDE or CENTER, only INSIDE.
  // Therefore, to give the same feeling, the height and width will be slighly increased.
  // node.strokes.lenght is necessary because [strokeWeight] can exist even without strokes.
  if (node.strokes.length) {
    if (node.strokeAlign === "OUTSIDE") {
      nodeHeight += node.strokeWeight * 2;
      nodeWidth += node.strokeWeight * 2;
    } else if (node.strokeAlign === "CENTER") {
      nodeHeight += node.strokeWeight * 1.5;
      nodeWidth += node.strokeWeight * 1.5;
    }
  }

  if ("children" in node) {
    // if any children has an OUTSIDE or CENTER stroke and, with that stroke,
    // the child gets a size bigger than parent, adjust parent to be larger
    node.children
      .filter((d) => "strokeWeight" in d && d.strokes.length)
      .forEach((d) => {
        if ("strokeWeight" in d) {
          if (d.strokeAlign === "OUTSIDE") {
            if (nodeWidth < d.width + d.strokeWeight * 2) {
              nodeWidth += d.strokeWeight * 2;
            }
            if (nodeHeight < d.height + d.strokeWeight * 2) {
              nodeHeight += d.strokeWeight * 2;
            }
          } else if (d.strokeAlign === "CENTER") {
            if (nodeWidth < d.width + d.strokeWeight * 1.5) {
              nodeWidth += d.strokeWeight * 2;
            }
            if (nodeHeight < d.height + d.strokeWeight * 1.5) {
              nodeHeight += d.strokeWeight * 1.5;
            }
          }
        }
      });
  }

  return [nodeWidth, nodeHeight];
};
