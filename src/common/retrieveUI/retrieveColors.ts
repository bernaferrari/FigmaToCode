import {
  swiftuiColor,
  swiftuiGradient,
} from "./../../swiftui/builderImpl/swiftuiColor";
import {
  tailwindColors,
  tailwindGradient,
  tailwindNearestColor,
  tailwindSolidColor,
} from "./../../tailwind/builderImpl/tailwindColor";
import {
  flutterColor,
  flutterGradient,
} from "./../../flutter/builderImpl/flutterColor";
import { htmlColor, htmlGradient } from "./../../html/builderImpl/htmlColor";
import { AltSceneNode } from "../../altNodes/altMixins";
import { rgbTo6hex } from "../../common/color";
import { notEmpty } from "../../altNodes/altConversion";

type exportFramework = "flutter" | "swiftui" | "html" | "tailwind";

// For Tailwind, show the name and don't show the contrast.
type exportSolidColor = {
  hex: string;
  colorName: string;
  exported: string;
  contrastWhite: number;
  contrastBlack: number;
};

export const retrieveGenericSolidUIColors = (
  sceneNode: Array<AltSceneNode>,
  framework: exportFramework
): Array<exportSolidColor> => {
  const selectedChildren = deepFlatten(sceneNode);

  const colorStr: Array<exportSolidColor> = [];

  // collect all fills and strokes SOLID colors
  selectedChildren.forEach((d) => {
    if ("fills" in d) {
      const fills = convertSolidColor(d.fills, framework, d.type);
      if (fills) {
        colorStr.push(...fills);
      }
    }
    if ("strokes" in d) {
      const strokes = convertSolidColor(d.strokes, framework, d.type);
      if (strokes) {
        colorStr.push(...strokes);
      }
    }
  });

  // retrieve only unique colors
  // from https://stackoverflow.com/a/18923480/4418073
  const unique: Record<string, boolean> = {};
  const distinct: Array<exportSolidColor> = [];
  colorStr.forEach(function (x) {
    if (!unique[x.hex]) {
      distinct.push(x);
      unique[x.hex] = true;
    }
  });

  return distinct.sort((a, b) => a.hex.localeCompare(b.hex));
};

const convertSolidColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
  framework: exportFramework,
  nodeType: string
): Array<exportSolidColor> | null => {
  // shortcut to be used for calculateContrastRatio.
  const black = {
    r: 0,
    g: 0,
    b: 0,
  };

  const white = {
    r: 1,
    g: 1,
    b: 1,
  };

  if (fills && fills !== figma.mixed && fills.length > 0) {
    return fills
      .map((fill) => {
        if (fill?.type === "SOLID") {
          let exported = "";

          if (framework === "flutter") {
            exported = flutterColor(fill.color, fill.opacity ?? 1.0);
          } else if (framework === "html") {
            exported = htmlColor(fill.color, fill.opacity ?? 1.0);
          } else if (framework === "tailwind") {
            const kind = nodeType === "TEXT" ? "text" : "bg";
            exported = tailwindSolidColor(fill, kind);

            const hex = rgbTo6hex(fill.color);
            const hexNearestColor = tailwindNearestColor(hex);

            // special case since each color has a name.
            return {
              hex: hex,
              colorName: tailwindColors[hexNearestColor],
              exported: exported,
              contrastBlack: 0,
              contrastWhite: 0,
            };
          } else if (framework === "swiftui") {
            exported = swiftuiColor(fill.color, fill.opacity ?? 1.0);
          }

          return {
            hex: rgbTo6hex(fill.color),
            colorName: "",
            exported: exported,
            contrastBlack: calculateContrastRatio(fill.color, black),
            contrastWhite: calculateContrastRatio(fill.color, white),
          };
        }

        return null;
      })
      .filter(notEmpty);
  }

  return null;
};

// from https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o
function calculateContrastRatio(color1: RGB, color2: RGB) {
  const color1luminance = luminance(color1);
  const color2luminance = luminance(color2);

  const contrast =
    color1luminance > color2luminance
      ? (color2luminance + 0.05) / (color1luminance + 0.05)
      : (color1luminance + 0.05) / (color2luminance + 0.05);

  return 1 / contrast;
}

type exportLinearGradient = {
  css: string;
  exported: string;
};

export const retrieveGenericLinearGradients = (
  sceneNode: Array<AltSceneNode>,
  framework: exportFramework
): Array<exportLinearGradient> => {
  const selectedChildren = deepFlatten(sceneNode);

  const colorStr: Array<exportLinearGradient> = [];

  // collect all Linear Gradient colors from fills and strokes
  selectedChildren.forEach((d) => {
    if ("fills" in d) {
      const fills = convertGradient(d.fills, framework);
      if (fills) {
        colorStr.push(...fills);
      }
    }
    if ("strokes" in d) {
      const strokes = convertGradient(d.strokes, framework);
      if (strokes) {
        colorStr.push(...strokes);
      }
    }
  });

  // retrieve only unique colors
  // from https://stackoverflow.com/a/18923480/4418073
  const unique: Record<string, boolean> = {};
  const distinct: Array<exportLinearGradient> = [];
  colorStr.forEach(function (x) {
    if (!unique[x.css]) {
      distinct.push(x);
      unique[x.css] = true;
    }
  });

  return distinct;
};

const convertGradient = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
  framework: exportFramework
): Array<exportLinearGradient> | null => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined

  if (fills && fills !== figma.mixed && fills.length > 0) {
    return fills
      .map((fill) => {
        if (fill?.type === "GRADIENT_LINEAR") {
          let exported = "";
          if (framework === "flutter") {
            exported = flutterGradient(fill);
          } else if (framework === "html") {
            exported = htmlGradient(fill);
          } else if (framework === "tailwind") {
            exported = tailwindGradient(fill);
          } else if (framework === "swiftui") {
            exported = swiftuiGradient(fill);
          }

          return {
            css: htmlGradient(fill),
            exported: exported,
          };
        }

        return null;
      })
      .filter(notEmpty);
  }

  return null;
};

function luminance(color: RGB) {
  const a = [color.r * 255, color.g * 255, color.b * 255].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function deepFlatten(arr: Array<AltSceneNode>): Array<AltSceneNode> {
  let result: Array<AltSceneNode> = [];

  arr.forEach((d) => {
    if ("children" in d) {
      result.push(d);
      result = result.concat(deepFlatten(d.children));
    } else {
      result.push(d);
    }
  });

  return result;
}
