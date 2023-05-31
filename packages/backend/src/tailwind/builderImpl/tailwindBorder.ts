import { getCommonRadius } from "../../common/commonRadius";
import { nearestValue, pxToBorderRadius } from "../conversionTables";

/**
 * https://tailwindcss.com/docs/border-width/
 * example: border-2
 */
export const tailwindBorderWidth = (node: MinimalStrokesMixin): string => {
  // [node.strokeWeight] can have a value even when there are no strokes
  // [when testing] node.effects can be undefined
  if (
    node.strokes &&
    node.strokes.length > 0 &&
    node.strokeWeight !== figma.mixed &&
    node.strokeWeight > 0
  ) {
    const allowedValues = [1, 2, 4, 8];
    const nearest = nearestValue(node.strokeWeight, allowedValues);
    if (nearest === 1) {
      // special case
      return "border ";
    } else {
      return `border-${nearest}`;
    }
  }
  return "";
};

/**
 * https://tailwindcss.com/docs/border-radius/
 * example: rounded-sm
 * example: rounded-tr-lg
 */
export const tailwindBorderRadius = (node: SceneNode): string => {
  const radius = getCommonRadius(node);

  if ("all" in radius) {
    if (radius.all === 0) {
      return "";
    }

    if (radius.all >= node.height / 2) {
      // special case. If height is 90 and cornerRadius is 45, it is full.
      return "rounded-full";
    } else {
      return `rounded${pxToBorderRadius(radius.all)}`;
    }
  }

  // todo optimize for tr/tl/br/bl instead of t/r/l/b
  let comp: string[] = [];
  if (radius.topLeft !== 0) {
    comp.push(`rounded-tl${pxToBorderRadius(radius.topLeft)}`);
  }
  if (radius.topRight !== 0) {
    comp.push(`rounded-tr${pxToBorderRadius(radius.topRight)}`);
  }
  if (radius.bottomLeft !== 0) {
    comp.push(`rounded-bl${pxToBorderRadius(radius.bottomLeft)}`);
  }
  if (radius.bottomRight !== 0) {
    comp.push(`rounded-br${pxToBorderRadius(radius.bottomRight)}`);
  }

  return comp.join(" ");
};
