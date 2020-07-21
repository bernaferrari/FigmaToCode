import { AltSceneNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { numToAutoFixed } from "../../common/numToAutoFixed";

export const swiftuiSize = (node: AltSceneNode): string => {
  const size = nodeWidthHeight(node, false);

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  const propWidth = size.width
    ? `width: ${numToAutoFixed(size.width as number)}`
    : "";

  const propHeight = size.height
    ? `height: ${numToAutoFixed(size.height)}`
    : "";

  if (propWidth || propHeight) {
    // add comma if propWidth and propHeight both exists
    const comma = propWidth && propHeight ? ", " : "";
    return `\n.frame(${propWidth}${comma}${propHeight})`;
  }

  return "";
};
