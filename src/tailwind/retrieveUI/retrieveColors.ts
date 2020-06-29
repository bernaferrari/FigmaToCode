import { AltSceneNode } from "../../altNodes/altMixins";
import {
  tailwindNearestColor,
  tailwindColors,
} from "../builderImpl/tailwindColor";
import { rgbTo6hex } from "../../common/rgbToHex";

export const retrieveTailwindColors = (
  sceneNode: Array<AltSceneNode>
): Array<namedColor> => {
  const selectedChildren = deepFlatten(sceneNode);

  const colorStr: Array<namedColor> = [];

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
  const distinct: Array<namedColor> = [];
  colorStr.forEach(function (x) {
    if (!unique[x.hex]) {
      distinct.push(x);
      unique[x.hex] = true;
    }
  });

  return distinct.sort((a, b) => a.name.localeCompare(b.name));
};

type namedColor = {
  name: string;
  hex: string;
};

const convertColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): namedColor | undefined => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined
  if (fills && fills !== figma.mixed && fills.length > 0) {
    const fill = fills[0];
    if (fill.type === "SOLID") {
      const hex = rgbTo6hex(fill.color);
      const tailColor = tailwindNearestColor(hex);
      const nameTailwind = tailwindColors[tailColor];
      return {
        name: nameTailwind,
        hex: tailColor,
      };
    }
  }

  return undefined;
};

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
