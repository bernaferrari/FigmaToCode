let shouldOptimize: boolean;
shouldOptimize = true;

import {
  convertPxToTailwindAttr,
  mapWidthHeightSize,
} from "./tailwind_wrappers";

export const rowColumnProps = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  // ROW or COLUMN

  // [optimization]
  // flex, by default, has flex-row. Therefore, it can be omitted.
  const flexRow = shouldOptimize ? "" : "flex-row ";

  let rowOrColumn = node.layoutMode === "HORIZONTAL" ? flexRow : "flex-col ";

  // https://tailwindcss.com/docs/space/
  // space between items
  const spacing = convertPxToTailwindAttr(node.itemSpacing, mapWidthHeightSize);
  const spaceDirection = node.layoutMode === "HORIZONTAL" ? "x" : "y";

  // space is visually ignored when there are less than two children
  let space =
    shouldOptimize && node.children.length < 2
      ? ""
      : `space-${spaceDirection}-${spacing} `;

  // align according to the most frequent way the children are aligned.
  // todo layoutAlign should go to individual fields and this should be threated as an optimization
  // const layoutAlign =
  //   mostFrequentString(node.children.map((d) => d.layoutAlign)) === "MIN"
  //     ? ""
  //     : "items-center ";

  // [optimization]
  // when all children are STRETCH and layout is Vertical, align won't matter. Otherwise, item-center.
  const layoutAlign =
    node.layoutMode === "VERTICAL" &&
    node.children.every((d) => d.layoutAlign === "STRETCH")
      ? ""
      : "items-center ";

  // if parent is a Frame with AutoLayout set to Vertical, the current node should expand
  const flex =
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.layoutMode === "VERTICAL"
      ? "flex "
      : "inline-flex ";

  if (
    node.children.length === 1 &&
    "layoutMode" in node.children[0] &&
    node.children[0].layoutMode !== "NONE"
  ) {
    return "";
  }

  return `${flex}${rowOrColumn}${space}${layoutAlign}`;
};

export const magicMargin = 32;

export const getContainerSizeProp = (
  node:
    | DefaultFrameMixin // Frame
    | (BaseNodeMixin & LayoutMixin & ChildrenMixin) // Group
    | DefaultShapeMixin // Shapes
): string => {
  /// WIDTH AND HEIGHT

  // if layoutAlign is STRETCH, w/h should be full
  if (node.layoutAlign === "STRETCH") {
    if (node.parent && "layoutMode" in node.parent) {
      if (node.parent.layoutMode === "VERTICAL") {
        return "";
      }
    }
  }

  // when the child has the same size as the parent, don't set the size twice
  if ("layoutMode" in node) {
    if (node.children.length === 1) {
      const child = node.children[0];
      if (child.width === node.width && child.height && node.height) {
        return "";
      }
    }
  } else {
    // if (!("strokes" in node)) {
    //   // ignore Group
    //   return "";
    // }
  }

  let nodeHeight = node.height;
  let nodeWidth = node.width;

  // tailwind doesn't support OUTSIDE or CENTER, only INSIDE.
  // Therefore, to give the same feeling, the height and width will be slighly increased.
  // node.strokes.lenght is necessary because [strokeWeight] can exist even without strokes.
  if ("strokes" in node && node.strokes.length) {
    if (node.strokeAlign === "OUTSIDE") {
      nodeHeight += node.strokeWeight * 2;
      nodeWidth += node.strokeWeight * 2;
    } else if (node.strokeAlign === "CENTER") {
      nodeHeight += node.strokeWeight * 1.5;
      nodeWidth += node.strokeWeight * 1.5;
    }
  }

  const hRem = convertPxToTailwindAttr(nodeHeight, mapWidthHeightSize);
  const wRem = convertPxToTailwindAttr(nodeWidth, mapWidthHeightSize);

  let propHeight = `h-${hRem} `;
  let propWidth = `w-${wRem} `;

  // if OUTSIDE stroke is set, the result might be weird, so manually increase the view size
  // if (nodeWidth !== node.width && +wRem < 32) {
  //   if (wRem === convertPxToTailwindAttr(node.width, mapWidthHeightSize)) {
  //     const arr = Object.values(mapWidthHeightSize)
  //       .map((d) => +d)
  //       .sort((a, b) => a - b);
  //     const index = arr.indexOf(+wRem);

  //     // no need to check maximum array because of < 32 above
  //     propWidth = `w-${arr[index + 1]} `;
  //   }
  // }

  // if (nodeHeight !== node.height && +hRem < 32) {
  //   if (hRem === convertPxToTailwindAttr(node.height, mapWidthHeightSize)) {
  //     const arr = Object.values(mapWidthHeightSize)
  //       .map((d) => +d)
  //       .sort((a, b) => a - b);
  //     const index = arr.indexOf(+hRem);
  //     // no need to check maximum array because of < 32 above
  //     propHeight = `h-${arr[index + 1]} `;
  //   }
  // }

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
    }
  } else {
    return `${propWidth}${propHeight}`;
  }

  return "";
};
