import { retrieveTopFill } from "../../common/retrieveFill";
import { resourceName } from "../androidDefaultBuilder";

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

export const androidBackground = (
  node: SceneNode,
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    // opacity should only be null on set, not on get. But better be prevented.
    const opacity = fill.opacity ?? 1.0;
    return androidColor(fill.color, opacity);
  } else if (fill?.type === "GRADIENT_LINEAR" || fill?.type === "IMAGE" && node.name) {
    return `@drawable/${resourceName(node.name)}`;
  }

  return "";
};

export const androidColor = (color: RGB, opacity: number): string => {
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