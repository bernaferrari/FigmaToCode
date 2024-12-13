import { pxToLayoutSize } from "../conversionTables";
import { commonPadding } from "../../common/commonPadding";

/**
 * https://tailwindcss.com/docs/margin/
 * example: px-2 py-8
 */
export const tailwindPadding = (node: InferredAutoLayoutResult): string[] => {
  const padding = commonPadding(node);
  if (!padding) {
    return [];
  }

  if ("all" in padding) {
    if (padding.all === 0) {
      return [];
    }
    return [`p-${pxToLayoutSize(padding.all)}`];
  }

  let comp: string[] = [];

  if ("horizontal" in padding) {
    // horizontal and vertical, as the default AutoLayout
    if (padding.horizontal && padding.horizontal !== 0) {
      comp.push(`px-${pxToLayoutSize(padding.horizontal)}`);
    }
    if (padding.vertical && padding.vertical !== 0) {
      comp.push(`py-${pxToLayoutSize(padding.vertical)}`);
    }
    return comp;
  }

  // if left and right exists, verify if they are the same after [pxToLayoutSize] conversion.
  const { left, right, top, bottom } = padding;

  if (left || right) {
    const pl = left ? `pl-${pxToLayoutSize(left)}` : "";
    const pr = right ? `pr-${pxToLayoutSize(right)}` : "";
    comp.push(
      ...(left && right && pxToLayoutSize(left) === pxToLayoutSize(right)
        ? [`px-${pxToLayoutSize(left)}`]
        : [pl, pr]),
    );
  }

  if (top || bottom) {
    const pt = top ? `pt-${pxToLayoutSize(top)}` : "";
    const pb = bottom ? `pb-${pxToLayoutSize(bottom)}` : "";
    comp.push(
      ...(top && bottom && pxToLayoutSize(top) === pxToLayoutSize(bottom)
        ? [`py-${pxToLayoutSize(top)}`]
        : [pt, pb]),
    );
  }

  return comp;
};
