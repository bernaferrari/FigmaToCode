import { HTMLSettings } from "types";
import { numberToFixedString } from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";

/**
 * Helper to process a color with variable binding if present
 */
const processColorWithVariable = (fill: {
  color: RGB;
  opacity?: number;
  variableColorName?: string;
}): string => {
  const opacity = fill.opacity ?? 1;

  if (fill.variableColorName) {
    const varName = fill.variableColorName;
    const fallbackColor = htmlColor(fill.color, opacity);
    return `var(--${varName}, ${fallbackColor})`;
  }
  return htmlColor(fill.color, opacity);
};

/**
 * Extract color, opacity, and bound variable from a fill
 */
const getColorAndVariable = (
  fill: Paint,
): {
  color: RGB;
  opacity: number;
  variableColorName?: string;
} => {
  if (fill.type === "SOLID") {
    return {
      color: fill.color,
      opacity: fill.opacity ?? 1,
      variableColorName: (fill as any).variableColorName,
    };
  } else if (
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_RADIAL" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_DIAMOND") &&
    fill.gradientStops.length > 0
  ) {
    const firstStop = fill.gradientStops[0];
    return {
      color: firstStop.color,
      opacity: fill.opacity ?? 1,
      variableColorName: (firstStop as any).variableColorName,
    };
  }
  return { color: { r: 0, g: 0, b: 0 }, opacity: 0 };
};

// Retrieve the SOLID color or approximate gradient as HTML color
export const htmlColorFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"] | undefined,
  settings: HTMLSettings,
): string => {
  const fill = retrieveTopFill(fills);
  if (fill) {
    const colorInfo = getColorAndVariable(fill);
    return processColorWithVariable(colorInfo);
  }
  return "";
};

export const htmlColor = (color: RGB, alpha: number = 1): string => {
  if (color.r === 1 && color.g === 1 && color.b === 1 && alpha === 1) {
    return "white";
  }
  if (color.r === 0 && color.g === 0 && color.b === 0 && alpha === 1) {
    return "black";
  }
  if (alpha === 1) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const toHex = (num: number): string => num.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
  const r = numberToFixedString(color.r * 255);
  const g = numberToFixedString(color.g * 255);
  const b = numberToFixedString(color.b * 255);
  const a = numberToFixedString(alpha);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// Process a single gradient stop with proper color and position
const processGradientStop = (
  stop: ColorStop,
  fillOpacity: number = 1,
  positionMultiplier: number = 100,
  unit: string = "%",
): string => {
  const fillInfo = {
    color: stop.color,
    opacity: stop.color.a * fillOpacity,
    boundVariables: stop.boundVariables,
    variableColorName: (stop as any).variableColorName,
  };

  const color = processColorWithVariable(fillInfo);
  const position = `${(stop.position * positionMultiplier).toFixed(0)}${unit}`;
  return `${color} ${position}`;
};

// Process all gradient stops for any gradient type
const processGradientStops = (
  stops: ReadonlyArray<ColorStop>,
  fillOpacity: number = 1,
  positionMultiplier: number = 100,
  unit: string = "%",
): string => {
  return stops
    .map((stop) =>
      processGradientStop(stop, fillOpacity, positionMultiplier, unit),
    )
    .join(", ");
};

export const htmlGradientFromFills = (fill: Paint): string => {
  if (!fill) return "";
  switch (fill.type) {
    case "GRADIENT_LINEAR":
      return htmlLinearGradient(fill);
    case "GRADIENT_ANGULAR":
      return htmlAngularGradient(fill);
    case "GRADIENT_RADIAL":
      return htmlRadialGradient(fill); // Updated to use radial gradient function
    case "GRADIENT_DIAMOND":
      return htmlDiamondGradient(fill);
    default:
      return "";
  }
};

export const gradientAngle2 = (fill: GradientPaint): number => {
  const x1 = fill.gradientTransform[0][2];
  const y1 = fill.gradientTransform[1][2];
  const x2 = fill.gradientTransform[0][0] + x1;
  const y2 = fill.gradientTransform[1][0] + y1;
  const dx = x2 - x1;
  const dy = y1 - y2;
  const radians = Math.atan2(dy, dx);
  const unadjustedAngle = (radians * 180) / Math.PI;
  const adjustedAngle = unadjustedAngle + 90;
  return adjustedAngle;
};

export const cssGradientAngle = (angle: number): number => {
  const cssAngle = angle;
  return cssAngle < 0 ? cssAngle + 360 : cssAngle;
};

export const htmlLinearGradient = (fill: GradientPaint): string => {
  const figmaAngle = gradientAngle2(fill);
  const angle = cssGradientAngle(figmaAngle).toFixed(0);
  const mappedFill = processGradientStops(
    fill.gradientStops,
    fill.opacity ?? 1,
    100,
    "%",
  );
  return `linear-gradient(${angle}deg, ${mappedFill})`;
};

export const invertYCoordinate = (y: number): number => 1 - y;

export const htmlAngularGradient = (fill: GradientPaint): string => {
  const angle = gradientAngle2(fill).toFixed(0);
  // Extract matrix components
  const a = fill.gradientTransform[0][0];
  const b = fill.gradientTransform[0][1];
  const tx = fill.gradientTransform[0][2];
  const c = fill.gradientTransform[1][0];
  const d = fill.gradientTransform[1][1];
  const ty = fill.gradientTransform[1][2];
  // Compute center by transforming (0.5, 0.5)
  const centerX = (a * 0.5 + b * 0.5 + tx) * 100;
  const centerY = (c * 0.5 + d * 0.5 + ty) * 100;
  const centerXPercent = centerX.toFixed(2);
  const centerYPercent = centerY.toFixed(2);
  const mappedFill = processGradientStops(
    fill.gradientStops,
    fill.opacity ?? 1,
    360,
    "deg",
  );
  return `conic-gradient(from ${angle}deg at ${centerXPercent}% ${centerYPercent}%, ${mappedFill})`;
};

export const htmlRadialGradient = (fill: GradientPaint): string => {
  const [[a, b, tx], [c, d, ty]] = fill.gradientTransform;

  // Calculate inverse of the linear part of the gradientTransform matrix
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-6) return ""; // Avoid division by zero

  const invDet = 1 / det;
  const invA = d * invDet;
  const invB = -b * invDet;
  const invC = -c * invDet;
  const invD = a * invDet;

  // Calculate center by solving inverse transform for (0.5, 0.5)
  const cx = (invA * (0.5 - tx) + invB * (0.5 - ty)) * 100;
  const cy = (invC * (0.5 - tx) + invD * (0.5 - ty)) * 100;

  // Calculate column vectors of inverse matrix
  const col1Length = Math.sqrt(invA ** 2 + invC ** 2) * 100;
  const col2Length = Math.sqrt(invB ** 2 + invD ** 2) * 100;

  // Get radii as half lengths of column vectors (sorted)
  const radii = [col1Length / 2, col2Length / 2].sort((a, b) => b - a);

  const mappedStops = processGradientStops(
    fill.gradientStops,
    fill.opacity ?? 1,
  );
  return `radial-gradient(ellipse ${radii[0].toFixed(2)}% ${radii[1].toFixed(2)}% at ${cx.toFixed(2)}% ${cy.toFixed(2)}%, ${mappedStops})`;
};

