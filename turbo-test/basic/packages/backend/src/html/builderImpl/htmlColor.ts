import { gradientAngle } from "../../common/color";
import { sliceNum } from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";

// retrieve the SOLID color on HTML
export const htmlColorFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined

  const fill = retrieveTopFill(fills);
  if (fill && fill.type === "SOLID") {
    // if fill isn't visible, it shouldn't be painted.
    return htmlColor(fill.color, fill.opacity);
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
  const a = sliceNum(alpha ?? 1);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const htmlGradientFromFills = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  const fill = retrieveTopFill(fills);
  if (fill?.type === "GRADIENT_LINEAR") {
    return htmlGradient(fill);
  }
  return "";
};

// This was separated from htmlGradient because it is going to be used in the plugin UI and it wants all gradients, not only the top one.
export const htmlGradient = (fill: GradientPaint): string => {
  // add 90 to be correct in HTML.
  const angle = (gradientAngle(fill) + 90).toFixed(0);

  const mappedFill = fill.gradientStops
    .map((d) => {
      // only add position to fractional
      const position =
        d.position > 0 && d.position < 1
          ? ` ${(100 * d.position).toFixed(0)}%`
          : "";

      return `${htmlColor(d.color, d.color.a)}${position}`;
    })
    .join(", ");

  return `linear-gradient(${angle}deg, ${mappedFill})`;
};
