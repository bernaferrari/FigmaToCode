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
    return `tw-p-${pxToLayoutSize(padding.all)} `;
  }

  let comp = "";

  // horizontal and vertical, as the default AutoLayout
  if (padding.horizontal) {
    comp += `tw-px-${pxToLayoutSize(padding.horizontal)} `;
  }
  if (padding.vertical) {
    comp += `tw-py-${pxToLayoutSize(padding.vertical)} `;
  }

  // if left and right exists, verify if they are the same after [pxToLayoutSize] conversion.
  if (padding.left && padding.right) {
    const left = pxToLayoutSize(padding.left);
    const right = pxToLayoutSize(padding.right);

    if (left === right) {
      comp += `tw-px-${left} `;
    } else {
      comp += `tw-pl-${left} pr-${right} `;
    }
  } else if (padding.left) {
    comp += `tw-pl-${pxToLayoutSize(padding.left)} `;
  } else if (padding.right) {
    comp += `tw-pr-${pxToLayoutSize(padding.right)} `;
  }

  // if top and bottom exists, verify if they are the same after [pxToLayoutSize] conversion.
  if (padding.top && padding.bottom) {
    const top = pxToLayoutSize(padding.top);
    const bottom = pxToLayoutSize(padding.bottom);

    if (top === bottom) {
      comp += `tw-py-${top} `;
    } else {
      comp += `tw-pt-${top} tw-pb-${bottom} `;
    }
  } else if (padding.top) {
    comp += `tw-pt-${pxToLayoutSize(padding.top)} `;
  } else if (padding.bottom) {
    comp += `tw-pb-${pxToLayoutSize(padding.bottom)} `;
  }

  return comp;
};
