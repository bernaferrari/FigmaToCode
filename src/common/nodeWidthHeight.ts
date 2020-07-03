import { AltSceneNode } from "../altNodes/altMixins";

export const magicMargin = 32;

type SizeResult = {
  readonly width: responsive | number | null;
  readonly height: number | null;
};

export const nodeWidthHeight = (
  node: AltSceneNode,
  allowRelative: boolean
): SizeResult => {
  /// WIDTH AND HEIGHT

  // if parent is a page, width can't get past w-64, therefore let it be free
  // if (node.parent?.type === "PAGE" && node.width > 256) {
  //   return "";
  // }

  // when parent is HORIZONTAL and node is HORIZONTAL, let the child define the size
  // todo there is a problem... when parent becomes autolayout, children won't be responsive
  // if (node.parent && "layoutMode" in node.parent && "layoutMode" in node) {
  //   if (
  //     node.layoutMode !== "NONE" &&
  //     node.parent.layoutMode === node.layoutMode
  //   ) {
  //     return "";
  //   }
  // }

  // if node's layoutAlign is STRETCH, w/h should be full
  if (
    node.layoutAlign === "STRETCH" &&
    node.parent &&
    "layoutMode" in node.parent
  ) {
    if (node.parent.layoutMode === "HORIZONTAL") {
      return {
        width: allowRelative ? "full" : node.width,
        height: null,
      };
    }
    // else if (node.parent.layoutMode === "VERTICAL") {
    // todo use h-full? It isn't always reliable, but it is inside a Frame anyway..
    // }
  }

  const [nodeWidth, nodeHeight] = getNodeSizeWithStrokes(node);

  let propWidth: responsive | number | null = nodeWidth;
  let propHeight: number | null = nodeHeight;

  // todo can a relative container be w-full? I don't think so.
  // this has been moved to [htmlSize]. Was this a good choice?
  // if ("isRelative" in node && node.isRelative === true) {
  //   return {
  //     width: nodeWidth,
  //     height: nodeHeight,
  //   };
  // }

  if (allowRelative) {
    // avoid relative width when parent is relative (therefore, child is probably absolute, which doesn't work nice)
    const insideRelative =
      node.parent &&
      "isRelative" in node.parent &&
      node.parent.isRelative === true;

    if (!insideRelative) {
      const rW = calculateResponsiveW(node, nodeWidth);

      if (rW) {
        propWidth = rW;
      }
    }
  }

  // when the child has the same size as the parent, don't set the size of the parent (twice)
  if ("children" in node && node.children && node.children.length === 1) {
    const child = node.children[0];
    // set them independently, in case w is equal but h isn't
    if (child.width === nodeWidth) {
      propWidth = null;
    }
    if (child.height === nodeHeight) {
      propHeight = null;
    }
  }

  if (
    ("layoutMode" in node && node.layoutMode === "VERTICAL") ||
    ("layoutMode" in node &&
      node.layoutMode === "HORIZONTAL" &&
      node.counterAxisSizingMode === "AUTO") ||
    (node.type !== "RECTANGLE" && nodeHeight > 256) ||
    childLargerThanMaxSize(node, "y")
  ) {
    // propHeight = "h-full ";
    propHeight = null;
  }

  // if FRAME is too big for tailwind to handle, just let it be w-full or h-auto
  // if its width is larger than 256 or the sum of its children

  // if (rW !== "") {
  //   return `${propWidth}${propHeight}`;
  // }

  if ("layoutMode" in node && node.layoutMode && node.layoutMode !== "NONE") {
    // there is an edge case: frame with no children, layoutMode !== NONE and counterAxis = AUTO, but:
    // in [altConversions] it is already solved: Frame without children becomes a Rectangle.

    if (node.counterAxisSizingMode === "FIXED") {
      // if counterAxisSizingMode === "AUTO", width and height won't be set. For every other case, it will be.
      // when AutoLayout is HORIZONTAL, width is set by Figma and height is auto.
      if (node.layoutMode === "HORIZONTAL") {
        return {
          width: null,
          height: propHeight,
        };
      } else {
        // node.layoutMode === "VERTICAL"

        // when AutoLayout is VERTICAL, height is set by Figma and width is auto.
        return {
          width: propWidth,
          height: null,
        };
      }
      // node.layoutMode === "NONE" won't reach here
      // if node.children.length === 1, it will be converted to HORIZONTAL AutoLayout
      // if node.children.length > 1, it will be taken care before.
    }
  } else {
    return {
      width: propWidth,
      height: propHeight,
    };
  }

  // when node.counterAxisSizingMode is AUTO
  return {
    width: null,
    height: null,
  };
};

