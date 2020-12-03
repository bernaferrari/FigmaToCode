import { AltSceneNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { numToAutoFixed } from "../../common/numToAutoFixed";

export const flutterSize = (node: AltSceneNode): string => {
  const size = nodeWidthHeight(node, false);

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    propWidth = `width: ${numToAutoFixed(size.width)}, `;
  } else if (size.width === "full") {
    propWidth = `width: double.infinity, `;
  }

  let propHeight = "";
  if (typeof size.height === "number") {
    propHeight = `height: ${numToAutoFixed(size.height)}, `;
  } else if (size.height === "full") {
    propHeight = `height: double.infinity, `;
  }

  return `${propWidth}${propHeight}`;
};
