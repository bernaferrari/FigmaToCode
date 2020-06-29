import { AltFrameMixin, AltDefaultShapeMixin } from "../../common/altMixins";
import { pxToLayoutSize } from "../conversionTables";

/**
 * https://tailwindcss.com/docs/padding/
 * example: px-2 py-8
 */
export const tailwindPadding = (
  node: AltFrameMixin | AltDefaultShapeMixin
): string => {
  // Add padding if necessary!
  // padding is currently only valid for auto layout.
  // [horizontalPadding] and [verticalPadding] can have values even when AutoLayout is off
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    // calculate before. This is less effective than calculating in the if/elses,
    // however, node.horizontalPadding might be different than node.verticalPadding
    // and still have the same pxToLayoutSize result. Therefore, this guarantees an optimal layout.
    const horizontal = pxToLayoutSize(node.horizontalPadding);
    const vertical = pxToLayoutSize(node.verticalPadding);

    if (
      node.horizontalPadding > 0 &&
      node.verticalPadding > 0 &&
      horizontal === vertical
    ) {
      return `p-${horizontal} `;
    } else {
      let comp = "";

      if (node.horizontalPadding > 0) {
        comp += `px-${horizontal} `;
      }

      if (node.verticalPadding > 0) {
        comp += `py-${vertical} `;
      }

      return comp;
    }
  }

  return "";
};
