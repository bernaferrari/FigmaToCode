import { AltSceneNode } from "./../altNodes/altMixins";

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
  if (isJSX) {
    return [`width: ${node.width}, `, `height: ${node.height}, `];
  } else {
    return [`width: ${node.width}px; `, `height: ${node.height}px; `];
  }
};
