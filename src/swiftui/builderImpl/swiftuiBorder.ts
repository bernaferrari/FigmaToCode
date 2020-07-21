import { retrieveFill } from "./../../common/retrieveFill";
import { AltSceneNode } from "../../altNodes/altMixins";
import { swiftuiColor } from "./swiftuiColor";
import { numToAutoFixed } from "../../common/numToAutoFixed";

/**
 * Generate border or an overlay with stroke.
 * In Flutter and Tailwind, setting the border sets for both fill and stroke. Not in SwiftUI.
 * This method, therefore, only serves for the stroke/border and not for roundness of the layer behind.
 * Also, it only works when there is a fill. When there isn't, [swiftuiShapeStroke] should be used.
 *
 * @param node with hopefully a fill object in [node.strokes].
 * @returns a string with overlay, when there node has a corner radius, or just border. If no color is found in node.strokes, return "".
 */
export const swiftuiBorder = (node: AltSceneNode): string => {
  if (node.type === "GROUP" || !node.strokes || node.strokes.length === 0) {
    return "";
  }

  const propStrokeColor = swiftuiColor(node.strokes);
  const lW = numToAutoFixed(node.strokeWeight);
  const fill = retrieveFill(node.fills);

  if (propStrokeColor && node.strokeWeight) {
    const roundRect = swiftuiRoundedRectangle(node);
    if (roundRect) {
      return `\n.overlay(${roundRect}.stroke(${propStrokeColor}, lineWidth: ${lW}))`;
    } else if (node.type === "RECTANGLE" && !fill) {
      // this scenario was taken care already by [swiftuiShapeStroke]
      return "";
    }

    if (node.type === "ELLIPSE" && fill) {
      // add overlay, to not loose the current fill
      return `\n.overlay(Ellipse().stroke(${propStrokeColor}, lineWidth: ${lW}))`;
    } else if (node.type === "ELLIPSE" && !fill) {
      // this scenario was taken care already by [swiftuiShapeStroke]
      return "";
    }

    // border can be put before or after frame()
    return `\n.border(${propStrokeColor}, width: ${lW})`;
  }

  return "";
};

// .stroke() must be called near the shape declaration, but .overlay() must be called after frame().
// Stroke and Border were split. This method deals with stroke, and the other one with overlay.
export const swiftuiShapeStroke = (node: AltSceneNode): string => {
  if (node.type === "GROUP" || !node.strokes || node.strokes.length === 0) {
    return "";
  }

  const propStrokeColor = swiftuiColor(node.strokes);
  const lW = numToAutoFixed(node.strokeWeight);

  if (propStrokeColor && node.strokeWeight) {
    const fill = retrieveFill(node.fills);

    // only add stroke when there isn't a fill set.
    if (node.type === "ELLIPSE" && !fill) {
      return `\n.stroke(${propStrokeColor}, lineWidth: ${lW})`;
    }

    const roundRect = swiftuiRoundedRectangle(node);
    if (!roundRect && node.type === "RECTANGLE" && !fill) {
      return `\n.stroke(${propStrokeColor}, lineWidth: ${lW})`;
    }
  }

  return "";
};

/**
 * Produce a Rectangle with border radius.
 * The reason this was extracted into its own method is for reusability in [swiftuiBorder],
 * where a RoundedRectangle is needed again to be part of the overlay.
 *
 * @param node with cornerRadius and topLeftRadius properties.
 * @returns a string with RoundedRectangle, if node has a corner larger than zero; else "".
 */
export const swiftuiCornerRadius = (node: AltSceneNode): string => {
  if (
    "cornerRadius" in node &&
    node.cornerRadius !== figma.mixed &&
    node.cornerRadius > 0
  ) {
    return numToAutoFixed(node.cornerRadius);
  } else {
    if (!("topLeftRadius" in node)) {
      return "";
    }

    // SwiftUI doesn't support individual corner radius, so get the largest one
    const maxBorder = Math.max(
      node.topLeftRadius,
      node.topRightRadius,
      node.bottomLeftRadius,
      node.bottomRightRadius
    );

    if (maxBorder > 0) {
      return numToAutoFixed(maxBorder);
    }
  }

  return "";
};

/**
 * Produce a Rectangle with border radius.
 * The reason this was extracted into its own method is for reusability in [swiftuiBorder],
 * where a RoundedRectangle is needed again to be part of the overlay.
 *
 * @param node with cornerRadius and topLeftRadius properties.
 * @returns a string with RoundedRectangle, if node has a corner larger than zero; else "".
 */
export const swiftuiRoundedRectangle = (node: AltSceneNode): string => {
  const corner = swiftuiCornerRadius(node);
  if (corner) {
    return `RoundedRectangle(cornerRadius: ${corner})`;
  }

  return "";
};
