import { AltSceneNode } from "./../common/altMixins";
import { pxToLayoutSize } from "./conversion_tables";

export const magicMargin = 32;

export const getContainerSizeProp = (node: AltSceneNode): string => {
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

  // if layoutAlign is STRETCH, w/h should be full
  if (
    node.parent &&
    node.layoutAlign === "STRETCH" &&
    "layoutMode" in node.parent
  ) {
    if (node.parent.layoutMode === "HORIZONTAL") {
      return "w-full ";
    } else if (node.parent.layoutMode === "VERTICAL") {
      // TODO. h-full? It isn't always reliable, but it is inside a Frame anyway..
    }
  }

  // console.log(
  //   "!nodeParent || ",
  //   AffectedByCustomAutoLayout[node.id],
  //   " - ",
  //   AffectedByCustomAutoLayout[node.parent.id]
  // );
  // console.log("node: ", node.name, "parent: ", nodeParent?.name);

  // if currentFrame has a rect that became a frame, let it define the size
  // if (CustomNodeMap[node.id] && CustomNodeMap[node.id].largestNode) {
  //   return "";
  // }

  // let changedChildren;
  // if (AffectedByCustomAutoLayout[node.id] === "changed") {
  //   // retrieve the children (get the parent, look at children and ignore the current node)
  //   changedChildren = node.parent.children.filter((d) => d !== node);
  // } else {
  //   if ("children" in node) {
  //     changedChildren = node.children;
  //   }
  // }

  let [nodeWidth, nodeHeight] = getNodeSizeWithStrokes(node);

  const hRem = pxToLayoutSize(nodeHeight);
  const wRem = pxToLayoutSize(nodeWidth);

  let propHeight = `h-${hRem} `;
  let propWidth = `w-${wRem} `;

  if (
    (("layoutMode" in node && node.layoutMode === "NONE") ||
      node.type === "GROUP") &&
    node.children.length > 1
  ) {
    return `${propWidth}${propHeight}`;
  }

  // calculate the responsivness using the correct parent
  const rW = calculateResponsiveW(node, nodeWidth);

  if (rW) {
    // if (rW === "full" && node.parent?.height === nodeHeight) {
    // ignore this responsiviness when container is exactly the same width and height
    // } else {
    // avoid relative width when parent is relative (therefore, child is probably absolute)
    if (!node.parent?.relativePos) {
      propWidth = `w-${rW} `;
    }

    // if (
    //   node.type === "FRAME" ||
    //   node.type === "GROUP" ||
    //   node.type === "TEXT"
    // ) {
    //   propWidth = `w-${rW} `;
    // }
    // }
  }

  // if parent is responsive, child can't be exact, or it will break the responsivess
  // todo should it be full or auto? What about when parent of parent is relative?
  // Should it calculate the width, check if it will be larger than responsiviness factor (like 1/3 of screen which is 200) and return full/auto?
  // if (
  //  TODO solve this
  //   // CustomNodeMap[node.parent.id] &&
  //   // CustomNodeMap[node.parent.id].customAutoLayoutDirection !== "false"
  // ) {
  //   // if node isn't a RECTANGLE and doesn't have relative width, return nothing.
  //   // todo support INSTANCE and COMPONENT
  //   if (node.type !== "RECTANGLE") {
  //     if (!rW) return "";
  //   }
  // }

  // when the child has the same size as the parent, don't set the size of the parent (twice)
  if ("children" in node && node.children && node.children.length === 1) {
    const child = node.children[0];
    // set them independently, in case w is equal but h isn't
    if (child.width === nodeWidth) {
      propWidth = "";
    }
    if (child.height === nodeHeight) {
      propHeight = "";
    }
  } else {
    // if (!("strokes" in node)) {
    //   // ignore Group
    //   return "";
    // }
  }

  // TODO fix again
  // if (AffectedByCustomAutoLayout[node.id] === "changed") {
  // PROS: Top bar with text (fig to code)
  // CONS: 1/3 in parent (fig to code)
  // return "";
  // propHeight = "";

  // experimental, set size to auto, like in the real autolayout
  // the issue is text, which changes the width from component to component and can trigger this
  // let returnHere = true;
  // if (
  //   "width" in node &&
  //   nodeParent &&
  //   "width" in nodeParent &&
  //   changedChildren
  // ) {
  //   console.log("entrando1");
  //   // look if any children has a responsive width
  //   const isResp = changedChildren.every((d) =>
  //     calculateResponsiveW(d, node, d.width)
  //   );
  //   // if it has, don't return empty. Width needs to be set manually.
  //   if (isResp) {
  //     returnHere = false;
  //   }
  // }
  // console.log("changed will return here?! ", returnHere);
  // if (returnHere) {
  //   return "";
  // }
  // }

  // compare if height is same as parent, with a small threshold
  // commented because h-auto is better than h-full most of the time on responsiviness
  // todo improve this. Buggy in small layouts, good in big.
  // RECTANGLE can't have relative height

  // don't want to set the height to auto when autolayout is FIXED
  // const autoHeight = !(
  //   "layoutMode" in node && node.layoutMode === "HORIZONTAL"
  // );

  // Rectangle must have precise width/height, except if it just just became a Frame

  if (
    ("layoutMode" in node && node.layoutMode === "VERTICAL") ||
    ("layoutMode" in node &&
      node.layoutMode === "HORIZONTAL" &&
      node.counterAxisSizingMode === "AUTO") ||
    (node.type !== "RECTANGLE" && nodeHeight > 256) ||
    childLargerThanMaxSize(node, "y")
  ) {
    // propHeight = "h-full ";
    propHeight = "";
  }

  // if FRAME is too big for tailwind to handle, just let it be w-full or h-auto
  // if its width is larger than 256 or the sum of its children

  if (rW !== "") {
    return `${propWidth}${propHeight}`;
  }

  if ("layoutMode" in node) {
    // if there are no children, ignore AutoLayout. Figma does the same.
    if (node.children.length === 0) {
      return `${propWidth}${propHeight}`;
    }

    // if ((node.layoutMode !== "NONE" && rW) || CustomNodeMap[node.id]) {
    //   // if responsiviness was found, let it define the size of the container, else, auto
    //   return `${propWidth}`;
    // }

    if (node.counterAxisSizingMode === "FIXED") {
      // if counterAxisSizingMode === "AUTO", width and height won't be set. For every other case, it will be.
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
      if (rW) {
        return `${propWidth}`;
      }
    }
  } else {
    return `${propWidth}${propHeight}`;
  }

  return "";
};

