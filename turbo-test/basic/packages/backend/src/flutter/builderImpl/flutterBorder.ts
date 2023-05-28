import {
  generateWidgetCode,
  printPropertyIfNotDefault,
  propertyIfNotDefault,
  skipDefaultProperty,
} from "./../../common/numToAutoFixed";
import { sliceNum } from "../../common/numToAutoFixed";
import { flutterColorFromFills2 } from "./flutterColor";
import { getStrokeAlign } from "../flutterContainer";
import { getCommonRadius } from "../../common/commonRadius";

// generate the border, when it exists
export const flutterBorder = (node: SceneNode): string => {
  if (
    node.type === "GROUP" ||
    !("strokes" in node) ||
    !node.strokes ||
    node.strokes.length === 0
  ) {
    return "";
  }

  const color = skipDefaultProperty(
    flutterColorFromFills2(node.strokes),
    "Colors.black"
  );

  const strokeAlign = skipDefaultProperty(
    getStrokeAlign(node),
    "BorderSide.strokeAlignInside"
  );

  if ("strokeTopWeight" in node) {
    // In the future, only add borderSides when width !== 0.
    // This is kind of a bug in Flutter, Border requires all sides to be the same color.
    return generateWidgetCode("Border.only", {
      left: generateWidgetCode("BorderSide", {
        width: skipDefaultProperty(node.strokeLeftWeight, 0),
        strokeAlign: strokeAlign,
        color: color,
      }),
      top: generateWidgetCode("BorderSide", {
        width: skipDefaultProperty(node.strokeTopWeight, 0),
        strokeAlign: strokeAlign,
        color: color,
      }),
      right: generateWidgetCode("BorderSide", {
        width: skipDefaultProperty(node.strokeTopWeight, 0),
        strokeAlign: strokeAlign,
        color: color,
      }),
      bottom: generateWidgetCode("BorderSide", {
        width: skipDefaultProperty(node.strokeTopWeight, 0),
        strokeAlign: strokeAlign,
        color: color,
      }),
    });
  }

  // only add strokeWidth when there is a strokeColor (returns "" otherwise)
  let propStrokeWidth: string = "";
  if (node.strokeWeight !== figma.mixed && node.strokeWeight !== 0) {
    propStrokeWidth = sliceNum(node.strokeWeight); // default is 1.
  }

  return generateWidgetCode("Border.all", {
    width: propStrokeWidth,
    strokeAlign: strokeAlign,
    color: color,
  });
};

// retrieve the borderRadius, when existent (returns "" for EllipseNode)
export const flutterBorderRadius = (node: SceneNode): string => {
  const radius = getCommonRadius(node);
  if ("all" in radius) {
    return skipDefaultProperty(
      `BorderRadius.circular(${sliceNum(radius.all)})`,
      "BorderRadius.circular(0)"
    );
  }

  return skipDefaultProperty(
    generateWidgetCode("BorderRadius.only", {
      topLeft: skipDefaultProperty(
        `Radius.circular(${sliceNum(radius.topLeft)})`,
        "Radius.circular(0)"
      ),
      topRight: skipDefaultProperty(
        `Radius.circular(${sliceNum(radius.topRight)})`,
        "Radius.circular(0)"
      ),
      bottomLeft: skipDefaultProperty(
        `Radius.circular(${sliceNum(radius.bottomLeft)})`,
        "Radius.circular(0)"
      ),
      bottomRight: skipDefaultProperty(
        `Radius.circular(${sliceNum(radius.bottomRight)})`,
        "Radius.circular(0)"
      ),
    }),
    "BorderRadius.only()"
  );
};
