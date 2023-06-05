import {
  flutterBorder,
  generateBorderSideCode,
} from "./builderImpl/flutterBorder";
import { flutterSize } from "./builderImpl/flutterSize";
import { flutterPadding } from "./builderImpl/flutterPadding";
import { flutterShadow } from "./builderImpl/flutterShadow";
import {
  flutterBoxDecorationColor,
  flutterColorFromFills,
} from "./builderImpl/flutterColor";
import {
  generateWidgetCode,
  skipDefaultProperty,
} from "../common/numToAutoFixed";
import { sliceNum } from "../common/numToAutoFixed";
import { getCommonRadius } from "../common/commonRadius";

export const flutterContainer = (
  node: SceneNode,
  child: string,
  optimizeLayout: boolean
): string => {
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
  const clipBehavior =
    "clipsContent" in node && node.clipsContent === true
      ? "Clip.antiAlias"
      : "";

  // todo Image & multiple fills

  // [propPadding] will be "padding: const EdgeInsets.symmetric(...)" or ""
  let propPadding = "";
  if ("paddingLeft" in node) {
    propPadding = flutterPadding(
      (optimizeLayout ? node.inferredAutoLayout : null) ?? node
    );
  }

  let result: string;
  if (fSize.width || fSize.height || propBoxDecoration || clipBehavior) {
    result = generateWidgetCode("Container", {
      width: fSize.width,
      height: fSize.height,
      padding: propPadding,
      clipBehavior: clipBehavior,
      decoration: skipDefaultProperty(propBoxDecoration, "BoxDecoration()"),
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
  const decorationBackground = flutterBoxDecorationColor(node.fills);

  let shapeDecorationBorder = "";
  if (node.type === "STAR") {
    shapeDecorationBorder = generateStarBorder(node);
  } else if (node.type === "POLYGON") {
    shapeDecorationBorder = generatePolygonBorder(node);
  } else if (node.type === "ELLIPSE") {
    shapeDecorationBorder = generateOvalBorder(node);
  } else if ("strokeWeight" in node && node.strokeWeight !== figma.mixed) {
    shapeDecorationBorder = skipDefaultProperty(
      generateRoundedRectangleBorder(node),
      "RoundedRectangleBorder()"
    );
  }

  if (shapeDecorationBorder) {
    return generateWidgetCode("ShapeDecoration", {
      ...decorationBackground,
      shape: shapeDecorationBorder,
      shadows: propBoxShadow,
    });
  }

  return generateWidgetCode("BoxDecoration", {
    ...decorationBackground,
    borderRadius: generateBorderRadius(node),
    border: flutterBorder(node),
    boxShadow: propBoxShadow,
  });
};

const generateRoundedRectangleBorder = (
  node: SceneNode & MinimalStrokesMixin
): string => {
  return generateWidgetCode("RoundedRectangleBorder", {
    side: generateBorderSideCode(node),
    borderRadius: generateBorderRadius(node),
  });
};

const generateBorderSideCode = (
  node: SceneNode & MinimalStrokesMixin
): string => {
  const width =
    node.strokeWeight !== figma.mixed
      ? node.strokeWeight
      : "strokeTopWeight" in node
      ? node.strokeTopWeight
      : 0;

  return generateWidgetCode("BorderSide", {
    width: skipDefaultProperty(width, 0),
    strokeAlign: skipDefaultProperty(
      getStrokeAlign(node),
      "BorderSide.strokeAlignInside"
    ),
    color: skipDefaultProperty(
      flutterColorFromFills(node.strokes),
      "Colors.black"
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
    side: generateBorderSideCode(node),
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
  return generateWidgetCode("OvalBorder", {
    side: generateBorderSideCode(node),
  });
};

const generatePolygonBorder = (node: PolygonNode): string => {
  const points = node.pointCount;

  return generateWidgetCode("StarBorder.polygon", {
    side: generateBorderSideCode(node),
    sides: sliceNum(points),
    borderRadius: generateBorderRadius(node),
  });
};

const generateBorderRadius = (node: SceneNode): string => {
  const radius = getCommonRadius(node);
  if ("all" in radius) {
    if (radius.all === 0) {
      return "";
    }
    return `BorderRadius.circular(${sliceNum(radius.all)})`;
  }

  return generateWidgetCode("BorderRadius.only", {
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
  });
};
