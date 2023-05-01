import { CSSProperties } from "react";
import { htmlSize } from "./htmlSize";
import { AltTextNode } from "../../altMixins";

export const htmlTextSize = (node: AltTextNode): CSSProperties => {
  const cssProperty = htmlSize(node);

  if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
    // cssProperty += width;
  }

  if (node.textAutoResize === "NONE") {
    // comp += height;
  }

  return cssProperty;
};
