import { AltSceneNode } from "../../altNodes/altMixins";

// Add padding if necessary!
// This must happen before Stack or after the Positioned, but not before.
export const flutterPadding = (node: AltSceneNode): string => {
  // padding is only valid for auto layout.
  // [horizontalPadding] and [verticalPadding] can have values even when AutoLayout is off
  if (
    "layoutMode" in node &&
    node.layoutMode !== "NONE" &&
    (node.horizontalPadding > 0 || node.verticalPadding > 0)
  ) {
    if (node.horizontalPadding === node.verticalPadding) {
      return `padding: const EdgeInsets.all(${node.horizontalPadding}), `;
    } else {
      const propHorizontalPadding =
        node.horizontalPadding > 0
          ? `horizontal: ${node.horizontalPadding}, `
          : "";

      const propVerticalPadding =
        node.verticalPadding > 0 ? `vertical: ${node.verticalPadding}, ` : "";

      return `padding: const EdgeInsets.symmetric(${propHorizontalPadding}${propVerticalPadding}),`;
    }
  }

  return "";
};
