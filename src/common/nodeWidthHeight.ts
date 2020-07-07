import { AltSceneNode } from "../altNodes/altMixins";
import { monitorEventLoopDelay } from "perf_hooks";

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

  // todo this can be seen as an optimization, but then the parent, when it is horizontal, must also look if any children is stretch, which adds more code.
  // if node's layoutAlign is STRETCH, w/h should be full
  // if (
  //   node.layoutAlign === "STRETCH" &&
  //   node.parent &&
  //   "layoutMode" in node.parent
  // ) {
  //   if (node.parent.layoutMode === "HORIZONTAL") {
  //     return {
  //       width: allowRelative ? "full" : node.width,
  //       height: null,
  //     };
  //   }
  //   // else if (node.parent.layoutMode === "VERTICAL") {
  //   // todo use h-full? It isn't always reliable, but it is inside a Frame anyway..
  //   // }
  // }

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
    const insideRelative = node.parent && node.parent.isRelative === true;

    if (!insideRelative) {
      const rW = calculateResponsiveW(node, nodeWidth);

      if (rW) {
        propWidth = rW;
      }
    }
  }

  // when any child has a relative width and parent is HORIZONTAL,
  // parent must have a defined width, which wouldn't otherwise.
  // todo check if the performance impact of this is worth it.
  const hasRelativeChild =
    allowRelative &&
    "layoutMode" in node &&
    node.layoutMode === "HORIZONTAL" &&
    node.children.find((d) =>
      calculateResponsiveW(d, getNodeSizeWithStrokes(d)[0])
    ) !== undefined;

  // when the child has the same size as the parent, don't set the size of the parent (twice)
  if (
    !hasRelativeChild &&
    "children" in node &&
    node.children &&
    node.children.length === 1
  ) {
    const child = node.children[0];

    // detect if Frame's width is same as Child when Frame has Padding.
    let hPadding = 0;
    let vPadding = 0;
    if ("layoutMode" in node) {
      hPadding = 2 * (node.horizontalPadding ?? 0);
      vPadding = 2 * (node.verticalPadding ?? 0);
    }

    // set them independently, in case w is equal but h isn't
    if (child.width === nodeWidth - hPadding) {
      propWidth = null;
    }
    if (child.height === nodeHeight - vPadding) {
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

  if (!hasRelativeChild && "layoutMode" in node && node.layoutMode !== "NONE") {
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
  if ("children" in node && node.children.length > 0) {
    const widthHeight: "width" | "height" = axis === "x" ? "width" : "height";
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

  if (nodeWidth > 256 || childLargerThanMaxSize(node, "x")) {
    propWidth = "full";
  }

  if (!node.parent) {
    return propWidth;
  }

  let parentWidth;

  // add padding back to the layout width, so it can be full when compared with parent.
  if (
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.horizontalPadding &&
    node.parent.layoutMode !== "NONE"
  ) {
    // parentWidth = node.parent.width;
    parentWidth = node.parent.width - node.parent.horizontalPadding * 2;
    // currently ignoring h-full
  } else {
    parentWidth = node.parent.width;
  }

  // verifies if size > 256 or any child has size > 256
  // todo improve to verify if the sum of children is also not larger than 256

  // if width is same as parent, with a small threshold, w is 100%
  // parent must be a frame (gets weird in groups)
  if ("layoutMode" in node.parent && parentWidth - nodeWidth < 2) {
    propWidth = "full";
  }

  // 0.01 of tolerance is enough for 5% of diff, i.e.: 804 / 400
  const dividedWidth = nodeWidth / parentWidth;

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

  if (isWidthFull(node, nodeWidth, parentWidth)) {
    propWidth = "full";
  }

  return propWidth;
};

// set the width to max if the view is near the corner
export const isWidthFull = (
  node: AltSceneNode,
  nodeWidth: number,
  parentWidth: number
): boolean => {
  // check if initial and final positions are within a magic number (currently 32)
  // this will only be reached when parent is FRAME, so node.parent.x is always 0.
  const betweenValueMargins =
    node.x <= magicMargin && parentWidth - (node.x + nodeWidth) <= magicMargin;

  // check if total width is at least 80% of the parent. This number is also a magic number and has worked fine so far.
  const betweenPercentMargins = nodeWidth / parentWidth >= 0.8;

  // when parent's width is the same as the child, child should set it..
  // but the child can't set it to full since parent doesn't have it. Therefore, ignore it.
  const differentThanParent = nodeWidth !== parentWidth;

  if (differentThanParent && betweenValueMargins && betweenPercentMargins) {
    return true;
  }

  return false;
};
