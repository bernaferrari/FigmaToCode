import { StarNode } from "./../../api_types";
import { rgbTo8hex } from "../../common/color";
import { addWarning } from "../../common/commonConversionWarnings";
import {
  generateWidgetCode,
  numberToFixedString,
} from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";
import { getPlaceholderImage } from "../../common/images";
import { GradientPaint, ImagePaint, Paint } from "../../api_types";

/**
 * Retrieve the SOLID color for Flutter when existent, otherwise ""
 * @param node SceneNode containing the property to examine
 * @param propertyPath Property path to extract fills from (e.g., 'fills', 'strokes') or direct fills array
 */
export const flutterColorFromFills = (
  node: SceneNode,
  propertyPath: string,
): string => {
  let fills: ReadonlyArray<Paint> = node[
    propertyPath as keyof SceneNode
  ] as ReadonlyArray<Paint>;
  return flutterColorFromDirectFills(fills);
};

/**
 * Retrieve the SOLID color for Flutter directly from fills when existent, otherwise ""
 * @param fills The fills array to process
 */
export const flutterColorFromDirectFills = (
  fills: ReadonlyArray<Paint>,
): string => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    return flutterColor(
      fill.color,
      fill.opacity ?? 1.0,
      (fill as any).variableColorName,
    );
  } else if (
    fill &&
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_RADIAL")
  ) {
    if (fill.gradientStops.length > 0) {
      const stop = fill.gradientStops[0];
      return flutterColor(
        stop.color,
        fill.opacity ?? 1.0,
        (stop as any).variableColorName,
      );
    }
  }

  return "";
};

/**
 * Get box decoration properties for a Flutter node
 */
export const flutterBoxDecorationColor = (
  node: SceneNode,
  propertyPath: string,
): Record<string, string> => {
  let fills: ReadonlyArray<Paint>;
  fills = node[propertyPath as keyof SceneNode] as ReadonlyArray<Paint>;

  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    const opacity = fill.opacity ?? 1.0;
    return {
      color: flutterColor(fill.color, opacity, (fill as any).variableColorName),
    };
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
    image: `NetworkImage("${getPlaceholderImage(node.width, node.height)}")`,
    fit: fitToBoxFit(fill),
  });
};

const fitToBoxFit = (fill: ImagePaint): string => {
  switch (fill.scaleMode) {
    case "FILL":
      return "BoxFit.cover"; // FILL in Figma covers the entire area, similar to BoxFit.cover
    case "FIT":
      return "BoxFit.contain"; // FIT in Figma fits the image while maintaining aspect ratio, like BoxFit.contain
    case "STRETCH":
      return "BoxFit.fill"; // STRETCH in Figma stretches the image, like BoxFit.fill
    case "TILE":
      return "BoxFit.none"; // TILE doesn't have a direct equivalent, but BoxFit.none is closest
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

/**
 * Generate a Flutter LinearGradient widget
 * @param fill The linear gradient fill
 * @returns LinearGradient widget code
 */
const flutterLinearGradient = (fill: GradientPaint): string => {
  const [start, end] = fill.gradientHandlePositions;
  const colors = fill.gradientStops
    .map((d) => flutterColor(d.color, d.color.a, (d as any).variableColorName))
    .join(", ");
  return generateWidgetCode("LinearGradient", {
    begin: `Alignment(${start.x.toFixed(2)}, ${start.y.toFixed(2)})`,
    end: `Alignment(${end.x.toFixed(2)}, ${end.y.toFixed(2)})`,
    colors: `[${colors}]`,
  });
};

/**
 * Generate a Flutter RadialGradient widget
 * @param fill The radial gradient fill
 * @returns RadialGradient widget code
 */
const flutterRadialGradient = (fill: GradientPaint): string => {
  const [center, h1, h2] = (fill as any).gradientHandlePositions;
  const radius1 = Math.sqrt((h1.x - center.x) ** 2 + (h1.y - center.y) ** 2);
  const radius2 = Math.sqrt((h2.x - center.x) ** 2 + (h2.y - center.y) ** 2);
  const radius = Math.max(radius1, radius2);
  const colors = fill.gradientStops
    .map((d) => flutterColor(d.color, d.color.a, (d as any).variableColorName))
    .join(", ");
  return generateWidgetCode("RadialGradient", {
    center: `Alignment(${center.x.toFixed(2)}, ${center.y.toFixed(2)})`,
    radius: radius.toFixed(2),
    colors: `[${colors}]`,
  });
};

/**
 * Convert Figma's normalized coordinates (0 to 1) to Flutter's Alignment (-1 to 1)
 * @param x Figma's x coordinate (0 to 1)
 * @param y Figma's y coordinate (0 to 1)
 * @returns Flutter's Alignment string
 */
const figmaToFlutterAlignment = (x: number, y: number): string => {
  const alignmentX = x * 2 - 1;
  const alignmentY = y * 2 - 1;
  return `Alignment(${numberToFixedString(alignmentX)}, ${numberToFixedString(alignmentY)})`;
};

/**
 * Generate a Flutter SweepGradient widget (for angular gradients)
 * @param fill The angular gradient fill
 * @returns SweepGradient widget code
 */
export const flutterAngularGradient = (fill: GradientPaint): string => {
  // TODO This function is not 100% perfect but gets close. It is hard to get AngularGradient in Flutter.
  const [center, _, startDirection] = fill.gradientHandlePositions;

  // Center alignment
  const centerAlignment = figmaToFlutterAlignment(center.x, center.y);

  // Starting angle
  const dx = startDirection.x - center.x;
  const dy = startDirection.y - center.y;
  const startAngle = -(90 * Math.PI) / 180 + Math.atan2(dy, dx);

  // Generate colors and stops
  const colors = fill.gradientStops
    .map((stop) => flutterColor(stop.color, stop.color.a))
    .join(", ");

  const stops = fill.gradientStops
    .map((stop) => numberToFixedString(stop.position))
    .join(", ");

  // Generate SweepGradient code
  return generateWidgetCode("SweepGradient", {
    center: centerAlignment,
    startAngle: numberToFixedString(startAngle),
    endAngle: numberToFixedString(startAngle + 2 * Math.PI),
    colors: `[${colors}]`,
    stops: `[${stops}]`,
    transform: `GradientRotation(${numberToFixedString(startAngle)})`,
  });
};

/**
 * Convert opacity (0-1) to alpha (0-255)
 */
const opacityToAlpha = (opacity: number): number => {
  return Math.round(opacity * 255);
};

export const flutterColor = (
  color: RGB,
  opacity: number,
  variableColorName?: string,
): string => {
  const sum = color.r + color.g + color.b;
  let colorCode = "";

  if (sum === 0) {
    colorCode =
      opacity === 1
        ? "Colors.black"
        : `Colors.black.withValues(alpha: ${opacityToAlpha(opacity)})`;
  } else if (sum === 3) {
    colorCode =
      opacity === 1
        ? "Colors.white"
        : `Colors.white.withValues(alpha: ${opacityToAlpha(opacity)})`;
  } else {
    // Always use full 8-digit hex which includes alpha channel
    colorCode = `Color(0x${rgbTo8hex(color, opacity).toUpperCase()})`;
  }

  // Add variable name as a comment if it exists
  if (variableColorName) {
    return `${colorCode} /* ${variableColorName} */`;
  }

  return colorCode;
};
