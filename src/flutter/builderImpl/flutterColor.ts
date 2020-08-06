import { rgbTo8hex, gradientAngle } from "../../common/color";
import { retrieveFill } from "../../common/retrieveFill";
import { nearestValue } from "../../tailwind/conversionTables";

/**
 * Retrieve the SOLID color for Flutter when existent, otherwise ""
 */
export const flutterColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  const fill = retrieveFill(fills);

  if (fill?.type === "SOLID") {
    // todo maybe ignore text color when it is black?
    const opacity = fill.opacity ?? 1.0;
    return `color: ${rgbaToFlutterColor(fill.color, opacity)}, `;
  }

  return "";
};

export const flutterBoxDecorationColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  const fill = retrieveFill(fills);

  if (fill?.type === "SOLID") {
    const opacity = fill.opacity ?? 1.0;
    return `color: ${rgbaToFlutterColor(fill.color, opacity)}, `;
  } else if (fill?.type === "GRADIENT_LINEAR") {
    const direction = gradientDirection(gradientAngle(fill));

    const colors = fill.gradientStops
      .map((d) => {
        return rgbaToFlutterColor(d.color, d.color.a);
      })
      .join("");

    return `gradient: LinearGradient(${direction}, colors: [${colors}], ), `;
  }

  return "";
};

const gradientDirection = (angle: number): string => {
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

const rgbaToFlutterColor = (color: RGB, opacity: number): string => {
  // todo use Colors.black.opacity()
  if (color.r + color.g + color.b === 0 && opacity === 1) {
    return "Colors.black";
  }

  if (color.r + color.g + color.b === 3 && opacity === 1) {
    return "Colors.white";
  }

  return `Color(0x${rgbTo8hex(color, opacity)})`;
};
