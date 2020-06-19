import { AltSceneNode, AltTextNode } from "./../common/altMixins";
import { tailwindTextNodeBuilder } from "./tailwind_text_builder";
import { rgbTo6hex, tailwindNearestColor, convertFontWeight } from "./colors";
import { pxToFontSize } from "./conversion_tables";

export const extractTailwindText = (
  sceneNode: Array<AltSceneNode>
): Array<namedText> => {
  // convert to AltNode and then flatten it. Conversion is necessary because of [tailwindText]
  const selectedText = deepFlatten(sceneNode);

  let textStr: Array<namedText> = [];

  selectedText.forEach((node) => {
    if (node.type === "TEXT") {
      const attr = new tailwindTextNodeBuilder(false, node, false)
        .blendAttr(node)
        .containerPosition(node, node.parent?.id ?? "")
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

      textStr.push({
        name: node.name,
        attr: attr.attributes,
        full: `<p ${attr.attributes}>${charsWithLineBreak}</p>`,
        style: style(node),
      });
    }
  });

  // retrieve only unique texts (attr + name)
  // from https://stackoverflow.com/a/18923480/4418073
  let unique: Record<string, boolean> = {};
  let distinct: Array<namedText> = [];
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
};

const style = (node: AltTextNode): string => {
  let comp = "";

  if (node.fontName !== figma.mixed) {
    const lowercaseStyle = node.fontName.style.toLowerCase();

    if (lowercaseStyle.match("italic")) {
      comp += "font-style: italic; ";
    }

    if (lowercaseStyle.match("regular")) {
      // ignore the font-style when regular (default)
      return "";
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
    let fill = fills[0];
    if (fill.type === "SOLID") {
      return tailwindNearestColor(rgbTo6hex(fill.color));
    }
  }

  return undefined;
};
