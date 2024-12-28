import { commonStroke } from "./../../common/commonStroke";
import { getCommonRadius } from "../../common/commonRadius";
import { sliceNum } from "../../common/numToAutoFixed";
import { swiftUISolidColor } from "./swiftuiColor";
import { SwiftUIElement } from "./swiftuiParser";
import { SwiftUIModifier } from "types";

const swiftUIStroke = (node: SceneNode): number => {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    return 0;
  }

  const stroke = commonStroke(node, 2);

  if (!stroke) {
    return 0;
  }

  if ("all" in stroke) {
    return stroke.all;
  }

  return Math.max(stroke.left, stroke.top, stroke.right, stroke.bottom);
};

/**
 * Generate border or an overlay with stroke.
 * In Flutter and Tailwind, setting the border sets for both fill and stroke. Not in SwiftUI.
 * This method, therefore, only serves for the stroke/border and not for roundness of the layer behind.
 * Also, it only works when there is a fill. When there isn't, [swiftuiShapeStroke] should be used.
 *
 * @param node with hopefully a fill object in [node.strokes].
 * @returns a string with overlay, when there node has a corner radius, or just border. If no color is found in node.strokes, return "".
 */
export const swiftuiBorder = (node: SceneNode): string[] | null => {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    return null;
  }

  const width = swiftUIStroke(node);
  const inset = strokeInset(node, width);

  if (!width) {
    return null;
  }

  return node.strokes
    .map((stroke) => {
      const strokeColor = swiftUISolidColor(stroke);

      const strokeModifier: SwiftUIModifier = [
        "stroke",
        `${strokeColor}, lineWidth: ${sliceNum(width)}`,
      ];

      if (strokeColor) {
        return new SwiftUIElement(getViewType(node))
          .addModifier(inset)
          .addModifier(strokeModifier)
          .toString();
      }

      return null;
    })
    .filter((d) => d !== null) as string[];
};

const getViewType = (node: SceneNode): string => {
  if (node.type === "ELLIPSE") {
    return "Ellipse()";
  }

  const corner = swiftuiCornerRadius(node);
  if (corner) {
    return `RoundedRectangle(cornerRadius: ${corner})`;
  } else {
    return "Rectangle()";
  }
};

const strokeInset = (
  node: MinimalStrokesMixin,
  width: number,
): [string, string | null] => {
  switch (node.strokeAlign) {
    case "INSIDE":
      return ["inset", `by: ${sliceNum(width)}`];
    case "OUTSIDE":
      return ["inset", `by: -${sliceNum(width)}`];
    case "CENTER":
      return ["inset", null];
  }
};

/**
 * Produce a Rectangle with border radius.
 * The reason this was extracted into its own method is for reusability in [swiftuiBorder],
 * where a RoundedRectangle is needed again to be part of the overlay.
 *
 * @param node with cornerRadius and topLeftRadius properties.
 * @returns a string with RoundedRectangle, if node has a corner larger than zero; else "".
 */
export const swiftuiCornerRadius = (node: SceneNode): string => {
  const radius = getCommonRadius(node);
  if ("all" in radius) {
    if (radius.all > 0) {
      return sliceNum(radius.all);
    } else {
      return "";
    }
  }

  // SwiftUI doesn't support individual corner radius, so get the largest one
  const maxBorder = Math.max(
    radius.topLeft,
    radius.topRight,
    radius.bottomLeft,
    radius.bottomRight,
  );

  if (maxBorder > 0) {
    return sliceNum(maxBorder);
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
export const swiftuiRoundedRectangle = (node: SceneNode): string => {
  const corner = swiftuiCornerRadius(node);
  if (corner) {
    return `RoundedRectangle(cornerRadius: ${corner})`;
  }

  return "";
};
