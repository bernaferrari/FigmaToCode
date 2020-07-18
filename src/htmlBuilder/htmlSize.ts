import { AltSceneNode } from "./../altNodes/altMixins";
import { parseNumJSX } from "../common/parseJSX";

/**
 * https://www.w3schools.com/css/css_dimension.asp
 */
export const htmlSize = (node: AltSceneNode, isJSX: boolean): string => {
  return htmlSizePartial(node, isJSX).join("");
};

export const htmlSizePartial = (
  node: AltSceneNode,
  isJSX: boolean
): [string, string] => {
  return [
    parseNumJSX("width", "width", isJSX, node.width),
    parseNumJSX("height", "height", isJSX, node.height),
  ];
};
