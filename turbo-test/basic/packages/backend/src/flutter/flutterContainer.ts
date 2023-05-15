import {
  AltRectangleNode,
  AltEllipseNode,
  AltFrameNode,
  AltGroupNode,
} from "../altNodes/altMixins";
import {
  flutterBorderRadius,
  flutterBorder,
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
  propertyIfNotDefault,
} from "../common/numToAutoFixed";
import { sliceNum } from "../common/numToAutoFixed";

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
  const propBoxDecoration = node.type === "GROUP" ? "" : getDecoration(node);
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
      decoration: propertyIfNotDefault(propBoxDecoration, "BoxDecoration()"),
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

const getDecoration = (
  node: AltRectangleNode | AltEllipseNode | AltFrameNode
): string => {
  const propBackgroundColor = flutterBoxDecorationColor(node.fills);

  
  // TODO Bernardo: add support for shapeDecoration
  // if (
  //   node.type === "ELLIPSE" ||
  //   node.type === "STAR" ||
  //   node.type === "POLYGON"
  // ) {
  //   return `\ndecoration: ShapeDecoration(${indentString(
  //     propBorderRadius + propBorder + propBoxShadow,
  //     2
  //   )}\n),`;
  // }

  let shapeDecorationBorder = "";
  if (node.type === "STAR") {
    shapeDecorationBorder = generateStarBorder(node);
  } else if (node.type === "POLYGON") {
    shapeDecorationBorder = generatePolygonBorder(node);
  } else if (node.type === "ELLIPSE") {
    shapeDecorationBorder = generateOvalBorder(node);
  }

  const propBorder = flutterBorder(node);
  const propBoxShadow = flutterShadow(node, "boxShadow");
  const propBorderRadius = flutterBorderRadius(node);
  const color = flutterBoxDecorationColor(node.fills);
  console.log("color", color);

  if (shapeDecorationBorder !== "") {
    const properties = {
      borderRadius: propBorderRadius,
      boxShadow: propBoxShadow,
      border: propBorder,
      shape: shapeDecorationBorder,
      // ...color,
    };

    return generateWidgetCode("ShapeDecoration", properties);
  }

  // generate the decoration, or just the backgroundColor when color is SOLID.

  const properties = {
    borderRadius: propBorderRadius,
    boxShadow: propBoxShadow,
    border: propBorder,
    // ...color,
  };

  const mergedProperties = Object.assign({}, properties, color);
  return generateWidgetCode("BoxDecoration", mergedProperties);
};

const generateRoundedRectangleBorder = (node: RectangleNode): string => {
  const cornerRadius = node.cornerRadius;
  const borderRadius = cornerRadius === figma.mixed ? 0 : cornerRadius;

  return generateWidgetCode("RoundedRectangleBorder", {
    borderRadius: `BorderRadius.circular(${sliceNum(borderRadius)})`,
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

const generateOvalBorder = (node: EllipseNode): string => {
  return generateWidgetCode("OvalBorder", {});
};

const generatePolygonBorder = (node: PolygonNode): string => {
  const points = node.pointCount;
  const cornerRadius = node.cornerRadius;
  const borderRadius = cornerRadius === figma.mixed ? 0 : cornerRadius;

  return generateWidgetCode("StarBorder.polygon", {
    sides: sliceNum(points),
    borderRadius: `BorderRadius.circular(${sliceNum(borderRadius)})`,
  });
};
