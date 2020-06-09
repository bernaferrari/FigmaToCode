import { rgbTo6hex, getTailwindColor } from "./colors";

export const extractTailwindColors = (
  sceneNode: ReadonlyArray<SceneNode>
): Array<namedColor> => {
  const selectedChildren = deepFlatten([...sceneNode]);

  let colorStr: Array<namedColor> = [];

  // collect all fill[0] and stroke[0] SOLID colors
  selectedChildren.reduce((r, d) => {
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
    return r;
  }, []);

  return colorStr;
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
    let fill = fills[0];
    if (fill.type === "SOLID") {
      const hex = rgbTo6hex(fill.color);
      return {
        name: getTailwindColor(hex),
        hex: hex,
      };
    }
  }

  return undefined;
};

function deepFlatten(arr: Array<SceneNode>): Array<SceneNode> {
  let result: Array<SceneNode> = [];

  arr.forEach((d) => {
    if ("children" in d) {
      result = result.concat(deepFlatten([...d.children]));
    } else {
      result.push(d);
    }
  });

  return result;
}
