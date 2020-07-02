import { AltSceneNode, AltTextNode } from "../../altNodes/altMixins";
import { tailwindNearestColor } from "../builderImpl/tailwindColor";
import { TailwindTextBuilder, convertFontWeight } from "../tailwindTextBuilder";
import { rgbTo6hex } from "../../common/rgbToHex";

export const retrieveTailwindText = (
  sceneNode: Array<AltSceneNode>
): Array<namedText> => {
  // convert to AltNode and then flatten it. Conversion is necessary because of [tailwindText]
  const selectedText = deepFlatten(sceneNode);

  const textStr: Array<namedText> = [];

  selectedText.forEach((node) => {
    if (node.type === "TEXT") {
      const attr = new TailwindTextBuilder(false, node, false)
        .blend(node)
        .position(node, node.parent?.id ?? "")
        .textAutoSize(node)
        .fontSize(node)
        .fontStyle(node)
        .letterSpacing(node)
        .lineHeight(node)
        .textDecoration(node)
        .textAlign(node)
        .customColor(node.fills, "text")
        .textTransform(node)
        .removeTrailingSpace();

      const splittedChars = node.characters.split("\n");
      const charsWithLineBreak =
        splittedChars.length > 1
          ? node.characters.split("\n").join("<br></br>")
          : node.characters;

      const black = {
        r: 0,
        g: 0,
        b: 0,
      };

      let contrastBlack = 21;
      if (node.fills && node.fills !== figma.mixed && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === "SOLID") {
          contrastBlack = calculateContrastRatio(fill.color, black);
        }
      }

      textStr.push({
        name: node.name,
        attr: attr.attributes,
        full: `<p ${attr.attributes}>${charsWithLineBreak}</p>`,
        style: style(node),
        contrastBlack: contrastBlack,
      });
    }
  });

  // retrieve only unique texts (attr + name)
  // from https://stackoverflow.com/a/18923480/4418073
  const unique: Record<string, boolean> = {};
  const distinct: Array<namedText> = [];
  textStr.forEach(function (x) {
    if (!unique[x.attr + x.name]) {
      distinct.push(x);
      unique[x.attr + x.name] = true;
    }
  });

  return distinct;
};

type namedText = {
  name: string;
  attr: string;
  full: string;
  style: string;
  contrastBlack: number;
};

const style = (node: AltTextNode): string => {
  let comp = "";

  if (node.fontName !== figma.mixed) {
    const lowercaseStyle = node.fontName.style.toLowerCase();

    if (lowercaseStyle.match("italic")) {
      comp += "font-style: italic; ";
    }

    const value = node.fontName.style
      .replace("italic", "")
      .replace(" ", "")
      .toLowerCase();

    comp += `font-weight: ${convertFontWeight(value)}; `;
  }

  if (node.fontSize !== figma.mixed) {
    comp += `font-size: ${Math.min(node.fontSize, 24)}; `;
  }

  const color = convertColor(node.fills);
  if (color) {
    comp += `color: ${color}; `;
  }

  return comp;
};

function deepFlatten(arr: Array<AltSceneNode>): Array<AltSceneNode> {
  let result: Array<AltSceneNode> = [];

  arr.forEach((d) => {
    if ("children" in d) {
      result = result.concat(deepFlatten([...d.children]));
    } else {
      if (d.type === "TEXT") {
        result.push(d);
      }
    }
  });

  return result;
}

const convertColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string | undefined => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined

  if (fills && fills !== figma.mixed && fills.length > 0) {
    const fill = fills[0];
    if (fill.type === "SOLID") {
      return tailwindNearestColor(rgbTo6hex(fill.color));
    }
  }

  return undefined;
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
