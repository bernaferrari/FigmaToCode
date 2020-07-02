import { AltTextNode } from "../../altNodes/altMixins";
import { pxToLayoutSize } from "../conversionTables";
import { isWidthFull } from "../../common/nodeWidthHeight";

export const tailwindTextSize = (node: AltTextNode): string => {
  const { width, height } = textWidthHeight(
    node,
    node.parent?.type !== "GROUP"
  );

  let comp = "";

  if (typeof width === "number") {
    comp += `w-${pxToLayoutSize(width)} `;
  } else if (width) {
    comp += "w-full ";
  }

  if (height) {
    comp += `h-${pxToLayoutSize(height)} `;
  }

  return comp;
};

type SizeResult = {
  readonly width: "full" | number | null;
  readonly height: number | null;
};

export const textWidthHeight = (
  node: AltTextNode,
  isRelative: boolean
): SizeResult => {
  // parent must not be a Group for isWidthFull to work

  if (node.textAutoResize === "NONE") {
    return {
      width: isRelative && isWidthFull(node) ? "full" : node.width,
      height: node.height,
    };
  } else if (node.textAutoResize === "HEIGHT") {
    return {
      width: isRelative && isWidthFull(node) ? "full" : node.width,
      height: null,
    };
  }

  return {
    width: null,
    height: null,
  };
};
