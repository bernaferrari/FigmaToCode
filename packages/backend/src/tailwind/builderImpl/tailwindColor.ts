import { gradientAngle } from "../../common/color";
import {
  getColorInfo,
  nearestOpacity,
  nearestValue,
} from "../conversionTables";
import { TailwindColorType } from "types";
import { retrieveTopFill } from "../../common/retrieveFill";

// Import the HTML gradient functions
import {
  htmlAngularGradient,
  htmlRadialGradient,
} from "../../html/builderImpl/htmlColor";
import { GradientPaint, Paint } from "../../api_types";
import { localTailwindSettings } from "../tailwindMain";

/**
 * Get a tailwind color value object
 * @param fill
 * @param useVarSyntax Whether to use CSS variable syntax for variables
 */
export function tailwindColor(fill: SolidPaint, useVarSyntax: boolean = false) {
  const { hex, colorType, colorName, meta } = getColorInfo(fill);
  const exportValue = tailwindSolidColor(fill, "bg", useVarSyntax);
  return {
    exportValue,
    colorName,
    colorType,
    hex,
    meta,
  };
}

/**
 * Calculate effective opacity from a fill or color stop
 * @param fill The color fill or stop to process
 * @param parentOpacity Optional parent opacity to factor in
 * @returns The calculated effective opacity value
 */
function calculateEffectiveOpacity(
  fill: SolidPaint | ColorStop,
  parentOpacity?: number,
): number {
  let effectiveOpacity =
    typeof parentOpacity === "number" ? parentOpacity : 1.0;

  // Apply fill-specific opacity
  if ("opacity" in fill && typeof fill.opacity === "number") {
    effectiveOpacity *= fill.opacity;
  }

  // For ColorStop, also consider the alpha channel in the color
  if ("color" in fill && "a" in fill.color) {
    effectiveOpacity *= fill.color.a;
  }

  return effectiveOpacity;
}

/**
 * Get the tailwind token name for a given color
 *
 * @param fill The color fill to process
 * @param kind Parameter specifying how the color will be used (e.g., 'text', 'bg')
 * @param useVarSyntax Whether to use CSS variable syntax for variables
 * @returns Tailwind color string with prefix (e.g., text-red-500)
 */
export const tailwindSolidColor = (
  fill: SolidPaint | ColorStop,
  kind: TailwindColorType,
  useVarSyntax: boolean = false,
): string => {
  // Check if we should use var syntax and the fill has a variable color name
  if (useVarSyntax && (fill as any).variableColorName) {
    const varName = (fill as any).variableColorName;
    // Create the fallback color using existing color info
    const { hex } = getColorInfo(fill);
    // Return arbitrary value syntax with CSS variable
    return `${kind}-[var(--${varName},${hex})]`;
  }

  // Original implementation for non-variable colors or when not using var syntax
  const { colorName } = getColorInfo(fill);
  const effectiveOpacity = calculateEffectiveOpacity(fill);
  const opacity =
    effectiveOpacity !== 1.0 ? `/${nearestOpacity(effectiveOpacity)}` : "";

  return `${kind}-${colorName}${opacity}`;
};

/**
 * Get the color name for a gradient stop, including opacity if needed
 *
 * @param stop The gradient color stop
 * @param parentOpacity The opacity of the parent gradient
 * @param useVarSyntax Whether to use CSS variable syntax for variables
 * @returns Color name with optional opacity suffix
 */
export const tailwindGradientStop = (
  stop: ColorStop,
  parentOpacity: number = 1.0,
): string => {
  const { colorName } = getColorInfo(stop);
  const effectiveOpacity = calculateEffectiveOpacity(stop, parentOpacity);
  const opacity =
    effectiveOpacity !== 1.0 ? `/${nearestOpacity(effectiveOpacity)}` : "";

  return `${colorName}${opacity}`;
};

// retrieve the SOLID color for tailwind
export const tailwindColorFromFills = (
  fills: ReadonlyArray<Paint>,
  kind: TailwindColorType,
): string => {
  // [when testing] fills can be undefined

  const fill = retrieveTopFill(fills);
  if (fill && fill.type === "SOLID") {
    return tailwindSolidColor(fill, kind);
  } else if (
    fill &&
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_RADIAL" ||
      fill.type === "GRADIENT_DIAMOND")
  ) {
    if (fill.gradientStops.length > 0) {
      return tailwindSolidColor(fill.gradientStops[0], kind);
    }
  }
  return "";
};

