import { gradientAngle } from "../../common/color";
import { numToAutoFixed } from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";

// retrieve the SOLID color for tailwind
export const htmlColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined

  const fill = retrieveTopFill(fills);
  if (fill?.type === "SOLID") {
    // if fill isn't visible, it shouldn't be painted.
    numToAutoFixed(fill.color.r);
    const r = numToAutoFixed(fill.color.r * 255);
    const g = numToAutoFixed(fill.color.g * 255);
    const b = numToAutoFixed(fill.color.b * 255);
    const a = numToAutoFixed(fill.opacity ?? 1);

    if (
      fill.color.r === 1 &&
      fill.color.g === 1 &&
      fill.color.b === 1 &&
      fill.opacity === 1
    ) {
      return "white";
    }

    if (
      fill.color.r === 0 &&
      fill.color.g === 0 &&
      fill.color.b === 0 &&
      fill.opacity === 1
    ) {
      return "black";
    }

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return "";
};

export const htmlGradient = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  // [when testing] node.effects can be undefined

  const fill = retrieveTopFill(fills);

  if (fill?.type === "GRADIENT_LINEAR") {
    // add 90 to be correct in HTML.
    const angle = (gradientAngle(fill) + 90).toFixed(0);

    const mappedFill = fill.gradientStops
      .map((d) => {
        const r = (d.color.r * 255).toFixed(0);
        const g = (d.color.g * 255).toFixed(0);
        const b = (d.color.b * 255).toFixed(0);

        // only add position to fractional
        const position =
          d.position > 0 && d.position < 1
            ? " " + (100 * d.position).toFixed(0) + "%"
            : "";

        return `rgba(${r},${g},${b},${numToAutoFixed(d.color.a)})${position}`;
      })
      .join(", ");

    return `linear-gradient(${angle}deg, ${mappedFill})`;
  }

  return "";
};
