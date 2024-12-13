import { flutterBorder } from "./builderImpl/flutterBorder";
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
import { commonStroke } from "../common/commonStroke";

export const flutterContainer = (
  node: SceneNode,
  child: string,
  optimizeLayout: boolean,
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height < 0) {
    return child;
  }

  // ignore for Groups
  const propBoxDecoration = getDecoration(node);
  const { width, height, isExpanded } = flutterSize(node, optimizeLayout);

  const clipBehavior =
    "clipsContent" in node && node.clipsContent === true
      ? "Clip.antiAlias"
      : "";

  // todo Image & multiple fills

  // [propPadding] will be "padding: const EdgeInsets.symmetric(...)" or ""
  let propPadding = "";
  if ("paddingLeft" in node) {
    propPadding = flutterPadding(
      (optimizeLayout ? node.inferredAutoLayout : null) ?? node,
    );
  }

  let result: string;
  if (width || height || propBoxDecoration || clipBehavior) {
    const parsedDecoration = skipDefaultProperty(
      propBoxDecoration,
      "BoxDecoration()",
    );
    result = generateWidgetCode("Container", {
      width: skipDefaultProperty(width, "0"),
      height: skipDefaultProperty(height, "0"),
      padding: propPadding,
      clipBehavior: clipBehavior,
      decoration: clipBehavior ? propBoxDecoration : parsedDecoration,
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
  const decorationBackground = flutterBoxDecorationColor(node, node.fills);

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
      "RoundedRectangleBorder()",
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
  node: SceneNode & MinimalStrokesMixin,
): string => {
  return generateWidgetCode("RoundedRectangleBorder", {
    side: generateBorderSideCode(node),
    borderRadius: generateBorderRadius(node),
  });
};

const generateBorderSideCode = (
  node: SceneNode & MinimalStrokesMixin,
): string => {
  const strokeWidth = getSingleStrokeWidth(node);

  return skipDefaultProperty(
    generateWidgetCode("BorderSide", {
      width: skipDefaultProperty(strokeWidth, 0),
      strokeAlign: skipDefaultProperty(
        getStrokeAlign(node, strokeWidth),
        "BorderSide.strokeAlignInside",
      ),
      color: skipDefaultProperty(
        flutterColorFromFills(node.strokes),
        "Colors.black",
      ),
    }),
    "BorderSide()",
  );
};

const getSingleStrokeWidth = (node: SceneNode) => {
  if (
    "strokes" in node &&
    (node.strokes.length === 0 ||
      node.strokes.every((d) => d.visible === false))
  ) {
    return 0;
  }

  const stroke = commonStroke(node);
  if (stroke === null) {
    return 0;
  }

  if ("all" in stroke) {
    return stroke.all;
  }

  return Math.max(stroke?.bottom, stroke?.top, stroke?.left, stroke?.right);
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

export const getStrokeAlign = (
  node: MinimalStrokesMixin,
  strokeWeight: number,
): string => {
  if (strokeWeight === 0) {
    return "";
  }
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
      "Radius.circular(0)",
    ),
    topRight: skipDefaultProperty(
      `Radius.circular(${sliceNum(radius.topRight)})`,
      "Radius.circular(0)",
    ),
    bottomLeft: skipDefaultProperty(
      `Radius.circular(${sliceNum(radius.bottomLeft)})`,
      "Radius.circular(0)",
    ),
    bottomRight: skipDefaultProperty(
      `Radius.circular(${sliceNum(radius.bottomRight)})`,
      "Radius.circular(0)",
    ),
  });
};