// Added function for diamond gradient
export const htmlDiamondGradient = (fill: GradientPaint): string => {
  const stops = processGradientStops(
    fill.gradientStops,
    fill.opacity ?? 1,
    50, // Adjusted multiplier for diamond gradient
    "%",
  );
  const gradientConfigs = [
    { direction: "to bottom right", position: "bottom right" },
    { direction: "to bottom left", position: "bottom left" },
    { direction: "to top left", position: "top left" },
    { direction: "to top right", position: "top right" },
  ];
  return gradientConfigs
    .map(
      ({ direction, position }) =>
        `linear-gradient(${direction}, ${stops}) ${position} / 50% 50% no-repeat`,
    )
    .join(", ");
};

export const buildBackgroundValues = (
  paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
  settings: HTMLSettings,
): string => {
  if (paintArray === figma.mixed) {
    return "";
  }

  // If only one fill, just use plain color/gradient
  if (paintArray.length === 1) {
    const paint = paintArray[0];
    if (paint.type === "SOLID") {
      return htmlColorFromFills(paintArray, settings);
    } else if (
      paint.type === "GRADIENT_LINEAR" ||
      paint.type === "GRADIENT_RADIAL" ||
      paint.type === "GRADIENT_ANGULAR" ||
      paint.type === "GRADIENT_DIAMOND"
    ) {
      return htmlGradientFromFills(paint);
    }
    return "";
  }

  // Reverse the array to match CSS layering (first is top-most in CSS)
  const styles = [...paintArray].reverse().map((paint, index) => {
    if (paint.type === "SOLID") {
      // For multiple fills, always convert solid colors to linear gradients
      // to ensure proper layering in CSS backgrounds
      const color = htmlColorFromFills([paint], settings);
      if (index === 0) {
        return `linear-gradient(0deg, ${color} 0%, ${color} 100%)`;
      }

      return color;
    } else if (
      paint.type === "GRADIENT_LINEAR" ||
      paint.type === "GRADIENT_RADIAL" ||
      paint.type === "GRADIENT_ANGULAR" ||
      paint.type === "GRADIENT_DIAMOND"
    ) {
      return htmlGradientFromFills(paint);
    }
    return ""; // Handle other paint types safely
  });

  return styles.filter((value) => value !== "").join(", ");
};
