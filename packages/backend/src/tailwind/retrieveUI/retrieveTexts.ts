import { tailwindNearestColor } from "../builderImpl/tailwindColor";
import { TailwindTextBuilder } from "../tailwindTextBuilder";
import { rgbTo6hex } from "../../common/color";
import { retrieveTopFill } from "../../common/retrieveFill";
import { convertFontWeight } from "../../common/convertFontWeight";

export const retrieveTailwindText = async (
  sceneNode: Array<SceneNode>
): Promise<namedText[]> => {
  // convert to Node and then flatten it. Conversion is necessary because of [tailwindText]
  const selectedText = deepFlatten(sceneNode);

  const textStr: Array<namedText> = [];

  for (const node of selectedText) {
    if (node.type === "TEXT") {
      let layoutBuilder = new TailwindTextBuilder(node, false, false)
        .commonPositionStyles(node, false)
        .textAlign(node);

      const styledHtml = await layoutBuilder.getTextSegments(node.id);

      let content = "";
      if (styledHtml.length === 1) {
        layoutBuilder.addAttributes(styledHtml[0].style);
        content = styledHtml[0].text;
      } else {
        content = styledHtml
          .map((style) => `<span style="${style.style}">${style.text}</span>`)
          .join("");
      }

      // return `\n<div${layoutBuilder.build()}>${content}</div>`;

      const attr = new TailwindTextBuilder(node, false, false)
        .blend(node)
        .position(node, true);

      const splittedChars = node.characters.split("\n");
      const charsWithLineBreak =
        splittedChars.length > 1
          ? node.characters.split("\n").join("<br/>")
          : node.characters;

      const black = {
        r: 0,
        g: 0,
        b: 0,
      };

      let contrastBlack = 21;

      const fill = retrieveTopFill(node.fills);

      if (fill && fill.type === "SOLID") {
        contrastBlack = calculateContrastRatio(fill.color, black);
      }

      textStr.push({
        name: node.name,
        attr: attr.attributes.join(" "),
        full: `<span class="${attr.attributes}">${charsWithLineBreak}</span>`,
        style: style(node),
        contrastBlack,
      });
    }
  };

  // retrieve only unique texts (attr + name)
  // from https://stackoverflow.com/a/18923480/4418073
  const unique: Record<string, boolean> = {};
  const distinct: Array<namedText> = [];
  textStr.forEach((x) => {
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

const style = (node: TextNode): string => {
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

    const weight = convertFontWeight(value);
    if (weight) {
      comp += `font-weight: ${weight};`;
    }
  }

  if (node.fontSize !== figma.mixed) {
    comp += `font-size: ${Math.min(node.fontSize, 24)};`;
  }

  const color = convertColor(node.fills);
  if (color) {
    comp += `color: ${color};`;
  }

  return comp;
};

function deepFlatten(arr: Array<SceneNode>): Array<SceneNode> {
  let result: Array<SceneNode> = [];

  arr.forEach((d) => {
    if ("children" in d) {
      result = result.concat(deepFlatten([...d.children]));
    } else if (d.type === "TEXT") {
      result.push(d);
    }
  });

  return result;
}

const convertColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string | undefined => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined

  const fill = retrieveTopFill(fills);

  if (fill && fill.type === "SOLID") {
    return tailwindNearestColor(rgbTo6hex(fill.color));
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
  const a = [color.r * 255, color.g * 255, color.b * 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
