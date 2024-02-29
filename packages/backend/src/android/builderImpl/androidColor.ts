import { retrieveTopFill } from "../../common/retrieveFill";
import { getCommonRadius } from "../../common/commonRadius";
import { sliceNum } from "../../common/numToAutoFixed";

export const AndroidSolidColor = (fill: Paint): string => {
  if (fill && fill.type === "SOLID") {
    return androidColor(fill.color, fill.opacity ?? 1.0);
  }

  return "";
};

export const androidSolidColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    // opacity should only be null on set, not on get. But better be prevented.
    const opacity = fill.opacity ?? 1.0;
    return androidColor(fill.color, opacity);
  } else if (fill?.type === "IMAGE") {
    return androidColor(
      {
        r: 0.5,
        g: 0.23,
        b: 0.27,
      },
      0.5
    );
  }

  return "";
};

export const androidBackground = (node: SceneNode): [string, string] => {
  const background: [string, string] = ["android:background", ""]
  const underScore = background[1] === "" ? "" : "_"

  background[1] += androidCornerRadius(node)
  background[1] += androidFills(node, background[1] === "")
  background[1] += androidStrokes(node, background[1] === "")

  return background
}

const androidStrokes = (node: SceneNode, isFirst: boolean): string => {
  if ("strokes" in node && node.strokes[0]) {
    const color = AndroidSolidColor(node.strokes[0])
    const lineWeight = typeof node.strokeWeight === "number" ? node.strokeWeight : 1

    return `${isFirst ? "" : "_"}border_${color}_weight:${lineWeight}`
  }
  return ""
}

const androidFills = (node: SceneNode, isFirst: boolean): string => {
  if ("fills" in node) {
    const fill = retrieveTopFill(node.fills)
    if (fill) {
      switch(fill.type) {
        case "SOLID":
          const solid = androidColor(fill.color, fill.opacity ?? 1.0)
          return isFirst ? "" : "_" + solid
        case "GRADIENT_ANGULAR":
        case "GRADIENT_DIAMOND":
        case "GRADIENT_LINEAR":
        case "GRADIENT_RADIAL":
          let gradient = ""
          let gradientColors: string[] = []
          gradient += (isFirst ? "" : "_" + fill.type)
          fill.gradientStops.forEach((node) => {
            const color = androidColor(node.color, node.color.a)
            gradientColors.push(color)
            gradient += `_${color}`
          });
          return gradient
      }
    }
  } 
  return ""
}

export const androidCornerRadius = (node: SceneNode): string => {
  const radius = getCommonRadius(node);
  if ("all" in radius) {
    if (radius.all > 0) {
      return `radius_${sliceNum(radius.all)}`
    }
  }
  return ""
};

export const androidColor = (color: RGB | RGBA, opacity: number): string => {
  if (color.r + color.g + color.b === 0 && opacity === 1) {
    return "@color/black";
  }

  if (color.r + color.g + color.b === 3 && opacity === 1) {
    return "@color/white";
  }

  return `#${color2hex(opacity)}${color2hex(color.r)}${color2hex(color.g)}${color2hex(color.b)}`;
};

export const color2hex = (color: number): string => {
  const i = Math.min(255,Math.round(color * 255));
  const t = `0${i.toString(16)}`;
  return t.slice(t.length-2);
};