import { AltSceneNode } from "./../common/altMixins";
import { tailwindTextNodeBuilder } from "./tailwind_text_builder";

export const extractTailwindText = (
  sceneNode: Array<AltSceneNode>
): Array<namedText> => {
  // convert to AltNode and then flatten it. Conversion is necessary because of [tailwindText]
  const selectedText = deepFlatten(sceneNode);

  let textStr: Array<namedText> = [];

  selectedText.forEach((node) => {
    if (node.type === "TEXT") {
      const attr = new tailwindTextNodeBuilder("", false, node.visible)
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
        full: `<p ${attr}>${charsWithLineBreak}</p>`,
      });
    }
  });

  return textStr;
};

type namedText = {
  name: string;
  attr: string;
  full: string;
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
