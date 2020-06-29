import { AltSceneNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";

export const flutterSize = (node: AltSceneNode): string => {
  const size = nodeWidthHeight(node, false);
  const propWidth = size.width ? `width: ${size.width}, ` : "";
  const propHeight = size.height ? `height: ${size.height}, ` : "";
  return `${propWidth}${propHeight}`;
};
