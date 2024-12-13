import { sliceNum } from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";

// retrieve the SOLID color on HTML
export const htmlColorFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined

  const fill = retrieveTopFill(fills);
  if (fill && fill.type === "SOLID") {
    // if fill isn't visible, it shouldn't be painted.
    return htmlColor(fill.color, fill.opacity);
  }
  if (
    fill &&
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_RADIAL" ||
      fill.type === "GRADIENT_DIAMOND")
  ) {
    if (fill.gradientStops.length > 0) {
      return htmlColor(fill.gradientStops[0].color, fill.opacity);
    }
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

  // Return # when possible.
  if (alpha === 1) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);

    const toHex = (num: number): string => num.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  const r = sliceNum(color.r * 255);
  const g = sliceNum(color.g * 255);
  const b = sliceNum(color.b * 255);
  const a = sliceNum(alpha);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const htmlGradientFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  const fill = retrieveTopFill(fills);
  if (fill?.type === "GRADIENT_LINEAR") {
    return htmlLinearGradient(fill);
  } else if (fill?.type === "GRADIENT_ANGULAR") {
    return htmlAngularGradient(fill);
  } else if (fill?.type === "GRADIENT_RADIAL") {
    return htmlRadialGradient(fill);
  }
  return "";
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
  // Convert Figma angle to CSS angle.
  const cssAngle = angle; // Subtract 235 to make it start from the correct angle.
  // Normalize angle: if negative, add 360 to make it positive.
  return cssAngle < 0 ? cssAngle + 360 : cssAngle;
};

export const htmlLinearGradient = (fill: GradientPaint): string => {
  // Adjust angle for CSS.
  const figmaAngle = gradientAngle2(fill);
  const angle = cssGradientAngle(figmaAngle).toFixed(0);

  const mappedFill = fill.gradientStops
    .map((stop) => {
      const color = htmlColor(stop.color, stop.color.a * (fill.opacity ?? 1));
      const position = `${(stop.position * 100).toFixed(0)}%`;
      return `${color} ${position}`;
    })
    .join(", ");

  return `linear-gradient(${angle}deg, ${mappedFill})`;
};

export const invertYCoordinate = (y: number): number => 1 - y;

export const getGradientTransformCoordinates = (
  gradientTransform: number[][],
): { centerX: string; centerY: string; radiusX: string; radiusY: string } => {
  const a = gradientTransform[0][0];
  const b = gradientTransform[0][1];
  const c = gradientTransform[1][0];
  const d = gradientTransform[1][1];
  const e = gradientTransform[0][2];
  const f = gradientTransform[1][2];

  const scaleX = Math.sqrt(a ** 2 + b ** 2);
  const scaleY = Math.sqrt(c ** 2 + d ** 2);

  const rotationAngle = Math.atan2(b, a);

  const centerX = ((e * scaleX * 100) / (1 - scaleX)).toFixed(2);
  const centerY = (((1 - f) * scaleY * 100) / (1 - scaleY)).toFixed(2);

  const radiusX = (scaleX * 100).toFixed(2);
  const radiusY = (scaleY * 100).toFixed(2);

  return { centerX, centerY, radiusX, radiusY };
};

export const htmlRadialGradient = (fill: GradientPaint): string => {
  const mappedFill = fill.gradientStops
    .map((stop) => {
      const color = htmlColor(stop.color, stop.color.a * (fill.opacity ?? 1));
      const position = `${(stop.position * 100).toFixed(0)}%`;
      return `${color} ${position}`;
    })
    .join(", ");

  const { centerX, centerY, radiusX, radiusY } =
    getGradientTransformCoordinates(fill.gradientTransform);

  return `radial-gradient(${radiusX}% ${radiusY}% at ${centerX}% ${centerY}%, ${mappedFill})`;
};

export const htmlAngularGradient = (fill: GradientPaint): string => {
  const angle = gradientAngle2(fill).toFixed(0);
  const centerX = (fill.gradientTransform[0][2] * 100).toFixed(2);
  const centerY = (fill.gradientTransform[1][2] * 100).toFixed(2);

  const mappedFill = fill.gradientStops
    .map((stop) => {
      const color = htmlColor(stop.color, stop.color.a * (fill.opacity ?? 1));
      const position = `${(stop.position * 360).toFixed(0)}deg`;
      return `${color} ${position}`;
    })
    .join(", ");

  return `conic-gradient(from ${angle}deg at ${centerX}% ${centerY}%, ${mappedFill})`;
};
