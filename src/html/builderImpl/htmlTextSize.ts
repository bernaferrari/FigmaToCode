import { AltTextNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";
import { formatWithJSX } from "../../common/parseJSX";

export const htmlTextSize = (node: AltTextNode, isJsx: boolean): string => {
  const sizeResult = nodeWidthHeight(node, false);

  let comp = "";
  if (sizeResult.width && node.textAutoResize !== "WIDTH_AND_HEIGHT") {
    if (typeof sizeResult.width === "number") {
      comp += formatWithJSX("width", isJsx, sizeResult.width);
    }
  }

  if (sizeResult.height && node.textAutoResize === "NONE") {
    if (typeof sizeResult.height === "number") {
      comp += formatWithJSX("height", isJsx, sizeResult.height);
    }
  }

  return comp;
};
