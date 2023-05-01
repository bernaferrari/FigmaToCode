import { CSSProperties } from "react";
import { AltSceneNode } from "../../altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";

export const htmlSize = (node: AltSceneNode): CSSProperties => {
  const size = nodeWidthHeight(node, false);

  let cssProperty: CSSProperties = {};
  if (typeof size.width === "number") {
    cssProperty.width = size.width;
  } else if (size.width === "full") {
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "HORIZONTAL"
    ) {
      cssProperty.flex = "1 1 0%";
    } else {
      cssProperty.width = "100%";
    }
  }

  if (typeof size.height === "number") {
    cssProperty.height = size.height;
  } else if (typeof size.height === "string") {
    if (
      node.parent &&
      "layoutMode" in node.parent &&
      node.parent.layoutMode === "VERTICAL"
    ) {
      cssProperty.flex = "1 1 0%";
    } else {
      cssProperty.height = "100%";
    }
  }

  return cssProperty;
};
