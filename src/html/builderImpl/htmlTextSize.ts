import { AltTextNode } from "../../altNodes/altMixins";
import { htmlSizePartial } from "./htmlSize";

export const htmlTextSize = (node: AltTextNode, isJsx: boolean): string => {
  const [width, height] = htmlSizePartial(node, isJsx);

  let comp = "";
  if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
    comp += width;
  }

  if (node.textAutoResize === "NONE") {
    comp += height;
  }

  return comp;
};
