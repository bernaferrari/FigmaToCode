import { indentString } from "./../common/indentString";
import { AltGroupNode } from "./../altNodes/altMixins";
import {
  flutterBorderRadius,
  flutterBorder,
} from "./builderImpl/flutterBorder";
import { flutterSize } from "./builderImpl/flutterSize";
import {
  AltRectangleNode,
  AltEllipseNode,
  AltFrameNode,
} from "../altNodes/altMixins";
import { flutterPadding } from "./builderImpl/flutterPadding";
import { flutterBoxShadow } from "./builderImpl/flutterShadow";
import { flutterBoxDecorationColor } from "./builderImpl/flutterColor";

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
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
  const propBoxDecoration = node.type === "GROUP" ? "" : getBoxDecoration(node);

  const fSize = flutterSize(node);
  const size = fSize.width + fSize.height;
  const isExpanded = fSize.isExpanded;

  // todo Image & multiple fills

  /// if child is empty, propChild is empty
  const propChild = child ? `\nchild: ${child}` : "";

  // [propPadding] will be "padding: const EdgeInsets.symmetric(...)" or ""
  let propPadding = "";
  if (node.type === "FRAME") {
    propPadding = flutterPadding(node);
  }

  let result: string;
  if (size || propBoxDecoration) {
    // Container is a container if [propWidthHeight] and [propBoxDecoration] are set.
    const properties = `${size}${propBoxDecoration}${propPadding}${propChild}`;

    result = `Container(${indentString(properties)}\n),`;
  } else if (propPadding) {
    // if there is just a padding, add Padding
    const properties = `${propPadding}${propChild}`;

    result = `Padding(${indentString(properties)}\n),`;
  } else {
    result = child;
  }

  // Add Expanded() when parent is a Row/Column and width is full.
  if (isExpanded) {
    const properties = `\nchild: ${result}`;
    result = `Expanded(${indentString(properties)}\n),`;
  }

  return result;
};

const getBoxDecoration = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
): string => {
  const propBackgroundColor = flutterBoxDecorationColor(node.fills);
  const propBorder = flutterBorder(node);
  const propBoxShadow = flutterBoxShadow(node);
  const propBorderRadius = flutterBorderRadius(node);

  // modify the circle's shape when type is ellipse
  const propShape = node.type === "ELLIPSE" ? "\nshape: BoxShape.circle," : "";

  // generate the decoration, or just the backgroundColor when color is SOLID.
  if (
    propBorder ||
    propShape ||
    propBorder ||
    propBorderRadius ||
    propBackgroundColor[0] === "g"
  ) {
    const properties =
      propBorderRadius +
      propShape +
      propBorder +
      propBoxShadow +
      propBackgroundColor;

    return `\ndecoration: BoxDecoration(${indentString(properties)}\n),`;
  } else {
    return propBackgroundColor;
  }
};
