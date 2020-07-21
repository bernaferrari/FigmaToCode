import { AltTextNode } from "../altNodes/altMixins";

export const commonLineHeight = (node: AltTextNode): number => {
  if (
    node.lineHeight !== figma.mixed &&
    node.lineHeight.unit !== "AUTO" &&
    Math.round(node.lineHeight.value) !== 0
  ) {
    if (node.lineHeight.unit === "PIXELS") {
      return node.lineHeight.value;
    } else {
      if (node.fontSize !== figma.mixed) {
        // based on tests, using Inter font with varied sizes and weights, this works.
        // example: 24 * 20 / 100 = 4.8px, which is correct visually.
        return (node.fontSize * node.lineHeight.value) / 100;
      }
    }
  }

  return 0;
};

export const commonLetterSpacing = (node: AltTextNode): number => {
  if (
    node.letterSpacing !== figma.mixed &&
    Math.round(node.letterSpacing.value) !== 0
  ) {
    if (node.letterSpacing.unit === "PIXELS") {
      return node.letterSpacing.value;
    } else {
      if (node.fontSize !== figma.mixed) {
        // read [commonLineHeight] comment to understand what is going on here.
        return (node.fontSize * node.letterSpacing.value) / 100;
      }
    }
  }

  return 0;
};
