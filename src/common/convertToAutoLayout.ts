import { AltFrameNode, AltGroupNode, AltSceneNode } from "./altMixins";
import { convertGroupToFrame } from "./convertGroupToFrame";

// if FRAME doesn't have an AutoLayout, try to detect it.
export const convertToAutoLayout = (
  node: AltFrameNode | AltGroupNode
): AltFrameNode | AltGroupNode => {
  // if node is GROUP or FRAME without AutoLayout, try to detect it.
  if (
    ("layoutMode" in node && node.layoutMode === "NONE") ||
    node.type === "GROUP"
  ) {
    node.children = reorderChildrenIfAligned(node.children);
    const [direction, interval] = detectAutoLayoutDirection(node.children);

    if (direction === "NONE" && node.children.length > 1) {
      node.relativePos = true;
      return node;
    }

    // if node is a group, convert to frame
    if (node.type === "GROUP") {
      node = convertGroupToFrame(node);
    }

    if (direction === "NONE" && node.children.length === 1) {
      // Add fake AutoLayout when there is a single item. We want the Padding.
      node.layoutMode = "HORIZONTAL";
    } else {
      node.layoutMode = direction;
    }

    node.itemSpacing = interval.length > 0 ? average(interval) : 0;

    const padding = detectAutoLayoutPadding(node);

    node.verticalPadding = padding?.vertical ?? 0;
    node.horizontalPadding = padding?.horizontal ?? 0;

    // update the layoutAlign attribute for every child
    node.children = node.children.map((d) => {
      // re-cast, else typechecker fails
      d.layoutAlign = detectChildrenAlign(d, node as AltFrameNode);
      return d;
    });

    node.relativePos = false;

    // counterAxisSizingMode = ??? auto when autolayout? auto when it was a group?
  } else {
    // if node already is AutoLayout, keep relativePos as off
    node.relativePos = false;
  }

  return node;
};

const average = (arr: Array<number>) =>
  arr.reduce((p, c) => p + c, 0) / arr.length;

const reorderChildrenIfAligned = (
  children: ReadonlyArray<AltSceneNode>
): Array<AltSceneNode> => {
  if (children.length === 1) {
    return [...children];
  }

  const intervalY = calculateInterval(children, "y");

  if (intervalY.length === 0) {
    // this should never happen if node.children > 1
    return [];
  }

  const updateChildren = [...children];

  // use 1 instead of 0 to avoid rounding errors (-0.00235 should be valid)
  if (average(intervalY) > -8) {
    // if all elements are horizontally layered
    return updateChildren.sort((a, b) => a.y - b.y);
  } else {
    const intervalX = calculateInterval(children, "x");

    if (average(intervalX) > -8) {
      // if all elements are vertically layered
      return updateChildren.sort((a, b) => a.x - b.x);
    }
  }

  return updateChildren;
};

// todo improve this to try harder
const detectAutoLayoutDirection = (
  children: ReadonlyArray<AltSceneNode>
): ["NONE" | "HORIZONTAL" | "VERTICAL", Array<number>] => {
  // check if elements are vertically aligned
  const intervalY = calculateInterval(children, "y");

  console.log("intervalY:", intervalY);
  if (intervalY.length === 0) {
    return ["NONE", []];
  }

  // use 1 instead of 0 to avoid rounding errors (-0.00235 should be valid)
  if (average(intervalY) >= -8) {
    // todo re-enable the standardDeviation calculation? This was used to test if layout elements have the same spacing
    // const standardDeviation = this.sd(intervalY);
    // if (standardDeviation < this.autoLayoutTolerance) {
    return ["VERTICAL", intervalY];
    // }
  } else {
    // check if elements are horizontally aligned
    const intervalX = calculateInterval(children, "x");
    console.log("intervalX:", intervalX);

    if (average(intervalX) >= -8) {
      // const standardDeviation = this.sd(intervalX);
      // if (standardDeviation < this.autoLayoutTolerance) {
      return ["HORIZONTAL", intervalX];
      // }
    }
  }

  return ["NONE", []];
};

