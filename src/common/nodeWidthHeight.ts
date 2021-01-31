import { AltSceneNode } from "../altNodes/altMixins";

export const magicMargin = 32;

type SizeResult = {
  readonly width: responsive | number | null;
  readonly height: responsive | number | null;
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

  if (node.layoutAlign === "STRETCH" && node.layoutGrow === 1) {
    return {
      width: "full",
      height: "full",
    };
  }

  const [nodeWidth, nodeHeight] = getNodeSizeWithStrokes(node);

  let propWidth: responsive | number | null = nodeWidth;
  let propHeight: responsive | number | null = nodeHeight;

  if (node.parent && "layoutMode" in node.parent) {
    // Stretch means the opposite direction
    if (node.layoutAlign === "STRETCH") {
      switch (node.parent.layoutMode) {
        case "HORIZONTAL":
          propHeight = "full";
          break;
        case "VERTICAL":
          propWidth = "full";
          break;
      }
    }

    // Grow means the same direction
    if (node.layoutGrow === 1) {
      if (node.parent.layoutMode === "HORIZONTAL") {
        propWidth = "full";
      } else {
        propHeight = "full";
      }
    }
  }

  // avoid relative width when parent is relative (therefore, child is probably absolute, which doesn't work nice)
  // ignore for root layer
  // todo should this be kept this way? The issue is w-full which doesn't work well with absolute position.
  if (allowRelative && node.parent?.isRelative !== true) {
    // don't calculate again if it was already calculated
    if (propWidth !== "full") {
      const rW = calculateResponsiveWH(node, nodeWidth, "x");
      if (rW) {
        propWidth = rW;
      }
    }

    if (propHeight !== "full") {
      const rH = calculateResponsiveWH(node, nodeHeight, "y");
      if (rH && node.parent) {
        propHeight = rH;
      }
    }
  }

  // when any child has a relative width and parent is HORIZONTAL,
  // parent must have a defined width, which wouldn't otherwise.
  // todo check if the performance impact of this is worth it.
  // const hasRelativeChildW =
  //   allowRelative &&
  //   "children" in node &&
  //   node.children.find((d) =>
  //     calculateResponsiveWH(d, getNodeSizeWithStrokes(d)[0], "x")
  //   ) !== undefined;

  // when the child has the same size as the parent, don't set the size of the parent (twice)
  if ("children" in node && node.children && node.children.length === 1) {
    const child = node.children[0];

    // detect if Frame's width is same as Child when Frame has Padding.
    let hPadding = 0;
    let vPadding = 0;
    if ("layoutMode" in node) {
      hPadding = node.paddingLeft + node.paddingRight;
      vPadding = node.paddingTop + node.paddingBottom;
    }

    // set them independently, in case w is equal but h isn't
    if (child.width === nodeWidth - hPadding) {
      // propWidth = null;
    }
    if (child.height === nodeHeight - vPadding) {
      // propHeight = null;
    }
  }

  if ("layoutMode" in node) {
    if (
      (node.layoutMode === "HORIZONTAL" &&
        node.counterAxisSizingMode === "AUTO") ||
      (node.layoutMode === "VERTICAL" && node.primaryAxisSizingMode === "AUTO")
    ) {
      propHeight = null;
    }

    if (
      (node.layoutMode === "VERTICAL" &&
        node.counterAxisSizingMode === "AUTO") ||
      (node.layoutMode === "HORIZONTAL" &&
        node.primaryAxisSizingMode === "AUTO")
    ) {
      propWidth = null;
    }
  }

  // On Tailwind, do not let the size be larger than 384.
  if (allowRelative) {
    if (
      (node.type !== "RECTANGLE" && nodeHeight > 384) ||
      childLargerThanMaxSize(node, "y")
    ) {
      propHeight = null;
    } else if (
      (node.type !== "RECTANGLE" && nodeWidth > 384) ||
      childLargerThanMaxSize(node, "x")
    ) {
      propWidth = null;
    }
  }

  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    // there is an edge case: frame with no children, layoutMode !== NONE and counterAxis = AUTO, but:
    // in [altConversions] it is already solved: Frame without children becomes a Rectangle.
    switch (node.layoutMode) {
      case "HORIZONTAL":
        return {
          width: node.primaryAxisSizingMode === "FIXED" ? propWidth : null,
          height: node.counterAxisSizingMode === "FIXED" ? propHeight : null,
        };
      case "VERTICAL":
        return {
          width: node.counterAxisSizingMode === "FIXED" ? propWidth : null,
          height: node.primaryAxisSizingMode === "FIXED" ? propHeight : null,
        };
    }
  } else {
    return {
      width: propWidth,
      height: propHeight,
    };
  }
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
    return maxLen > 384;
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
  | "5/6";

const calculateResponsiveWH = (
  node: AltSceneNode,
  nodeWidthHeight: number,
  axis: "x" | "y"
): responsive => {
  let returnValue: responsive = "";

  if (nodeWidthHeight > 384 || childLargerThanMaxSize(node, axis)) {
    returnValue = "full";
  }

  if (!node.parent) {
    return returnValue;
  }

  let parentWidthHeight;
  if ("layoutMode" in node.parent && node.parent.layoutMode !== "NONE") {
    if (axis === "x") {
      // subtract padding from the layout width, so it can be full when compared with parent.
      parentWidthHeight =
        node.parent.width - node.parent.paddingLeft - node.parent.paddingRight;
    } else {
      // subtract padding from the layout height, so it can be full when compared with parent.
      parentWidthHeight =
        node.parent.height - node.parent.paddingTop - node.parent.paddingBottom;
    }
  } else {
    parentWidthHeight = axis === "x" ? node.parent.width : node.parent.height;
  }

  // 0.01 of tolerance is enough for 5% of diff, i.e.: 804 / 400
  const dividedWidth = nodeWidthHeight / parentWidthHeight;

  const calculateResp = (div: number, str: responsive) => {
    if (Math.abs(dividedWidth - div) < 0.01) {
      returnValue = str;
      return true;
    }
    return false;
  };

  // they will try to set the value, and if false keep calculating
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
  ];

  // exit the for when result is found.
  let resultFound = false;
  for (let i = 0; i < checkList.length && !resultFound; i++) {
    const [div, resp] = checkList[i];
    resultFound = calculateResp(div, resp);
  }

  // todo this was commented because it is almost never used. Should it be uncommented?
  // if (!resultFound && isWidthFull(node, nodeWidth, parentWidth)) {
  //   propWidth = "full";
  // }

  return returnValue;
};

// set the width to max if the view is near the corner
// export const isWidthFull = (
//   node: AltSceneNode,
//   nodeWidth: number,
//   parentWidth: number
// ): boolean => {
//   // check if initial and final positions are within a magic number (currently 32)
//   // this will only be reached when parent is FRAME, so node.parent.x is always 0.
//   const betweenValueMargins =
//     node.x <= magicMargin && parentWidth - (node.x + nodeWidth) <= magicMargin;

//   // check if total width is at least 80% of the parent. This number is also a magic number and has worked fine so far.
//   const betweenPercentMargins = nodeWidth / parentWidth >= 0.8;

//   if (betweenValueMargins && betweenPercentMargins) {
//     return true;
//   }

//   return false;
// };
