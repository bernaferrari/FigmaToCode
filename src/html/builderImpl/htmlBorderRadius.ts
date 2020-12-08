import { AltSceneNode } from "../../altNodes/altMixins";
import { formatWithJSX } from "../../common/parseJSX";

/**
 * https://tailwindcss.com/docs/border-radius/
 * example: rounded-sm
 * example: rounded-tr-lg
 */
export const htmlBorderRadius = (
  node: AltSceneNode,
  isJsx: boolean
): string => {
  if (node.type === "ELLIPSE") {
    return formatWithJSX("border-radius", isJsx, 9999);
  } else if (
    (!("cornerRadius" in node) && !("topLeftRadius" in node)) ||
    (node.cornerRadius === figma.mixed && node.topLeftRadius === undefined) ||
    node.cornerRadius === 0
  ) {
    // the second condition is used on tests. On Figma, topLeftRadius is never undefined.
    // ignore when 0, undefined or non existent
    return "";
  }

  let comp = "";

  if (node.cornerRadius !== figma.mixed) {
    comp += formatWithJSX("border-radius", isJsx, node.cornerRadius);
  } else {
    // todo optimize for tr/tl/br/bl instead of t/r/l/b
    if (node.topLeftRadius !== 0) {
      comp += formatWithJSX(
        "border-top-left-radius",
        isJsx,
        node.topLeftRadius
      );
    }
    if (node.topRightRadius !== 0) {
      comp += formatWithJSX(
        "border-top-right-radius",
        isJsx,
        node.topRightRadius
      );
    }
    if (node.bottomLeftRadius !== 0) {
      comp += formatWithJSX(
        "border-bottom-left-radius",
        isJsx,
        node.bottomLeftRadius
      );
    }
    if (node.bottomRightRadius !== 0) {
      comp += formatWithJSX(
        "border-bottom-right-radius",
        isJsx,
        node.bottomRightRadius
      );
    }
  }

  return comp;
};
