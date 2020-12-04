import { AltSceneNode } from "./../altNodes/altMixins";
import { formatWithJSX } from "../common/parseJSX";

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
    formatWithJSX("width", isJSX, node.width),
    formatWithJSX("height", isJSX, node.height),
  ];
};
