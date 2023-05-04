import {
  generateWidgetCode,
  printPropertyIfNotDefault,
} from "./../../common/numToAutoFixed";
import {
  AltEllipseNode,
  AltFrameNode,
  AltSceneNode,
  AltRectangleNode,
} from "../../altNodes/altMixins";
import { sliceNum } from "../../common/numToAutoFixed";
import { flutterColorFromFills2 } from "./flutterColor";

// generate the border, when it exists
export const flutterBorder = (node: AltSceneNode): string => {
  if (node.type === "GROUP" || !node.strokes || node.strokes.length === 0) {
    return "";
  }

  let strokeAlign = "";
  switch (node.strokeAlign) {
    case "CENTER":
      strokeAlign = "strokeAlign: BorderSide.strokeAlignCenter";
    case "OUTSIDE":
      strokeAlign = "strokeAlign: BorderSide.strokeAlignOutside";
    case "INSIDE":
    default:
      break;
  }

  const color = flutterColorFromFills2(node.strokes);

  if ("strokeTopWeight" in node) {
    if (
      node.strokeTopWeight === node.strokeBottomWeight &&
      node.strokeTopWeight &&
      node.strokeRightWeight &&
      node.strokeTopWeight === node.strokeLeftWeight
    ) {
      return generateWidgetCode("Border.all", {
        width: printPropertyIfNotDefault("width", node.strokeLeftWeight, 0),
        strokeAlign: strokeAlign,
        color: color,
      });
    } else {
      return generateWidgetCode("Border.only", {
        left: generateWidgetCode("BorderSide", {
          width: printPropertyIfNotDefault("width", node.strokeLeftWeight, 0),
          strokeAlign: strokeAlign,
          color: color,
        }),
        top: generateWidgetCode("BorderSide", {
          width: printPropertyIfNotDefault("width", node.strokeTopWeight, 0),
          strokeAlign: strokeAlign,
          color: color,
        }),
        right: generateWidgetCode("BorderSide", {
          width: printPropertyIfNotDefault("width", node.strokeTopWeight, 0),
          strokeAlign: strokeAlign,
          color: color,
        }),
        bottom: generateWidgetCode("BorderSide", {
          width: printPropertyIfNotDefault("width", node.strokeTopWeight, 0),
          strokeAlign: strokeAlign,
          color: color,
        }),
      });
    }
  } else {
  }

  // only add strokeWidth when there is a strokeColor (returns "" otherwise)
  let propStrokeWidth: string = "";
  if (node.strokeWeight !== figma.mixed && node.strokeWeight !== 0) {
    propStrokeWidth = printPropertyIfNotDefault("width", node.strokeWeight, 1);
  }

  return generateWidgetCode("Border.all", {
    width: propStrokeWidth,
    strokeAlign: strokeAlign,
    color: color,
  });
};

// export const flutterShape = (
//   node: AltRectangleNode | AltEllipseNode | AltFrameNode
// ): string => {
//   const strokeColor = flutterColorFromFills(node.strokes);
//   const side =
//     strokeColor && node.strokeWeight > 0
//       ? `\nside: BorderSide(width: ${node.strokeWeight}, ${strokeColor} ),`
//       : "";

//   if (node.type === "ELLIPSE") {
//     return `\nshape: CircleBorder(${indentString(side)}${side ? "\n" : ""}),`;
//   }

//   const properties = side + flutterBorderRadius(node);
//   return `\nshape: RoundedRectangleBorder(${indentString(properties)}\n),`;
// };

// retrieve the borderRadius, when existent (returns "" for EllipseNode)
export const flutterBorderRadius = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
): string => {
  if (node.type === "ELLIPSE") return "";

  if (
    node.cornerRadius === 0 ||
    (node.cornerRadius === undefined && node.topLeftRadius === undefined)
  ) {
    return "";
  }

  if (node.cornerRadius !== figma.mixed) {
    return printPropertyIfNotDefault(
      "borderRadius",
      `BorderRadius.circular(${sliceNum(node.cornerRadius)})`,
      "BorderRadius.circular(0)"
    );
  } else {
    return generateWidgetCode("BorderRadius.only", {
      topLeft: printPropertyIfNotDefault(
        "topLeft",
        `Radius.circular(${sliceNum(node.topLeftRadius)})`,
        "Radius.circular(0)"
      ),
      topRight: printPropertyIfNotDefault(
        "topRight",
        `Radius.circular(${sliceNum(node.topRightRadius)})`,
        "Radius.circular(0)"
      ),
      bottomLeft: printPropertyIfNotDefault(
        "bottomLeft",
        `Radius.circular(${sliceNum(node.bottomLeftRadius)})`,
        "Radius.circular(0)"
      ),
      bottomRight: printPropertyIfNotDefault(
        "bottomRight",
        `Radius.circular(${sliceNum(node.bottomRightRadius)})`,
        "Radius.circular(0)"
      ),
    });
  }
};
