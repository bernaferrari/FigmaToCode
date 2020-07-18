import { AltSceneNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { numToAutoFixed } from "../../common/numToAutoFixed";

export const flutterSize = (node: AltSceneNode): string => {
  const size = nodeWidthHeight(node, false);

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  const propWidth = size.width
    ? `width: ${numToAutoFixed(size.width as number)}, `
    : "";

  const propHeight = size.height
    ? `height: ${numToAutoFixed(size.height)}, `
    : "";

  return `${propWidth}${propHeight}`;
};