export const tailwindGradientFromFills = (
  fills: ReadonlyArray<Paint>,
): string => {
  const fill = retrieveTopFill(fills);

  // Return early if no fill exists
  if (!fill) {
    return "";
  }

  if (fill.type === "GRADIENT_LINEAR") {
    return tailwindGradient(fill);
  }

  // Tailwind 4 has built-in support for radial and conic gradients
  if (localTailwindSettings.useTailwind4) {
    if (fill.type === "GRADIENT_RADIAL") {
      return tailwindRadialGradient(fill);
    }
    if (fill.type === "GRADIENT_ANGULAR") {
      return tailwindConicGradient(fill);
    }
    // Diamond is still too complex for direct Tailwind support
    if (fill.type === "GRADIENT_DIAMOND") {
      return "";
    }
  } else {
    // Use arbitrary values with HTML-based gradient syntax for other gradient types
    if (fill.type === "GRADIENT_ANGULAR") {
      return tailwindArbitraryGradient(htmlAngularGradient(fill));
    }

    if (fill.type === "GRADIENT_RADIAL") {
      return tailwindArbitraryGradient(htmlRadialGradient(fill));
    }

    if (fill.type === "GRADIENT_DIAMOND") {
      // Diamond is too complex, it is going to create 3 linear gradients, which gets too weird in Tailwind.
      return "";
    }
  }

  return "";
};

/**
 * Converts CSS gradient syntax to Tailwind arbitrary value syntax
 * @param cssGradient The CSS gradient string (e.g., "radial-gradient(...)")
 * @returns Tailwind class with arbitrary value (e.g., "bg-[radial-gradient(...)]")
 */
const tailwindArbitraryGradient = (cssGradient: string): string => {
  // Replace spaces with underscores for Tailwind compatibility
  const tailwindValue = cssGradient.replace(/\s+/g, "_");
  return `bg-[${tailwindValue}]`;
};

/**
 * Maps an angle to a gradient direction class
 * @param angle The angle in degrees
 * @returns The appropriate gradient direction class
 */
const directionMap: Record<number, string> = {
  0: "bg-gradient-to-r",
  45: "bg-gradient-to-br",
  90: "bg-gradient-to-b",
  135: "bg-gradient-to-bl",
  "-45": "bg-gradient-to-tr",
  "-90": "bg-gradient-to-t",
  "-135": "bg-gradient-to-tl",
  180: "bg-gradient-to-l",
};

function getGradientDirectionClass(
  angle: number,
  useTailwind4: boolean,
): string {
  const angleValues = [0, 45, 90, 135, 180, -45, -90, -135, -180];

  // For non-standard angles in Tailwind 4, use exact angle
  if (useTailwind4) {
    const roundedAngle = Math.round(angle);
    if (angleValues.includes(roundedAngle)) {
      return directionMap[roundedAngle];
    }

    const exactAngle = Math.round(((angle % 360) + 360) % 360);
    return `bg-linear-${exactAngle}`;
  }

  let snappedAngle = nearestValue(angle, angleValues);
  if (snappedAngle === -180) snappedAngle = 180;

  // Check if angle is in the map
  const entry = directionMap[snappedAngle];
  if (entry) {
    return entry;
  }

  return "bg-gradient-to-r";
}

/**
 * Check if a stop position needs a position override
 * @param actual The actual position (0-1)
 * @param expected The expected default position (0-1)
 * @returns True if position needs to be specified
 */
const needsPositionOverride = (actual: number, expected: number): boolean => {
  // Only include position if it deviates by more than 5% from expected
  return Math.abs(actual - expected) > 0.05;
};

/**
 * Gets position modifier string for a gradient stop if needed
 * @param stopPosition The stop position (0-1)
 * @param expectedPosition The expected default position (0-1)
 * @param unit The unit to use (%, deg)
 * @param multiplier Multiplier for the position value
 * @returns Position string or empty string
 */
const getStopPositionModifier = (
  stopPosition: number,
  expectedPosition: number,
  unit: string = "%",
  multiplier: number = 100,
): string => {
  if (needsPositionOverride(stopPosition, expectedPosition)) {
    const position = Math.round(stopPosition * multiplier);
    return ` ${position}${unit}`;
  }
  return "";
};

/**
 * Generates a complete gradient stop with position if needed
 * @param prefix The stop prefix (from-, via-, to-)
 * @param stop The gradient stop
 * @param globalOpacity The global opacity
 * @param expectedPosition The expected default position (0-1)
 * @param unit The unit to use (%, deg)
 * @param multiplier Multiplier for the position value
 * @returns Complete gradient stop string
 */
function generateGradientStop(
  prefix: string,
  stop: ColorStop,
  globalOpacity: number = 1.0,
  expectedPosition: number,
  unit: string = "%",
  multiplier: number = 100,
): string {
  const colorValue = tailwindGradientStop(stop, globalOpacity);
  const colorPart = `${prefix}-${colorValue}`;

  if (!localTailwindSettings.useTailwind4) {
    return colorPart;
  }

  // Only add position if it significantly differs from the default
  const positionModifier = getStopPositionModifier(
    stop.position,
    expectedPosition,
    unit,
    multiplier,
  );
  return positionModifier
    ? `${colorPart} ${prefix}${positionModifier}`
    : colorPart;
}

