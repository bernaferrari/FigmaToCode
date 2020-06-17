import {
  AltRectangleNode,
  AltEllipseNode,
  AltFrameNode,
} from "../common/altMixins";
import { rgbaTohex, flutterColor } from "./flutter_helpers";
import { getContainerSizeProp } from "./make_container";

// https://api.flutter.dev/flutter/material/Material-class.html
export const makeMaterial = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode,
  child: string
) => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return child;
  }

  let color = flutterColor(node.fills);
  if (!color) {
    color = "color: Colors.transparent, ";
  }

  let shape = "";
  if (node.type === "ELLIPSE" || node.strokes.length > 0) {
    shape = getShape(node);
  } else {
    shape = getCornerRadiusProp(node);
  }

  let clip = false;
  if (
    node.type === "FRAME" &&
    node.cornerRadius !== 0 &&
    node.cornerRadius !== figma.mixed
  ) {
    clip = node.clipsContent;
  }
  let clipContent = clip ? "clipBehavior: Clip.antiAlias, " : "";

  let elevation = "";
  let shadowColor = "";

  if (node.effects.length > 0) {
    const drop_shadow: Array<ShadowEffect> = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );
    if (
      drop_shadow &&
      drop_shadow.length > 0 &&
      drop_shadow[0].type === "DROP_SHADOW"
    ) {
      shadowColor = `color: Color(0x${rgbaTohex(drop_shadow[0].color)}, `;
      elevation = `elevation: ${drop_shadow[0].radius}`;
    }
  }

  const padChild = child ? `child: ${getPadding(node, child)}` : "";

  const material = `\nMaterial(${color}${elevation}${shadowColor}${shape}${clipContent}${padChild}),`;

  const propWidthHeight: string = getContainerSizeProp(node);
  if (propWidthHeight) {
    return `SizedBox(${propWidthHeight}child: ${material}),`;
  }

  return `\nMaterial(${color}${elevation}${shadowColor}${shape}${clipContent}${padChild}),`;
};

const getShape = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
): string => {
  const strokeColor = flutterColor(node.strokes);

  const side = `side: BorderSide(width: ${node.strokeWeight}, ${strokeColor}), `;
  if (node.type === "ELLIPSE") {
    return `shape: CircleBorder(${side})`;
  }

  // generate the decoration, or just the backgroundColor
  return `shape: RoundedRectangleBorder(${side}${getCornerRadiusProp(node)}),`;
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

const getPadding = (
  node: AltFrameNode | AltEllipseNode | AltRectangleNode,
  child: string
): string => {
  // Add padding if necessary!
  // This must happen before Stack or after the Positioned, but not before.

  // padding is only valid for auto layout.
  // [horizontalPadding] and [verticalPadding] can have values even when AutoLayout is off
  if (!("layoutMode" in node) || node.layoutMode === "NONE") return "";

  if (node.horizontalPadding > 0 || node.verticalPadding > 0) {
    const propHorizontalPadding =
      node.horizontalPadding > 0
        ? `horizontal: ${node.horizontalPadding}, `
        : "";

    const propVerticalPadding =
      node.verticalPadding > 0 ? `vertical: ${node.verticalPadding}, ` : "";

    return `Padding(padding: const EdgeInsets.symmetric(${propVerticalPadding}${propHorizontalPadding}), child: ${child}),`;
  }
  return child;
};
