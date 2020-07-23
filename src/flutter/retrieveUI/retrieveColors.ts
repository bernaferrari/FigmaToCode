import { AltSceneNode } from "../../altNodes/altMixins";
import { rgbTo6hex } from "../../common/color";
import { retrieveFill } from "../../common/retrieveFill";

export const retrieveFlutterColors = (
  sceneNode: Array<AltSceneNode>
): Array<contrastedColor> => {
  const selectedChildren = deepFlatten(sceneNode);

  const colorStr: Array<contrastedColor> = [];

  // collect all fill[0] and stroke[0] SOLID colors
  selectedChildren.forEach((d) => {
    if ("fills" in d) {
      const fills = convertColor(d.fills);
      if (fills) {
        colorStr.push(fills);
      }
    }
    if ("strokes" in d) {
      const strokes = convertColor(d.strokes);
      if (strokes) {
        colorStr.push(strokes);
      }
    }
  });

  // retrieve only unique colors
  // from https://stackoverflow.com/a/18923480/4418073
  const unique: Record<string, boolean> = {};
  const distinct: Array<contrastedColor> = [];
  colorStr.forEach(function (x) {
    if (!unique[x.hex]) {
      distinct.push(x);
      unique[x.hex] = true;
    }
  });

  return distinct.sort((a, b) => a.hex.localeCompare(b.hex));
};

type contrastedColor = {
  hex: string;
  contrastWhite: number;
  contrastBlack: number;
};

const convertColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): contrastedColor | null => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined

  const fill = retrieveFill(fills);

  if (fill?.type === "SOLID") {
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

    return {
      hex: rgbTo6hex(fill.color),
      contrastBlack: calculateContrastRatio(fill.color, black),
      contrastWhite: calculateContrastRatio(fill.color, white),
    };
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
