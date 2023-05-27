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
  skipDefaultProperty,
} from "../common/numToAutoFixed";
import { sliceNum } from "../common/numToAutoFixed";

export const flutterContainer = (node: SceneNode, child: string): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return child;
  }

  // ignore for Groups
  const propBoxDecoration =
    node.type === "GROUP" || !("effects" in node) ? "" : getDecoration(node);
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
      decoration: skipDefaultProperty(propBoxDecoration, "ShapeDecoration()"),
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

const getDecoration = (node: SceneNode): string => {
  if (!("fills" in node)) {
    return "";
  }

  const propBoxShadow = flutterShadow(node);
  const propBorderRadius = flutterBorderRadius(node);
  const decorationBackground = flutterBoxDecorationColor(node.fills);

  let shapeDecorationBorder = "";
  if (node.type === "STAR") {
    shapeDecorationBorder = generateStarBorder(node);
  } else if (node.type === "POLYGON") {
    shapeDecorationBorder = generatePolygonBorder(node);
  } else if (node.type === "ELLIPSE") {
    shapeDecorationBorder = generateOvalBorder(node);
  } else if ("strokeWeight" in node && node.strokeWeight !== figma.mixed) {
    shapeDecorationBorder = generateRoundedRectangleBorder(node);
  }

  if (shapeDecorationBorder) {
    return generateWidgetCode("ShapeDecoration", {
      ...decorationBackground,
      shape: skipDefaultProperty(
        shapeDecorationBorder,
        "RoundedRectangleBorder()"
      ),
      shadows: propBoxShadow,
    });
  }

  // if ("strokes" in node && node.strokeWeight === figma.mixed) {
  return generateWidgetCode("BoxDecoration", {
    ...decorationBackground,
    borderRadius: propBorderRadius,
    border: flutterBorder(node),
    boxShadow: propBoxShadow,
  });
  // }
};

const generateRoundedRectangleBorder = (
  node: SceneNode & MinimalStrokesMixin
): string => {
  const borderRadius =
    "cornerRadius" in node &&
    node.cornerRadius !== figma.mixed &&
    node.cornerRadius !== undefined
      ? node.cornerRadius
      : 0;

  return generateWidgetCode("RoundedRectangleBorder", {
    borderRadius: skipDefaultProperty(
      `BorderRadius.circular(${sliceNum(borderRadius)})`,
      "BorderRadius.circular(0)"
    ),
    strokeAlign: skipDefaultProperty(
      getStrokeAlign(node),
      "BorderSide.strokeAlignInside"
    ),
  });
};

const generateStarBorder = (node: StarNode): string => {
  const points = node.pointCount;
  const innerRadiusRatio = node.innerRadius;
  const cornerRadius = node.cornerRadius;

  const pointRounding = cornerRadius === figma.mixed ? 0 : cornerRadius;
  const valleyRounding = 0; // Assuming no valley rounding, modify if needed
  const rotation = 0; // Assuming no rotation, modify if needed
  const squash = 0; // Assuming no squash, modify if needed

  return generateWidgetCode("StarBorder", {
    points: sliceNum(points),
    innerRadiusRatio: sliceNum(innerRadiusRatio),
    pointRounding: sliceNum(pointRounding),
    valleyRounding: sliceNum(valleyRounding),
    rotation: sliceNum(rotation),
    squash: sliceNum(squash),
  });
};

export const getStrokeAlign = (node: MinimalStrokesMixin): string => {
  switch (node.strokeAlign) {
    case "CENTER":
      return "BorderSide.strokeAlignCenter";
    case "OUTSIDE":
      return "BorderSide.strokeAlignOutside";
    case "INSIDE":
      return "BorderSide.strokeAlignInside";
    default:
      return "";
  }
};

const generateOvalBorder = (node: EllipseNode): string => {
  return generateWidgetCode("OvalBorder", {});
};

const generatePolygonBorder = (node: PolygonNode): string => {
  const points = node.pointCount;
  const cornerRadius = node.cornerRadius;
  const borderRadius = cornerRadius === figma.mixed ? 0 : cornerRadius;

  return generateWidgetCode("StarBorder.polygon", {
    sides: sliceNum(points),
    borderRadius: skipDefaultProperty(
      `BorderRadius.circular(${sliceNum(borderRadius)})`,
      "BorderRadius.circular(0)"
    ),
  });
};
