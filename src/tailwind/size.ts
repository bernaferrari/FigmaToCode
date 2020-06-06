import { pxToLayoutSize } from "./conversion_tables";
import { AffectedByCustomAutoLayout, CustomNodeMap } from "./custom_node";

export const magicMargin = 32;

export const getContainerSizeProp = (node: SceneNode): string => {
  /// WIDTH AND HEIGHT

  // if parent is a page, width can't get past w-64, therefore let it be free
  // if (node.parent?.type === "PAGE" && node.width > 256) {
  //   return "";
  // }

  if (!node.parent) {
    return "";
  }

  // when parent is HORIZONTAL and node is HORIZONTAL, let the child define the size
  // todo try to take in consideration the custom Auto Layout too?
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
    let returnHere = true;

    // imagine a Rect, Text and Frame. Rect will be changed to become the Frame.
    // The parent of Rect is the Frame, and the parent of Text will be Rect.
    // But we need the parent of the parent of the Rect, if exists, to get the sizing correctly
    if (
      "width" in node &&
      node.parent.parent &&
      "width" in node.parent.parent
    ) {
      // retrieve the children (get the parent, look at children and ignore the node)
      const children = node.parent.children.filter((d) => d !== node);

      // type checker fails inside the every if this is not done
      const nodeParent = node.parent.parent;

      // look if any children has a responsive width
      const isResp = children.every((d) =>
        calculateResponsiveW(d, nodeParent, d.width, d.height)
      );

      // if it has, don't return empty. Width needs to be set manually.
      if (isResp) {
        returnHere = false;
      }
    }

    if (returnHere) {
      return "";
    }
  }

  let [nodeWidth, nodeHeight] = getNodeSizeWithStrokes(node);

  const hRem = pxToLayoutSize(nodeHeight);
  const wRem = pxToLayoutSize(nodeWidth);

  let propHeight = `h-${hRem} `;
  let propWidth = `w-${wRem} `;

  // if layer is a child from AutoAutoLayout, the parent was changed;
  // therefore, it must be updated
  let updatedParent: SceneNode | undefined = undefined;
  if (AffectedByCustomAutoLayout[node.id] === "child") {
    updatedParent = node.parent.children.find(
      (d) => AffectedByCustomAutoLayout[d.id] === "changed"
    );
  }
  if (!updatedParent || !("width" in updatedParent)) {
    if ("width" in node.parent) {
      updatedParent = node.parent;
    }
  }

  const rW = calculateResponsiveW(node, updatedParent, nodeWidth, nodeHeight);
  if (rW) {
    propWidth = rW;
  }

  // compare if height is same as parent, with a small threshold
  // commented because h-auto is better than h-full most of the time on responsiviness
  // todo improve this. Buggy in small layouts, good in big.
  // RECTANGLE can't have relative height

  // don't want to set the height to auto when autolayout is FIXED
  const autoHeight =
    ("layoutMode" in node && node.counterAxisSizingMode !== "FIXED") ||
    !("layoutMode" in node);

  if ("height" in node.parent && node.type !== "RECTANGLE" && autoHeight) {
    if (
      // todo Secondary button has issues with this
      node.parent.height - nodeHeight < 2 ||
      nodeHeight > 256 ||
      ("children" in node &&
        node.children.filter((d) => d.height + d.y - node.y > 256).length > 0)
    ) {
      // propHeight = "h-full ";
      propHeight = "";
    }
  }

  // if FRAME is too big for tailwind to handle, just let it be w-full or h-auto
  // if its width is larger than 256 or the sum of its children

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

const calculateResponsiveW = (
  node: SceneNode,
  parent: SceneNode | undefined,
  nodeWidth: number,
  nodeHeight: number
): string => {
  let propWidth = "";

  // verifies if size > 256 or any child has size > 256
  // todo improve to verify if the sum of children is also not larger than 256
  if (
    nodeWidth > 256 ||
    ("children" in node &&
      node.children.filter((d) => d.width + d.x - node.x > 256).length > 0)
  ) {
    propWidth = "w-full ";
  }

  if (!parent) {
    return propWidth;
  }

  // if width is same as parent, with a small threshold, w is 100%
  // parent must be a frame (gets weird in groups)
  if ("layoutMode" in parent && parent.width - nodeWidth < 2) {
    propWidth = "w-full ";
  }

  if ("width" in parent) {
    // 0.01 of tolerance is enough for 5% of diff, i.e.: 804 / 400
    const dividedWidth = nodeWidth / parent.width;

    // todo what if the element is ~1/2 but there is a margin? This won't detect it
    if (Math.abs(dividedWidth - 1) < 0.01) {
      propWidth = "w-full ";
    } else if (Math.abs(dividedWidth - 1 / 2) < 0.01) {
      propWidth = "w-1/2 ";
    } else if (Math.abs(dividedWidth - 1 / 3) < 0.01) {
      propWidth = "w-1/3 ";
    } else if (Math.abs(dividedWidth - 2 / 3) < 0.01) {
      propWidth = "w-2/3 ";
    } else if (Math.abs(dividedWidth - 1 / 4) < 0.01) {
      propWidth = "w-1/4 ";
    } else if (Math.abs(dividedWidth - 3 / 4) < 0.01) {
      propWidth = "w-3/4 ";
    } else if (Math.abs(dividedWidth - 1 / 5) < 0.01) {
      propWidth = "w-1/5 ";
    } else if (Math.abs(dividedWidth - 1 / 6) < 0.01) {
      propWidth = "w-1/6 ";
    } else if (Math.abs(dividedWidth - 5 / 6) < 0.01) {
      propWidth = "w-5/6 ";
    } else if (Math.abs(dividedWidth - 1 / 12) < 0.01) {
      propWidth = "w-1/12 ";
    } else if (Math.abs(dividedWidth - 5 / 12) < 0.01) {
      propWidth = "w-5/12 ";
    } else if (Math.abs(dividedWidth - 7 / 12) < 0.01) {
      propWidth = "w-7/12 ";
    } else if (Math.abs(dividedWidth - 11 / 12) < 0.01) {
      propWidth = "w-11/12 ";
    }
  }

  // when the child has the same size as the parent, don't set the size of the parent (twice)
  // exception: when it is 1/2
  if ("children" in node && node.children.length === 1 && !propWidth) {
    const child = node.children[0];
    if (child.width === nodeWidth && child.height === nodeHeight) {
      return "ABABAA";
    }
  } else {
    // if (!("strokes" in node)) {
    //   // ignore Group
    //   return "";
    // }
  }

  if ("width" in parent) {
    // set the width to max if the view is near the corner
    // that will be complemented with margins from [retrieveContainerPosition]
    // the third check [parentWidth - nodeWidth >= 2 * magicMargin]
    // was made to avoid setting h-full when parent is almost the same size as children

    // nodeWidth / node.parent.width >= 0.8: this means only when it covers 80% of the frame
    if (
      node.x - parent.x <= magicMargin &&
      nodeWidth / parent.width >= 0.8 &&
      nodeWidth + 2 * magicMargin >= parent.width &&
      parent.width - nodeWidth >= 2 * magicMargin
    ) {
      propWidth = "w-full ";
    }
  }

  return propWidth;
};