export const tailwindGradient = (fill: GradientPaint): string => {
  const globalOpacity = fill.opacity ?? 1.0;
  const direction = getGradientDirectionClass(
    gradientAngle(fill),
    localTailwindSettings.useTailwind4,
  );

  if (fill.gradientStops.length === 1) {
    const fromStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
    );
    return [direction, fromStop].filter(Boolean).join(" ");
  } else if (fill.gradientStops.length === 2) {
    const firstStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
    );
    const lastStop = generateGradientStop(
      "to",
      fill.gradientStops[1],
      globalOpacity,
      1,
    );
    return [direction, firstStop, lastStop].filter(Boolean).join(" ");
  } else {
    const firstStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
    );
    const viaStop = generateGradientStop(
      "via",
      fill.gradientStops[1],
      globalOpacity,
      0.5,
    );
    const lastStop = generateGradientStop(
      "to",
      fill.gradientStops[fill.gradientStops.length - 1],
      globalOpacity,
      1,
    );
    return [direction, firstStop, viaStop, lastStop].filter(Boolean).join(" ");
  }
};

/**
 * Generate Tailwind 4 radial gradient
 */
const tailwindRadialGradient = (fill: GradientPaint): string => {
  const globalOpacity = fill.opacity ?? 1.0;
  const [center] = fill.gradientHandlePositions;
  const cx = Math.round(center.x * 100);
  const cy = Math.round(center.y * 100);
  const isCustomPosition = Math.abs(cx - 50) > 5 || Math.abs(cy - 50) > 5;
  const baseClass = isCustomPosition
    ? `bg-radial-[at_${cx}%_${cy}%]`
    : "bg-radial";

  if (fill.gradientStops.length === 1) {
    const fromStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
    );
    return [baseClass, fromStop].filter(Boolean).join(" ");
  } else if (fill.gradientStops.length === 2) {
    const firstStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
    );
    const lastStop = generateGradientStop(
      "to",
      fill.gradientStops[1],
      globalOpacity,
      1,
    );
    return [baseClass, firstStop, lastStop].filter(Boolean).join(" ");
  } else {
    const firstStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
    );
    const viaStop = generateGradientStop(
      "via",
      fill.gradientStops[1],
      globalOpacity,
      0.5,
    );
    const lastStop = generateGradientStop(
      "to",
      fill.gradientStops[fill.gradientStops.length - 1],
      globalOpacity,
      1,
    );
    return [baseClass, firstStop, viaStop, lastStop].filter(Boolean).join(" ");
  }
};

/**
 * Generate Tailwind 4 conic gradient
 */
const tailwindConicGradient = (fill: GradientPaint): string => {
  const [center, , startDirection] = fill.gradientHandlePositions;
  const globalOpacity = fill.opacity ?? 1.0;
  const dx = startDirection.x - center.x;
  const dy = startDirection.y - center.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  angle = (angle + 360) % 360;
  const normalizedAngle = Math.round(angle);
  const cx = Math.round(center.x * 100);
  const cy = Math.round(center.y * 100);
  const isCustomPosition = Math.abs(cx - 50) > 5 || Math.abs(cy - 50) > 5;
  let baseClass = `bg-conic-${normalizedAngle}`;

  if (isCustomPosition) {
    baseClass = `bg-conic-[from_${normalizedAngle}deg_at_${cx}%_${cy}%]`;
  }

  if (fill.gradientStops.length === 1) {
    const fromStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
      "deg",
      360,
    );
    return [baseClass, fromStop].filter(Boolean).join(" ");
  } else if (fill.gradientStops.length === 2) {
    const firstStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
      "deg",
      360,
    );
    const lastStop = generateGradientStop(
      "to",
      fill.gradientStops[1],
      globalOpacity,
      1,
      "deg",
      360,
    );
    return [baseClass, firstStop, lastStop].filter(Boolean).join(" ");
  } else {
    const firstStop = generateGradientStop(
      "from",
      fill.gradientStops[0],
      globalOpacity,
      0,
      "deg",
      360,
    );
    const viaStop = generateGradientStop(
      "via",
      fill.gradientStops[1],
      globalOpacity,
      0.5,
      "deg",
      360,
    );
    const lastStop = generateGradientStop(
      "to",
      fill.gradientStops[fill.gradientStops.length - 1],
      globalOpacity,
      1,
      "deg",
      360,
    );
    return [baseClass, firstStop, viaStop, lastStop].filter(Boolean).join(" ");
  }
};
