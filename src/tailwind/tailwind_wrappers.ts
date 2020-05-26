import { mostFrequentString } from "./tailwind_helpers";
import { magicMargin } from "./tailwind_widget";

export const nearestValue = (goal: number, array: Array<number>) => {
  return array.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
};

const pxToRem = (pxValue: number): number => {
  return pxValue / 16;
};

export const mapLetterSpacing: Record<number, string> = {
  "-0.05": "tighter",
  "-0.025": "tight",
  // 0: "normal",
  0.025: "wide",
  0.05: "wider",
  0.1: "widest",
};

export const mapAbsoluteLineHeight: Record<number, string> = {
  0.75: "3",
  1: "4",
  1.25: "5",
  1.5: "6",
  1.75: "7",
  2: "8",
  2.25: "9",
  2.5: "10",
};

export const mapFontSize: Record<number, string> = {
  0.75: "xs",
  0.875: "sm",
  1: "base",
  1.125: "lg",
  1.25: "xl",
  1.5: "2xl",
  1.875: "3xl",
  2.25: "4xl",
  3: "5xl",
  4: "6xl",
};

export const mapBorderRadius: Record<number, string> = {
  // 0: "none",
  0.125: "sm",
  0.25: "base",
  0.375: "md",
  0.5: "lg",
  10: "full",
};

export const mapWidthHeightSize: Record<number, string> = {
  0: "0",
  0.25: "1",
  0.5: "2",
  0.75: "3",
  1: "4",
  1.25: "5",
  1.5: "6",
  2: "8",
  2.5: "10",
  3: "12",
  4: "16",
  5: "20",
  6: "24",
  8: "32",
  10: "40",
  12: "58",
  14: "56",
  16: "64",
};

export const convertPxToTailwindAttr = (
  value: number,
  conversionMap: Record<number, string>
) => {
  return conversionMap[
    nearestValue(
      pxToRem(value),
      Object.keys(conversionMap).map((d) => +d)
    )
  ];
};

const calculateIntervalY = (node: ChildrenMixin): Array<number> => {
  const orderedChildren: Array<SceneNode> = [...node.children];
  const childrenY: Array<SceneNode> = orderedChildren.sort((a, b) => a.y - b.y);
  const intervalY = [];
  for (var i = 0; i < childrenY.length - 1; i++) {
    intervalY.push(childrenY[i + 1].y - (childrenY[i].y + childrenY[i].height));
  }
  return intervalY;
};

const calculateIntervalX = (node: ChildrenMixin): Array<number> => {
  const orderedChildren: Array<SceneNode> = [...node.children];
  const childrenX: Array<SceneNode> = orderedChildren.sort((a, b) => a.x - b.x);
  const intervalY = [];
  for (var i = 0; i < childrenX.length - 1; i++) {
    intervalY.push(childrenX[i + 1].x - (childrenX[i].x + childrenX[i].width));
  }
  return intervalY;
};

const sd = (numbers: Array<number>) => {
  const mean = numbers.reduce((acc, n) => acc + n) / numbers.length;
  return Math.sqrt(
    numbers.reduce((acc, n) => (n - mean) ** 2) / (numbers.length - 1)
  );
};

export const isInsideAutoAutoLayout = (
  node: ChildrenMixin
): ["false" | "sd-x" | "sd-y", Array<number>] => {
  const intervalY = calculateIntervalY(node);

  if (intervalY.length === 0) {
    return ["false", []];
  }

  if (intervalY.every((d) => d < 0)) {
    const intervalX = calculateIntervalX(node);
    const standardDeviation = sd(intervalX);
    // [standardDeviation] is Infinity when [intervalX] len is 1
    if (
      standardDeviation === Infinity ||
      standardDeviation < autoLayoutTolerance
    ) {
      return ["sd-x", intervalX];
    }
  } else if (intervalY.every((d) => d > 0)) {
    const standardDeviation = sd(intervalY);
    // [standardDeviation] is Infinity when [intervalY] len is 1
    if (
      standardDeviation === Infinity ||
      standardDeviation < autoLayoutTolerance
    ) {
      return ["sd-y", intervalY];
    }
  }

  return ["false", []];
};

// this is a magic number
const autoLayoutTolerance = 4;

export const retrieveContainerPosition = (
  node: SceneNode,
  parentId: string
): string => {
  const parent = node.parent;

  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (parent === null) {
    //|| parentId === parent.id
    return "";
  }

  if (
    (parent.type === "GROUP" && parent.children.length > 1) ||
    ("layoutMode" in parent &&
      parent.layoutMode === "NONE" &&
      parent.children.length > 1)
  ) {
    // check if view is in a stack. Group and Frames must have more than 1 element
    // [--x--][-width-][--x--]
    // that's how the formula below works, to see if view is centered

    // this is needed for Groups, where node.x is not relative to zero. This is ignored for Frame.
    const parentX = "layoutMode" in parent ? 0 : parent.x;
    const parentY = "layoutMode" in parent ? 0 : parent.y;

    const centerX = 2 * (node.x - parentX) + node.width === parent.width;
    const centerY = 2 * (node.y - parentY) + node.height === parent.height;

    if (centerX && centerY) {
      // this was the only I could manage to center a div with absolute
      // https://stackoverflow.com/a/59807846
      if (node.type === "TEXT") {
        // frame don't need to be centered
        return "absolute inset-0 flex items-center justify-center ";
      }
      return "absolute inset-0 ";
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
    let prop = "";

    if (parent.type === "GROUP" || "layoutMode" in parent) {
      const autoAutoLayout = isInsideAutoAutoLayout(parent);
      if (autoAutoLayout[0] === "sd-y" || "layoutMode" in node) {
        // centerX threshold
        if (parent.width - (node.x * 2 + node.width) < 2) {
          prop += `mx-${convertPxToTailwindAttr(node.x, mapWidthHeightSize)} `;
        } else {
          if (node.x > 0 && node.x < magicMargin) {
            prop += `ml-${convertPxToTailwindAttr(
              node.x,
              mapWidthHeightSize
            )} `;
          }
          if (parent.width - (node.x + node.width) < magicMargin) {
            const size = parent.width - node.x - node.width;
            prop += `mr-${convertPxToTailwindAttr(size, mapWidthHeightSize)} `;
          }
        }
      }

      if (autoAutoLayout[0] === "sd-x" || "layoutMode" in node) {
        // centerY threshold
        if (parent.height - (node.y * 2 + node.height) < 2) {
          prop += `my-${convertPxToTailwindAttr(node.y, mapWidthHeightSize)} `;
        } else {
          if (node.y > 0 && node.y < magicMargin) {
            prop += `mt-${convertPxToTailwindAttr(
              node.y,
              mapWidthHeightSize
            )} `;
          }
          if (parent.height - (node.y + node.height) < magicMargin) {
            const size = parent.height - node.y - node.height;
            prop += `mb-${convertPxToTailwindAttr(size, mapWidthHeightSize)} `;
          }
        }
      }
    }

    if (prop) {
      return prop;
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
