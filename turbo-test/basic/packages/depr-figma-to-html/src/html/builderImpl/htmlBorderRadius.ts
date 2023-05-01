import { CSSProperties } from "react";
import { AltSceneNode } from "../../altMixins";
import { formatWithJSX } from "../../common/parseJSX";

/**
 * https://tailwindcss.com/docs/border-radius/
 * example: rounded-sm
 * example: rounded-tr-lg
 */
export const htmlBorderRadius = (node: AltSceneNode): CSSProperties => {
  if (node.type === "ELLIPSE") {
    return { borderRadius: 9999 };
  } else if (
    (!("cornerRadius" in node) && !("topLeftRadius" in node)) ||
    ("cornerRadius" in node &&
      node.cornerRadius === figma.mixed &&
      node.topLeftRadius === undefined) ||
    ("cornerRadius" in node && node.cornerRadius === 0)
  ) {
    // the second condition is used on tests. On Figma, topLeftRadius is never undefined.
    // ignore when 0, undefined or non existent
    return {};
  }

  if (!("cornerRadius" in node)) {
    return {};
  }

  if (node.cornerRadius !== figma.mixed) {
    return { borderRadius: node.cornerRadius };
  } else {
    let comp: CSSProperties = {};
    // todo optimize for tr/tl/br/bl instead of t/r/l/b
    if (node.topLeftRadius !== 0) {
      comp.borderTopLeftRadius = node.topLeftRadius;
    }
    if (node.topRightRadius !== 0) {
      comp.borderTopRightRadius = node.topRightRadius;
    }
    if (node.bottomLeftRadius !== 0) {
      comp.borderBottomLeftRadius = node.bottomLeftRadius;
    }
    if (node.bottomRightRadius !== 0) {
      comp.borderBottomRightRadius = node.bottomRightRadius;
    }

    return comp;
  }
};
