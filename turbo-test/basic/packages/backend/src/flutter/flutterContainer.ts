import {
  AltRectangleNode,
  AltEllipseNode,
  AltFrameNode,
  AltGroupNode,
} from "../altNodes/altMixins";
import { indentString } from "../common/indentString";
import {
  flutterBorderRadius,
  flutterBorder,
} from "./builderImpl/flutterBorder";
import { flutterSize } from "./builderImpl/flutterSize";
import { flutterPadding } from "./builderImpl/flutterPadding";
import { flutterShadow } from "./builderImpl/flutterShadow";
import { flutterBoxDecorationColor } from "./builderImpl/flutterColor";
import {
  generateWidgetCode,
  propertyIfNotDefault,
} from "../common/numToAutoFixed";

export const flutterContainer = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode | AltGroupNode,
  child: string
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return child;
  }

  // ignore for Groups
  const propBoxDecoration = node.type === "GROUP" ? "" : getDecoration(node);

  const fSize = flutterSize(node);
  const isExpanded = fSize.isExpanded;

  // todo Image & multiple fills

  // [propPadding] will be "padding: const EdgeInsets.symmetric(...)" or ""
  let propPadding = "";
  if (node.type === "FRAME") {
    propPadding = flutterPadding(node);
  }

  let result: string;
  if (fSize.width || fSize.height || propBoxDecoration) {
    result = generateWidgetCode("Container", {
      width: fSize.width,
      height: fSize.height,
      padding: propPadding,
      decoration: propertyIfNotDefault(propBoxDecoration, "BoxDecoration()"),
      child: child,
    });
  } else if (propPadding) {
    // if there is just a padding, add Padding
    result = generateWidgetCode("Padding", {
      padding: propPadding,
      child: child,
    });
  } else {
    result = child;
  }

  // Add Expanded() when parent is a Row/Column and width is full.
  if (isExpanded) {
    result = generateWidgetCode("Expanded", {
      padding: propPadding,
      child: result,
    });
  }

  return result;
};

const getDecoration = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
): string => {
  const propBackgroundColor = flutterBoxDecorationColor(node.fills);

  // TODO Bernardo: add support for shapeDecoration
  // if (
  //   node.type === "ELLIPSE" ||
  //   node.type === "STAR" ||
  //   node.type === "POLYGON"
  // ) {
  //   return `\ndecoration: ShapeDecoration(${indentString(
  //     propBorderRadius + propBorder + propBoxShadow,
  //     2
  //   )}\n),`;
  // }

  const propBorder = flutterBorder(node);
  const propBoxShadow = flutterShadow(node, "boxShadow");
  const propBorderRadius = flutterBorderRadius(node);

  // generate the decoration, or just the backgroundColor when color is SOLID.
  return generateWidgetCode("BoxDecoration", {
    borderRadius: propBorderRadius,
    boxShadow: propBoxShadow,
    border: propBorder,
  });
};
