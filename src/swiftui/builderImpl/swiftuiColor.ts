import { nearestValue } from "./../../tailwind/conversionTables";
import { numToAutoFixed } from "./../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";
import { gradientAngle } from "../../common/color";

/**
 * Retrieve the SOLID color for SwiftUI when existent, otherwise ""
 */
export const swiftuiColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  const fill = retrieveTopFill(fills);

  if (fill?.type === "SOLID") {
    // todo maybe ignore text color when it is black?

    // opacity should only be null on set, not on get. But better be prevented.
    const opacity = fill.opacity ?? 1.0;
    return rgbaToSwiftUIColor(fill.color, opacity);
  } else if (fill?.type === "GRADIENT_LINEAR") {
    const direction = gradientDirection(gradientAngle(fill));

    const colors = fill.gradientStops
      .map((d) => {
        return rgbaToSwiftUIColor(d.color, d.color.a);
      })
      .join(", ");

    return `LinearGradient(gradient: Gradient(colors: [${colors}]), ${direction})`;
  }

  return "";
};

const gradientDirection = (angle: number): string => {
  switch (nearestValue(angle, [-180, -135, -90, -45, 0, 45, 90, 135, 180])) {
    case 0:
      return "startPoint: .leading, endPoint: .trailing";
    case 45:
      return "startPoint: .topLeading, endPoint: .bottomTrailing";
    case 90:
      return "startPoint: .top, endPoint: .bottom";
    case 135:
      return "startPoint: .topTrailing, endPoint: .bottomLeading";
    case -45:
      return "startPoint: .bottomLeading, endPoint: .topTrailing";
    case -90:
      return "startPoint: .bottom, endPoint: .top";
    case -135:
      return "startPoint: .bottomTrailing, endPoint: .topLeading";
    default:
      // 180 and -180
      return "startPoint: .trailing, endPoint: .leading";
  }
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
