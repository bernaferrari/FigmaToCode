import { rgbTo8hex, gradientAngle } from "../../common/color";
import { addWarning } from "../../common/commonConversionWarnings";
import {
  generateWidgetCode,
  numberToFixedString,
} from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";
import { nearestValue } from "../../tailwind/conversionTables";
import { getPlaceholderImage } from "../../common/images";

/**
 * Retrieve the SOLID color for Flutter when existent, otherwise ""
 * @param node SceneNode containing the property to examine
 * @param propertyPath Property path to extract fills from (e.g., 'fills', 'strokes') or direct fills array
 */
export const flutterColorFromFills = (
  node: SceneNode,
  propertyPath: string,
): string => {
  let fills: ReadonlyArray<Paint> | PluginAPI["mixed"];
  fills = node[propertyPath as keyof SceneNode] as
    | ReadonlyArray<Paint>
    | PluginAPI["mixed"];

  return flutterColorFromDirectFills(fills);
};

/**
 * Retrieve the SOLID color for Flutter directly from fills when existent, otherwise ""
 * @param fills The fills array to process
 */
export const flutterColorFromDirectFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    return flutterColor(
      fill.color, 
      fill.opacity ?? 1.0, 
      (fill as any).variableColorName
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
        (stop as any).variableColorName
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
  let fills: ReadonlyArray<Paint> | PluginAPI["mixed"];
  fills = node[propertyPath as keyof SceneNode] as
    | ReadonlyArray<Paint>
    | PluginAPI["mixed"];

  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    const opacity = fill.opacity ?? 1.0;
    return { color: flutterColor(fill.color, opacity, (fill as any).variableColorName) };
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
    .map((d) => flutterColor(d.color, d.color.a, (d as any).variableColorName))
    .join(", ");

  const x = numberToFixedString(fill.gradientTransform[0][2]);
  const y = numberToFixedString(fill.gradientTransform[1][2]);
  const scaleX = fill.gradientTransform[0][0];
  const scaleY = fill.gradientTransform[1][1];
  const r = numberToFixedString(Math.sqrt(scaleX * scaleX + scaleY * scaleY));

  return generateWidgetCode("RadialGradient", {
    center: `Alignment(${x}, ${y})`,
    radius: r,
    colors: `[${colors}]`,
  });
};

const flutterAngularGradient = (fill: GradientPaint): string => {
  const colors = fill.gradientStops
    .map((d) => flutterColor(d.color, d.color.a, (d as any).variableColorName))
    .join(", ");

  const x = numberToFixedString(fill.gradientTransform[0][2]);
  const y = numberToFixedString(fill.gradientTransform[1][2]);
  const startAngle = numberToFixedString(-fill.gradientTransform[0][0]);
  const endAngle = numberToFixedString(-fill.gradientTransform[0][1]);

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
    .map((d) => flutterColor(d.color, d.color.a, (d as any).variableColorName))
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

/**
 * Convert opacity (0-1) to alpha (0-255)
 */
const opacityToAlpha = (opacity: number): number => {
  return Math.round(opacity * 255);
};

export const flutterColor = (
  color: RGB, 
  opacity: number, 
  variableColorName?: string
): string => {
  const sum = color.r + color.g + color.b;
  let colorCode = "";

  if (sum === 0) {
    colorCode = opacity === 1
      ? "Colors.black"
      : `Colors.black.withValues(alpha: ${opacityToAlpha(opacity)})`;
  } else if (sum === 3) {
    colorCode = opacity === 1
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
