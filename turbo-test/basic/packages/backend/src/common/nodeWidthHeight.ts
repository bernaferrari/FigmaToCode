export const magicMargin = 32;

type SizeResult = {
  readonly width: "fill" | number | null;
  readonly height: "fill" | number | null;
};

function getUpdatedNodeDimension(
  node: SceneNode,
  sizingMode: "AUTO" | "FIXED",
  direction: "WIDTH" | "HEIGHT" | "NONE",
  dimensionValue: number
): number | "fill" | null {
  if ("layoutAlign" in node) {
    if (
      (direction === "WIDTH" && node.layoutGrow === 1) ||
      (direction === "HEIGHT" && node.layoutAlign === "STRETCH")
    ) {
      if (node.parent) {
        return "fill";
      } else {
        return dimensionValue;
      }
    }
  }
  if (sizingMode === "FIXED") {
    return dimensionValue;
  }
  return null;
}

// Update for latest Figma APIs. The old one is still being used for Tailwind.
export const nodeSize = (node: SceneNode): SizeResult => {
  if ("layoutMode" in node) {
    switch (node.layoutMode) {
      case "HORIZONTAL":
        return {
          width: getUpdatedNodeDimension(
            node,
            node.primaryAxisSizingMode,
            "WIDTH",
            node.width
          ),
          height: getUpdatedNodeDimension(
            node,
            node.counterAxisSizingMode,
            "HEIGHT",
            node.height
          ),
        };
      case "VERTICAL":
        return {
          width: getUpdatedNodeDimension(
            node,
            node.primaryAxisSizingMode,
            "WIDTH",
            node.width
          ),
          height: getUpdatedNodeDimension(
            node,
            node.counterAxisSizingMode,
            "HEIGHT",
            node.height
          ),
        };
      case "NONE":
        break;
    }
  }

  return {
    width: getUpdatedNodeDimension(node, "FIXED", "NONE", node.width),
    height: getUpdatedNodeDimension(node, "FIXED", "NONE", node.height),
  };
};

type responsive =
  | ""
  | "fill"
  | "1/2"
  | "1/3"
  | "2/3"
  | "1/4"
  | "3/4"
  | "1/5"
  | "1/6"
  | "5/6";

// const calculateResponsiveWH = (
//   node: SceneNode,
//   nodeWidthHeightNumber: number,
//   axis: "x" | "y"
// ): responsive => {
//   let returnValue: responsive = "";

//   if (nodeWidthHeightNumber > 384) {

//   }

//   if (!node.parent) {
//     return returnValue;
//   }

//   let parentWidthHeight;
//   if ("layoutMode" in node.parent && node.parent.layoutMode !== "NONE") {
//     if (axis === "x") {
//       // subtract padding from the layout width, so it can be full when compared with parent.
//       parentWidthHeight =
//         node.parent.width - node.parent.paddingLeft - node.parent.paddingRight;
//     } else {
//       // subtract padding from the layout height, so it can be full when compared with parent.
//       parentWidthHeight =
//         node.parent.height - node.parent.paddingTop - node.parent.paddingBottom;
//     }
//   } else {
//     parentWidthHeight = axis === "x" ? node.parent.width : node.parent.height;
//   }

//   // 0.01 of tolerance is enough for 5% of diff, i.e.: 804 / 400
//   const dividedWidth = nodeWidthHeightNumber / parentWidthHeight;

//   const calculateResp = (div: number, str: responsive) => {
//     if (Math.abs(dividedWidth - div) < 0.01) {
//       returnValue = str;
//       return true;
//     }
//     return false;
//   };

//   // they will try to set the value, and if false keep calculating
//   const checkList: Array<[number, responsive]> = [
//     [1 / 2, "1/2"],
//     [1 / 3, "1/3"],
//     [2 / 3, "2/3"],
//     [1 / 4, "1/4"],
//     [3 / 4, "3/4"],
//     [1 / 5, "1/5"],
//     [1 / 6, "1/6"],
//     [5 / 6, "5/6"],
//   ];

//   // exit the for when result is found.
//   let resultFound = false;
//   for (let i = 0; i < checkList.length && !resultFound; i++) {
//     const [div, resp] = checkList[i];
//     resultFound = calculateResp(div, resp);
//   }

//   return returnValue;
// };
