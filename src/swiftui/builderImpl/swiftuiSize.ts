import { AltSceneNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { numToAutoFixed } from "../../common/numToAutoFixed";

export const swiftuiSize = (node: AltSceneNode): string => {
  const size = nodeWidthHeight(node, false);

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    propWidth = `width: ${numToAutoFixed(size.width)}`;
  } else if (node.parent) {
    propWidth = `width: ${numToAutoFixed(node.parent.width)}`;
  }

  let propHeight = "";
  if (typeof size.height === "number") {
    propHeight = `height: ${numToAutoFixed(size.height)}`;
  } else if (node.parent) {
    propHeight = `height: ${numToAutoFixed(node.parent.height)}`;
  }

  if (propWidth || propHeight) {
    // add comma if propWidth and propHeight both exists
    const comma = propWidth && propHeight ? ", " : "";
    return `\n.frame(${propWidth}${comma}${propHeight})`;
  }

  return "";
};
