import { gradientAngle } from "./../common/color";
import { retrieveFill } from "../common/retrieveFill";
import { decomposeRelativeTransform } from "../common/color";

/**
 * https://tailwindcss.com/docs/box-shadow/
 * example: shadow
 */
export const htmlGradient = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
  isJSX: boolean
): string => {
  // [when testing] node.effects can be undefined

  const fill = retrieveFill(fills);

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

        return `rgba(${r},${g},${b},${d.color.a})${position}`;
      })
      .join(", ");

    if (isJSX) {
      return `background: "linear-gradient(${angle}deg, ${mappedFill})"`;
    } else {
      return `background: linear-gradient(${angle}deg, ${mappedFill})`;
    }
  }

  return "";
};