const calculateInterval = (
  children: ReadonlyArray<AltSceneNode>,
  x_or_y: "x" | "y"
): Array<number> => {
  const h_or_w: "width" | "height" = x_or_y === "x" ? "width" : "height";

  // sort children based on X or Y values
  const sorted: Array<AltSceneNode> = [...children].sort(
    (a, b) => a[x_or_y] - b[x_or_y]
  );

  // calculate the distance between values (either vertically or horizontally)
  const interval = [];
  for (var i = 0; i < sorted.length - 1; i++) {
    interval.push(
      sorted[i + 1][x_or_y] - (sorted[i][x_or_y] + sorted[i][h_or_w])
    );
  }
  return interval;
};

// this is more verbose than I wanted, but is also more performant than calculating them independently.
const detectAutoLayoutPadding = (
  node: AltFrameNode
):
  | undefined
  | {
      horizontal: number;
      vertical: number;
    } => {
  // this need to be run before VERTICAL or HORIZONTAL
  if (node.children.length === 1) {
    // left padding is first element's y value
    const left = node.children[0].x;

    const right = node.width - (node.children[0].x + node.children[0].width);

    const top = node.children[0].y;

    const bottom = node.height - (node.children[0].y + node.children[0].height);

    // return the smallest padding in each axis
    return {
      horizontal: Math.min(left, right),
      vertical: Math.min(top, bottom),
    };
  } else if (node.layoutMode === "VERTICAL") {
    // top padding is first element's y value
    const top = node.children[0].y;

    // bottom padding is node height - last position + last height
    const last = node.children[node.children.length - 1];
    const bottom = node.height - (last.y + last.height);

    // the closest value to the left border
    const left = Math.min(...node.children.map((d) => d.x));

    // similar to [bottom] calculation, but using height and getting the minimum
    const right = Math.min(
      ...node.children.map((d) => node.width - (d.width + d.x))
    );

    // return the smallest padding in each axis
    return {
      horizontal: Math.min(left, right),
      vertical: Math.min(top, bottom),
    };
  } else if (node.layoutMode === "HORIZONTAL") {
    // left padding is first element's y value
    const left = node.children[0].x;

    // right padding is node width - last position + last width
    const last = node.children[node.children.length - 1];
    const right = node.width - (last.x + last.width);

    // the closest value to the top border
    const top = Math.min(...node.children.map((d) => d.y));

    // similar to [right] calculation, but using height and getting the minimum
    const bottom = Math.min(
      ...node.children.map((d) => node.height - (d.height + d.x))
    );

    // return the smallest padding in each axis
    return {
      horizontal: Math.min(left, right),
      vertical: Math.min(top, bottom),
    };
  }
};

// calculate the LayoutAlign for each children of the AutoLayout
const detectChildrenAlign = (
  node: AltSceneNode,
  parentNode: AltFrameNode
): "MIN" | "CENTER" | "MAX" | "STRETCH" => {
  if (parentNode.layoutMode === "VERTICAL") {
    const nodeCenteredPosX = node.x + node.width / 2;
    const parentCenteredPosX = parentNode.width / 2;

    const marginX = nodeCenteredPosX - parentCenteredPosX;
    console.log("marginX is", marginX);

    // allow a small threshold
    if (marginX < -4) {
      return "MIN";
    } else if (marginX > 4) {
      return "MAX";
    } else {
      return "CENTER";
    }
  } else if (parentNode.layoutMode === "HORIZONTAL") {
    const nodeCenteredPosY = node.y + node.height / 2;
    const parentCenteredPosY = parentNode.height / 2;

    const marginY = nodeCenteredPosY - parentCenteredPosY;

    // allow a small threshold
    if (marginY < -4) {
      return "MIN";
    } else if (marginY > 4) {
      return "MAX";
    } else {
      return "CENTER";
    }
  }

  // this should never be returned
  return "CENTER";
};
