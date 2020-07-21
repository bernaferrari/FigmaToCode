import { AltFrameMixin, AltDefaultShapeMixin } from "../../altNodes/altMixins";
import { pxToLayoutSize } from "../conversionTables";
import { commonPadding } from "../../common/commonPadding";

/**
 * https://tailwindcss.com/docs/margin/
 * example: px-2 py-8
 */
export const tailwindPadding = (
  node: AltFrameMixin | AltDefaultShapeMixin
): string => {
  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    return `p-${pxToLayoutSize(padding.all)} `;
  }

  let comp = "";

  // horizontal and vertical, as the default AutoLayout
  if (padding.horizontal) {
    comp += `px-${pxToLayoutSize(padding.horizontal)} `;
  }
  if (padding.vertical) {
    comp += `py-${pxToLayoutSize(padding.vertical)} `;
  }

  // if left and right exists, verify if they are the same after [pxToLayoutSize] conversion.
  if (padding.left && padding.right) {
    const left = pxToLayoutSize(padding.left);
    const right = pxToLayoutSize(padding.right);

    if (left === right) {
      comp += `px-${left} `;
    } else {
      comp += `pl-${left} pr-${right} `;
    }
  } else if (padding.left) {
    comp += `pl-${pxToLayoutSize(padding.left)} `;
  } else if (padding.right) {
    comp += `pr-${pxToLayoutSize(padding.right)} `;
  }

  // if top and bottom exists, verify if they are the same after [pxToLayoutSize] conversion.
  if (padding.top && padding.bottom) {
    const top = pxToLayoutSize(padding.top);
    const bottom = pxToLayoutSize(padding.bottom);

    if (top === bottom) {
      comp += `py-${top} `;
    } else {
      comp += `pt-${top} pb-${bottom} `;
    }
  } else if (padding.top) {
    comp += `pt-${pxToLayoutSize(padding.top)} `;
  } else if (padding.bottom) {
    comp += `pb-${pxToLayoutSize(padding.bottom)} `;
  }

  return comp;
};
