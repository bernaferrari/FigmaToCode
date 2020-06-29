import { AltSceneNode } from "../../altNodes/altMixins";
import { pxToLayoutSize } from "../conversionTables";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";

export const tailwindSize = (node: AltSceneNode): string => {
  const sizeResult = nodeWidthHeight(node, true);

  let comp = "";
  if (sizeResult.width) {
    if (typeof sizeResult.width === "number") {
      comp += `w-${pxToLayoutSize(sizeResult.width)} `;
    } else {
      comp += `w-${sizeResult.width} `;
    }
  }

  if (sizeResult.height) {
    comp += `h-${pxToLayoutSize(sizeResult.height)} `;
   }

  return comp;
};
