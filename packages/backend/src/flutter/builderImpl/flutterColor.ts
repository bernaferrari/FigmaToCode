import { rgbTo8hex, gradientAngle } from "../../common/color";
import { addWarning } from "../../common/commonConversionWarnings";
import { generateWidgetCode, sliceNum } from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";
import { nearestValue } from "../../tailwind/conversionTables";

/**
 * Retrieve the SOLID color for Flutter when existent, otherwise ""
 */
export const flutterColorFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    return flutterColor(fill.color, fill.opacity ?? 1.0);
  } else if (
    fill &&
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_RADIAL")
  ) {
    if (fill.gradientStops.length > 0) {
      return flutterColor(fill.gradientStops[0].color, fill.opacity ?? 1.0);
    }
  }

  return "";
};

export const flutterBoxDecorationColor = (
  node: SceneNode,
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): Record<string, string> => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    const opacity = fill.opacity ?? 1.0;
    return { color: flutterColor(fill.color, opacity) };
  } else if (
    fill?.type === "GRADIENT_LINEAR" ||
    fill?.type === "GRADIENT_RADIAL" ||
    fill?.type === "GRADIENT_ANGULAR"
  ) {
    return { gradient: flutterGradient(fill) };
  } else if (fill?.type === "IMAGE") {
    return { image: flutterDecorationImage(node, fill) };
  }

  return {};
};

export const flutterDecorationImage = (node: SceneNode, fill: ImagePaint) => {
  addWarning("Image fills are replaced with placeholders");
  return generateWidgetCode("DecorationImage", {
    image: `NetworkImage("https://via.placeholder.com/${node.width.toFixed(
      0,
    )}x${node.height.toFixed(0)}")`,
    fit: fitToBoxFit(fill),
  });
};

const fitToBoxFit = (fill: ImagePaint): string => {
  switch (fill.scaleMode) {
    case "FILL":
      return "BoxFit.fill";
    case "FIT":
      return "BoxFit.contain";
    case "CROP":
      return "BoxFit.cover";
    case "TILE":
      return "BoxFit.none";
    default:
      return "BoxFit.cover";
  }
};

export const flutterGradient = (fill: GradientPaint): string => {
  switch (fill.type) {
    case "GRADIENT_LINEAR":
      return flutterLinearGradient(fill);
    case "GRADIENT_RADIAL":
      return flutterRadialGradient(fill);
    case "GRADIENT_ANGULAR":
      return flutterAngularGradient(fill);
    default:
      addWarning("Diamond dradients are not supported in Flutter");
      return "";
  }
};

const gradientDirection = (angle: number): string => {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians).toFixed(2);
  const y = Math.sin(radians).toFixed(2);
  return `begin: Alignment(${x}, ${y}), end: Alignment(${-x}, ${-y})`;
};

const flutterRadialGradient = (fill: GradientPaint): string => {
  const colors = fill.gradientStops
    .map((d) => flutterColor(d.color, d.color.a))
    .join(", ");

  const x = sliceNum(fill.gradientTransform[0][2]);
  const y = sliceNum(fill.gradientTransform[1][2]);
  const scaleX = fill.gradientTransform[0][0];
  const scaleY = fill.gradientTransform[1][1];
  const r = sliceNum(Math.sqrt(scaleX * scaleX + scaleY * scaleY));

  return generateWidgetCode("RadialGradient", {
    center: `Alignment(${x}, ${y})`,
    radius: r,
    colors: `[${colors}]`,
  });
};

const flutterAngularGradient = (fill: GradientPaint): string => {
  const colors = fill.gradientStops
    .map((d) => flutterColor(d.color, d.color.a))
    .join(", ");

  const x = sliceNum(fill.gradientTransform[0][2]);
  const y = sliceNum(fill.gradientTransform[1][2]);
  const startAngle = sliceNum(-fill.gradientTransform[0][0]);
  const endAngle = sliceNum(-fill.gradientTransform[0][1]);

  return generateWidgetCode("SweepGradient", {
    center: `Alignment(${x}, ${y})`,
    startAngle: startAngle,
    endAngle: endAngle,
    colors: `[${colors}]`,
  });
};

const flutterLinearGradient = (fill: GradientPaint): string => {
  const radians = (-gradientAngle(fill) * Math.PI) / 180;
  const x = Math.cos(radians).toFixed(2);
  const y = Math.sin(radians).toFixed(2);

  const colors = fill.gradientStops
    .map((d) => flutterColor(d.color, d.color.a))
    .join(", ");

  return generateWidgetCode("LinearGradient", {
    begin: `Alignment(${x}, ${y})`,
    end: `Alignment(${-x}, ${-y})`,
    colors: `[${colors}]`,
  });
};

const gradientDirectionReadable = (angle: number): string => {
  switch (nearestValue(angle, [-180, -135, -90, -45, 0, 45, 90, 135, 180])) {
    case 0:
      return "begin: Alignment.centerLeft, end: Alignment.centerRight";
    case 45:
      return "begin: Alignment.topLeft, end: Alignment.bottomRight";
    case 90:
      return "begin: Alignment.topCenter, end: Alignment.bottomCenter";
    case 135:
      return "begin: Alignment.topRight, end: Alignment.bottomLeft";
    case -45:
      return "begin: Alignment.bottomLeft, end: Alignment.topRight";
    case -90:
      return "begin: Alignment.bottomCenter, end: Alignment.topCenter";
    case -135:
      return "begin: Alignment.bottomRight, end: Alignment.topLeft";
    default:
      // 180 and -180
      return "begin: Alignment.centerRight, end: Alignment.centerLeft";
  }
};

export const flutterColor = (color: RGB, opacity: number): string => {
  const sum = color.r + color.g + color.b;

  if (sum === 0) {
    return opacity === 1
      ? "Colors.black"
      : `Colors.black.withOpacity(${opacity})`;
  }

  if (sum === 3) {
    return opacity === 1
      ? "Colors.white"
      : `Colors.white.withOpacity(${opacity})`;
  }

  return `Color(0x${rgbTo8hex(color, opacity).toUpperCase()})`;
};