// makes the view size bigger when there is a stroke
const getNodeSizeWithStrokes = (node: AltSceneNode): Array<number> => {
  let nodeHeight = node.height;
  let nodeWidth = node.width;

  // tailwind doesn't support OUTSIDE or CENTER, only INSIDE.
  // Therefore, to give the same feeling, the height and width will be slighly increased.
  // node.strokes.lenght is necessary because [strokeWeight] can exist even without strokes.
  if ("strokes" in node && node.strokes && node.strokes.length) {
    if (node.strokeAlign === "OUTSIDE") {
      nodeHeight += node.strokeWeight * 2;
      nodeWidth += node.strokeWeight * 2;
    } else if (node.strokeAlign === "CENTER") {
      nodeHeight += node.strokeWeight;
      nodeWidth += node.strokeWeight;
    }
  }

  if ("children" in node) {
    // if any children has an OUTSIDE or CENTER stroke and, with that stroke,
    // the child gets a size bigger than parent, adjust parent to be larger
    node.children.forEach((d) => {
      if ("strokeWeight" in d && d.strokes?.length > 0) {
        if (d.strokeAlign === "OUTSIDE") {
          if (nodeWidth < d.width + d.strokeWeight * 2) {
            nodeWidth += d.strokeWeight * 2;
          }
          if (nodeHeight < d.height + d.strokeWeight * 2) {
            nodeHeight += d.strokeWeight * 2;
          }
        } else if (d.strokeAlign === "CENTER") {
          if (nodeWidth < d.width + d.strokeWeight) {
            nodeWidth += d.strokeWeight;
          }
          if (nodeHeight < d.height + d.strokeWeight) {
            nodeHeight += d.strokeWeight;
          }
        }
      }
    });
  }

  return [nodeWidth, nodeHeight];
};

const childLargerThanMaxSize = (node: AltSceneNode, axis: "x" | "y") => {
  const widthHeight: "width" | "height" = axis === "x" ? "width" : "height";
  if ("children" in node && node.children.length > 0) {
    const lastChild = node.children[node.children.length - 1];

    const maxLen =
      lastChild[axis] + lastChild[widthHeight] - node.children[0][axis];
    return maxLen > 256;
  }
  return false;
};

type responsive =
  | ""
  | "full"
  | "1/2"
  | "1/3"
  | "2/3"
  | "1/4"
  | "3/4"
  | "1/5"
  | "1/6"
  | "5/6"
  | "1/12";
// removed 5/12, 7/12 and 11/12 because they were disrupting more than helping.

const calculateResponsiveW = (
  node: AltSceneNode,
  nodeWidth: number
): responsive => {
  let propWidth: responsive = "";

  // verifies if size > 256 or any child has size > 256
  // todo improve to verify if the sum of children is also not larger than 256

  if (nodeWidth > 256 || childLargerThanMaxSize(node, "x")) {
    propWidth = "full";
  }

  if (!node.parent) {
    return propWidth;
  }

  // if width is same as parent, with a small threshold, w is 100%
  // parent must be a frame (gets weird in groups)
  if ("layoutMode" in node.parent && node.parent.width - nodeWidth < 2) {
    propWidth = "full";
  }

  if ("width" in node.parent) {
    // 0.01 of tolerance is enough for 5% of diff, i.e.: 804 / 400
    const dividedWidth = nodeWidth / node.parent.width;

    // todo what if the element is ~1/2 but there is a margin? This won't detect it

    const calculateResp = (div: number, str: responsive) => {
      if (Math.abs(dividedWidth - div) < 0.01) {
        propWidth = str;
        return true;
      }
      return false;
    };

    // they will try to set the value, and if false keep calculating
    // todo is there a better way of writing this?

    const checkList: Array<[number, responsive]> = [
      [1, "full"],
      [1 / 2, "1/2"],
      [1 / 3, "1/3"],
      [2 / 3, "2/3"],
      [1 / 4, "1/4"],
      [3 / 4, "3/4"],
      [1 / 5, "1/5"],
      [1 / 6, "1/6"],
      [5 / 6, "5/6"],
      [1 / 12, "1/12"],
    ];

    // exit the for when result is found.
    let resultFound = false;
    for (let i = 0; i < checkList.length && !resultFound; i++) {
      const [div, resp] = checkList[i];
      resultFound = calculateResp(div, resp);
    }
  }

  if (isWidthFull(node, nodeWidth)) {
    propWidth = "full";
  }

  return propWidth;
};

// set the width to max if the view is near the corner
export const isWidthFull = (
  node: AltSceneNode,
  nodeWidth: number = node.width
): boolean => {
  if (node.parent && "width" in node.parent) {
    // set the width to max if the view is near the corner

    // check if initial and final positions are within a magic number (currently 32)
    // this will only be reached when parent is FRAME, so node.parent.x is always 0.
    const betweenValueMargins =
      node.x <= magicMargin &&
      node.parent.width - (node.x + nodeWidth) <= magicMargin;

    // check if total width is at least 80% of the parent. This number is also a magic number and has worked fine so far.
    const betweenPercentMargins = nodeWidth / node.parent.width >= 0.8;

    // when parent's width is the same as the child, child should set it..
    // but the child can't set it to full since parent doesn't have it. Therefore, ignore it.
    const differentThanParent = node.width !== node.parent.width;

    if (differentThanParent && betweenValueMargins && betweenPercentMargins) {
      return true;
    }
  }

  return false;
};
