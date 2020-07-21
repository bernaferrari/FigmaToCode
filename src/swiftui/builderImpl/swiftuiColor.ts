import { numToAutoFixed } from "./../../common/numToAutoFixed";
import { retrieveFill } from "../../common/retrieveFill";

/**
 * Retrieve the SOLID color for SwiftUI when existent, otherwise ""
 */
export const swiftuiColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  const fill = retrieveFill(fills);

  if (fill?.type === "SOLID") {
    // todo maybe ignore text color when it is black?

    // opacity should only be null on set, not on get. But better be prevented.
    const opacity = fill.opacity ?? 1.0;
    return rgbaToSwiftUIColor(fill.color, opacity);
  } else if (fill?.type === "GRADIENT_LINEAR") {
    // todo figure out direction. If anyone understand how to retrieve the angles from Transform Matrix, please help me.

    const colors = fill.gradientStops
      .map((d) => {
        return rgbaToSwiftUIColor(d.color, d.color.a);
      })
      .join(", ");

    return `LinearGradient(gradient: Gradient(colors: [${colors}]), startPoint: .top, endPoint: .bottom)`;
  }

  return "";
};

const rgbaToSwiftUIColor = (color: RGB, opacity: number): string => {
  // Using Color.black.opacity() is not reccomended, as per:
  // https://stackoverflow.com/a/56824114/4418073
  // Therefore, only use Color.black/white when opacity is 1.
  if (color.r + color.g + color.b === 0 && opacity === 1) {
    return "Color.black";
  }

  if (color.r + color.g + color.b === 3 && opacity === 1) {
    return "Color.white";
  }

  const r = "red: " + numToAutoFixed(color.r);
  const g = "green: " + numToAutoFixed(color.g);
  const b = "blue: " + numToAutoFixed(color.b);

  const opacityAttr = opacity !== 1.0 ? `, opacity: ${opacity}` : "";

  return `Color(${r}, ${g}, ${b}${opacityAttr})`;
};
