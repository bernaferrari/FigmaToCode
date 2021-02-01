import { indentString } from "./../../common/indentString";
import { AltEllipseNode, AltFrameNode } from "../../altNodes/altMixins";
import { AltSceneNode, AltRectangleNode } from "../../altNodes/altMixins";
import { flutterColorFromFills } from "./flutterColor";
import { numToAutoFixed } from "../../common/numToAutoFixed";

// generate the border, when it exists
export const flutterBorder = (node: AltSceneNode): string => {
  if (node.type === "GROUP" || !node.strokes || node.strokes.length === 0) {
    return "";
  }

  // retrieve the stroke color, when existent (returns "" otherwise)
  const propStrokeColor = flutterColorFromFills(node.strokes);

  // only add strokeWidth when there is a strokeColor (returns "" otherwise)
  const propStrokeWidth = `width: ${numToAutoFixed(node.strokeWeight)}, `;

  // generate the border, when it should exist
  return propStrokeColor && node.strokeWeight
    ? `\nborder: Border.all(${propStrokeColor} ${propStrokeWidth}),`
    : "";
};

export const flutterShape = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
): string => {
  const strokeColor = flutterColorFromFills(node.strokes);
  const side =
    strokeColor && node.strokeWeight > 0
      ? `\nside: BorderSide(width: ${node.strokeWeight}, ${strokeColor} ),`
      : "";

  if (node.type === "ELLIPSE") {
    return `\nshape: CircleBorder(${indentString(side)}${side ? "\n" : ""}),`;
  }

  const properties = side + flutterBorderRadius(node);
  return `\nshape: RoundedRectangleBorder(${indentString(properties)}\n),`;
};

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

  return node.cornerRadius !== figma.mixed
    ? `\nborderRadius: BorderRadius.circular(${numToAutoFixed(
        node.cornerRadius
      )}),`
    : `\nborderRadius: BorderRadius.only(topLeft: Radius.circular(${numToAutoFixed(
        node.topLeftRadius
      )}), topRight: Radius.circular(${numToAutoFixed(
        node.topRightRadius
      )}), bottomLeft: Radius.circular(${numToAutoFixed(
        node.bottomLeftRadius
      )}), bottomRight: Radius.circular(${numToAutoFixed(
        node.bottomRightRadius
      )}), ),`;
};
