import { HTMLSettings } from "types";
import { numberToFixedString } from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";
import { variableToColorName } from "../../tailwind/conversionTables";
import { getGradientTransformCoordinates } from "../../common/color";

/**
 * Helper to process a color with variable binding if present
 */
const processColorWithVariable = (
  color: RGB,
  opacity: number = 1,
  boundVariable?: VariableAlias,
  useCustomColors: boolean = false,
): string => {
  if (useCustomColors && boundVariable) {
    const varName = variableToColorName(boundVariable);
    const fallbackColor = htmlColor(color, opacity);
    return `var(--${varName}, ${fallbackColor})`;
  }
  return htmlColor(color, opacity);
};

/**
 * Extract color, opacity, and bound variable from a fill
 */
const getColorAndVariable = (
  fill: Paint,
): { color: RGB; opacity: number; boundVariable?: VariableAlias } => {
  if (fill.type === "SOLID") {
    return {
      color: fill.color,
      opacity: fill.opacity ?? 1,
      boundVariable: fill.boundVariables?.color,
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
      boundVariable: firstStop.boundVariables?.color,
    };
  }
  return { color: { r: 0, g: 0, b: 0 }, opacity: 0 };
};

// Retrieve the SOLID color or approximate gradient as HTML color
export const htmlColorFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"] | undefined,
  settings: HTMLSettings,
): string => {
  const useCustomColors = settings.customTailwindColors === true;
  const fill = retrieveTopFill(fills);
  if (fill) {
    const { color, opacity, boundVariable } = getColorAndVariable(fill);
    return processColorWithVariable(
      color,
      opacity,
      boundVariable,
      useCustomColors,
    );
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
  useCustomColors: boolean,
  fillOpacity: number = 1,
  positionMultiplier: number = 100,
  unit: string = "%",
): string => {
  const color = processColorWithVariable(
    stop.color,
    stop.color.a * fillOpacity,
    stop.boundVariables?.color,
    useCustomColors,
  );
  const position = `${(stop.position * positionMultiplier).toFixed(0)}${unit}`;
  return `${color} ${position}`;
};

// Process all gradient stops for any gradient type
const processGradientStops = (
  stops: ReadonlyArray<ColorStop>,
  useCustomColors: boolean,
  fillOpacity: number = 1,
  positionMultiplier: number = 100,
  unit: string = "%",
): string => {
  return stops
    .map((stop) =>
      processGradientStop(
        stop,
        useCustomColors,
        fillOpacity,
        positionMultiplier,
        unit,
      ),
    )
    .join(", ");
};

export const htmlGradientFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
  settings: HTMLSettings,
): string => {
  const useCustomColors = settings.customTailwindColors === true;
  const fill = retrieveTopFill(fills);
  if (!fill) return "";
  switch (fill.type) {
    case "GRADIENT_LINEAR":
      return htmlLinearGradient(fill, useCustomColors);
    case "GRADIENT_ANGULAR":
      return htmlAngularGradient(fill, useCustomColors);
    case "GRADIENT_RADIAL":
      return htmlRadialGradient(fill, useCustomColors);
    case "GRADIENT_DIAMOND":
      return htmlDiamondGradient(fill, useCustomColors); // Added diamond gradient case
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

export const htmlLinearGradient = (
  fill: GradientPaint,
  useCustomColors: boolean,
): string => {
  const figmaAngle = gradientAngle2(fill);
  const angle = cssGradientAngle(figmaAngle).toFixed(0);
  const mappedFill = processGradientStops(
    fill.gradientStops,
    useCustomColors,
    fill.opacity ?? 1,
    100,
    "%",
  );
  return `linear-gradient(${angle}deg, ${mappedFill})`;
};

export const invertYCoordinate = (y: number): number => 1 - y;

export const htmlRadialGradient = (
  fill: GradientPaint,
  useCustomColors: boolean,
): string => {
  const mappedFill = processGradientStops(
    fill.gradientStops,
    useCustomColors,
    fill.opacity ?? 1,
    100,
    "%",
  );
  const { centerX, centerY, radiusX, radiusY } =
    getGradientTransformCoordinates(fill.gradientTransform);
  return `radial-gradient(${radiusX}% ${radiusY}% at ${centerX}% ${centerY}%, ${mappedFill})`;
};

export const htmlAngularGradient = (
  fill: GradientPaint,
  useCustomColors: boolean,
): string => {
  const angle = gradientAngle2(fill).toFixed(0);
  const centerX = (fill.gradientTransform[0][2] * 100).toFixed(2);
  const centerY = (fill.gradientTransform[1][2] * 100).toFixed(2);
  const mappedFill = processGradientStops(
    fill.gradientStops,
    useCustomColors,
    fill.opacity ?? 1,
    360,
    "deg",
  );
  return `conic-gradient(from ${angle}deg at ${centerX}% ${centerY}%, ${mappedFill})`;
};

// Added function for diamond gradient
export const htmlDiamondGradient = (
  fill: GradientPaint,
  useCustomColors: boolean,
): string => {
  const stops = processGradientStops(
    fill.gradientStops,
    useCustomColors,
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
