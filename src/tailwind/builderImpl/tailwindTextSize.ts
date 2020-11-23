import { AltTextNode } from "../../altNodes/altMixins";
import { pxToLayoutSize } from "../conversionTables";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";

export const tailwindTextSize = (node: AltTextNode): string => {
  const sizeResult = nodeWidthHeight(node, true);

  let comp = "";
  if (sizeResult.width && node.textAutoResize !== "WIDTH_AND_HEIGHT") {
    if (typeof sizeResult.width === "number") {
      comp += `w-${pxToLayoutSize(sizeResult.width)} `;
    } else {
      comp += `w-${sizeResult.width} `;
    }
  }

  if (sizeResult.height && node.textAutoResize === "NONE") {
    if (typeof sizeResult.height === "number") {
      comp += `h-${pxToLayoutSize(sizeResult.height)} `;
    } else {
      comp += `h-${sizeResult.height} `;
    }
  }

  return comp;
};
