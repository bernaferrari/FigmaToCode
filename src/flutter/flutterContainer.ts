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
  const propWidthHeight = flutterSize(node);

  // todo Image, Gradient & multiple fills

  /// if child is empty, propChild is empty
  const propChild = child ? `child: ${child}` : "";

  // [propPadding] will be "padding: const EdgeInsets.symmetric(...)" or ""
  let propPadding = "";
  if (node.type === "FRAME") {
    propPadding = flutterPadding(node);
  }

  if (propWidthHeight || propBoxDecoration) {
    // Container is a container if [propWidthHeight] and [propBoxDecoration] are set.
    return `\nContainer(${propWidthHeight}${propBoxDecoration}${propPadding}${propChild}),`;
  } else if (propPadding) {
    // if there is just a padding, add Padding
    return `\nPadding(${propPadding}${propChild}),`;
  } else {
    return child;
  }
};

const getBoxDecoration = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
): string => {
  const propBackgroundColor = flutterBoxDecorationColor(node.fills);
  const propBorder = flutterBorder(node);
  const propBoxShadow = flutterBoxShadow(node);
  const propBorderRadius = flutterBorderRadius(node);

  // modify the circle's shape when type is ellipse
  const propShape = node.type === "ELLIPSE" ? "shape: BoxShape.circle, " : "";

  // generate the decoration, or just the backgroundColor when color is SOLID.
  return propBorder ||
    propShape ||
    propBorder ||
    propBorderRadius ||
    propBackgroundColor[0] === "g"
    ? `decoration: BoxDecoration(${propBorderRadius}${propShape}${propBorder}${propBoxShadow}${propBackgroundColor}), `
    : `${propBackgroundColor}`;
};
