import { retrieveTopFill } from "../../common/retrieveFill";
import { gradientAngle } from "../../common/color";
import { nearestValue } from "../../tailwind/conversionTables";
import { sliceNum } from "../../common/numToAutoFixed";
import { addWarning } from "../../common/commonConversionWarnings";

export const swiftUISolidColor = (fill: Paint): string => {
  if (fill && fill.type === "SOLID") {
    return swiftuiColor(fill.color, fill.opacity ?? 1.0);
  } else if (
    fill &&
    (fill.type === "GRADIENT_LINEAR" ||
      fill.type === "GRADIENT_ANGULAR" ||
      fill.type === "GRADIENT_RADIAL")
  ) {
    if (fill.gradientStops.length > 0) {
      return swiftuiColor(fill.gradientStops[0].color, fill.opacity ?? 1.0);
    }
  }

  return "";
};

export const swiftuiSolidColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    // opacity should only be null on set, not on get. But better be prevented.
    const opacity = fill.opacity ?? 1.0;
    return swiftuiColor(fill.color, opacity);
  } else if (fill?.type === "GRADIENT_LINEAR") {
    return swiftuiRGBAColor(fill.gradientStops[0].color);
  } else if (fill?.type === "IMAGE") {
    return swiftuiColor(
      {
        r: 0.5,
        g: 0.23,
        b: 0.27,
      },
      0.5,
    );
  }

  return "";
};

export const swiftuiBackground = (
  node: SceneNode,
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): string => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    // opacity should only be null on set, not on get. But better be prevented.
    const opacity = fill.opacity ?? 1.0;
    return swiftuiColor(fill.color, opacity);
  } else if (fill?.type === "GRADIENT_LINEAR") {
    return swiftuiGradient(fill);
  } else if (fill?.type === "IMAGE") {
    addWarning("Image fills are replaced with placeholders");
    return `AsyncImage(url: URL(string: "https://via.placeholder.com/${node.width.toFixed(
      0,
    )}x${node.height.toFixed(0)}"))`;
  }

  return "";
};

export const swiftuiGradient = (fill: GradientPaint): string => {
  const direction = gradientDirection(gradientAngle(fill));

  const colors = fill.gradientStops
    .map((d) => {
      return swiftuiColor(d.color, d.color.a);
    })
    .join(", ");

  return `LinearGradient(gradient: Gradient(colors: [${colors}]), ${direction})`;
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

export const swiftuiRGBAColor = (color: RGBA) => swiftuiColor(color, color.a);

export const swiftuiColor = (color: RGB, opacity: number): string => {
  // Using Color.black.opacity() is not reccomended, as per:
  // https://stackoverflow.com/a/56824114/4418073
  // Therefore, only use Color.black/white when opacity is 1.
  if (color.r + color.g + color.b === 0 && opacity === 1) {
    return ".black";
  }

  if (color.r + color.g + color.b === 3 && opacity === 1) {
    return ".white";
  }

  const r = `red: ${sliceNum(color.r)}`;
  const g = `green: ${sliceNum(color.g)}`;
  const b = `blue: ${sliceNum(color.b)}`;

  const opacityAttr = opacity !== 1.0 ? `.opacity(${sliceNum(opacity)})` : "";

  return `Color(${r}, ${g}, ${b})${opacityAttr}`;
};
