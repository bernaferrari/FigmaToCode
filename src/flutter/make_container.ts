import {
  AltRectangleNode,
  AltEllipseNode,
  AltFrameNode,
} from "../common/altMixins";
import { rgbaTohex, flutterColor } from "./flutter_helpers";
import { nodeWidthHeight } from "../common/nodeWidthHeight";

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const makeContainer = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode,
  child: string
) => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return child;
  }

  const propBoxDecoration: string = getContainerDecoration(node);

  const size = nodeWidthHeight(node, false);
  let propWidth = size.width ? `width: ${size.width}, ` : "";
  let propHeight = size.height ? `height: ${size.height}, ` : "";
  const propWidthHeight: string = `SizedBox(${propWidth}${propHeight})`;

  if (node.fills !== figma.mixed && node.fills.length > 0) {
    let fill = node.fills[0];

    // todo IMAGE and multiple Gradients
    if (fill.type === "IMAGE") {
    }
  }

  /// CONTAINER
  /// Put everything together
  const propChild: string = child ? `child: ${child}` : "";

  // [propPadding] will be "padding: const EdgeInsets.symmetric(...)" or ""
  let propPadding: string = "";
  if (node.type === "FRAME") {
    propPadding = getPaddingProp(node);
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

const getContainerDecoration = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
): string => {
  /// DECORATION
  /// This is the code that will generate the BoxDecoration for the Container

  // retrieve the fill color, when existent (returns "" otherwise)
  const propBackgroundColor = flutterColor(node.fills);

  // retrieve the stroke color, when existent (returns "" otherwise)
  const propStrokeColor = flutterColor(node.strokes);

  // only add strokeWidth when there is a strokeColor (returns "" otherwise)
  const propStrokeWidth = propStrokeColor ? `width: ${node.strokeWeight},` : "";

  // modify the circle's shape when type is ellipse
  const propShape = node.type === "ELLIPSE" ? "shape: BoxShape.circle," : "";

  // generate the border, when it should exist
  const propBorder =
    propStrokeColor || propStrokeWidth
      ? `border: Border.all(${propStrokeColor}${propStrokeWidth}),`
      : "";

  let propBoxShadow = "";
  if (node.effects.length > 0) {
    const drop_shadow: Array<ShadowEffect> = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );
    let boxShadow = "";
    if (drop_shadow) {
      drop_shadow.forEach((d: ShadowEffect) => {
        const color = `color: Color(0x${rgbaTohex(d.color)}, `;
        const radius = `blurRadius: ${d.radius}, `;
        const offset = `offset: Offset(${d.offset.x}, ${d.offset.y}), `;
        boxShadow += `BoxShadow(${color}${radius}${offset}),),`;
      });
    }
    // TODO inner shadow, layer blur
    propBoxShadow = `boxShadow: [ ${boxShadow} ],`;
  }

  // retrieve the borderRadius, when existent (returns "" for EllipseNode)
  const propBorderRadius = getCornerRadiusProp(node);

  // generate the decoration, or just the backgroundColor
  return node.cornerRadius !== 0 || propStrokeColor || propShape
    ? `decoration: BoxDecoration(${propBorderRadius}${propShape}${propBorder}${propBoxShadow}${propBackgroundColor}),`
    : `${propBackgroundColor}`;
};

const getCornerRadiusProp = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
) => {
  if (node.type === "ELLIPSE") return "";

  if (node.cornerRadius === 0 || node.cornerRadius === undefined) {
    return "";
  }

  return node.cornerRadius !== figma.mixed
    ? `borderRadius: BorderRadius.circular(${node.cornerRadius}), `
    : `borderRadius: BorderRadius.only(topLeft: ${node.topLeftRadius}, topRight: ${node.topRightRadius}, bottomLeft: ${node.bottomLeftRadius}, bottomRight: ${node.bottomRightRadius}), `;
};

const getPaddingProp = (node: AltFrameNode): string => {
  // Add padding if necessary!
  // This must happen before Stack or after the Positioned, but not before.

  // padding is only valid for auto layout.
  // [horizontalPadding] and [verticalPadding] can have values even when AutoLayout is off
  if (node.layoutMode === "NONE") return "";

  if (node.horizontalPadding > 0 || node.verticalPadding > 0) {
    const propHorizontalPadding =
      node.horizontalPadding > 0
        ? `horizontal: ${node.horizontalPadding}, `
        : "";

    const propVerticalPadding =
      node.verticalPadding > 0 ? `vertical: ${node.verticalPadding}, ` : "";

    return `padding: const EdgeInsets.symmetric(${propVerticalPadding}${propHorizontalPadding}),`;
  }
  return "";
};
