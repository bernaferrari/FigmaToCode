import { AltSceneNode } from "../../common/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";

export const flutterSize = (node: AltSceneNode): string => {
  const size = nodeWidthHeight(node, false);
  let propWidth = size.width ? `width: ${size.width}, ` : "";
  let propHeight = size.height ? `height: ${size.height}, ` : "";
  return `${propWidth}${propHeight}`;
};