// makes the view size bigger when there is a stroke
const getNodeSizeWithStrokes = (node: AltSceneNode): Array<number> => {
  let nodeHeight = node.height;
  let nodeWidth = node.width;

  if (!("strokes" in node)) {
    return [nodeWidth, nodeHeight];
  }

  // tailwind doesn't support OUTSIDE or CENTER, only INSIDE.
  // Therefore, to give the same feeling, the height and width will be slighly increased.
  // node.strokes.lenght is necessary because [strokeWeight] can exist even without strokes.
  if (node.strokes && node.strokes.length) {
    if (node.strokeAlign === "OUTSIDE") {
      nodeHeight += node.strokeWeight * 2;
      nodeWidth += node.strokeWeight * 2;
    } else if (node.strokeAlign === "CENTER") {
      nodeHeight += node.strokeWeight * 0.5;
      nodeWidth += node.strokeWeight * 0.5;
    }
  }

  if ("children" in node) {
    // if any children has an OUTSIDE or CENTER stroke and, with that stroke,
    // the child gets a size bigger than parent, adjust parent to be larger
    node.children
      .filter((d) => "strokeWeight" in d && d.strokes?.length > 0)
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
            if (nodeWidth < d.width + d.strokeWeight * 0.5) {
              nodeWidth += d.strokeWeight * 0.5;
            }
            if (nodeHeight < d.height + d.strokeWeight * 0.5) {
              nodeHeight += d.strokeWeight * 0.5;
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
    if (calculateResp(1, "full")) {
    } else if (calculateResp(1 / 2, "1/2")) {
    } else if (calculateResp(1 / 3, "1/3")) {
    } else if (calculateResp(2 / 3, "2/3")) {
    } else if (calculateResp(1 / 4, "1/4")) {
    } else if (calculateResp(3 / 4, "3/4")) {
    } else if (calculateResp(1 / 5, "1/5")) {
    } else if (calculateResp(1 / 6, "1/6")) {
    } else if (calculateResp(5 / 6, "5/6")) {
    } else if (calculateResp(1 / 12, "1/12")) {
    }
  }

  if ("width" in node.parent) {
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
      propWidth = "full";
    }
  }

  return propWidth;
};
