/**
 * Large (Default)
 * https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/
 */
export const swiftuiFontMatcher = (node: TextNode): string => {
  if (node.fontSize === figma.mixed) {
    return "";
  }

  if (node.fontSize <= 11) {
    return ".caption2";
  } else if (node.fontSize <= 12) {
    return ".caption";
  } else if (node.fontSize <= 13) {
    return ".footnote";
  } else if (node.fontSize <= 15) {
    return ".subheadline";
  } else if (node.fontSize <= 16) {
    return ".callout";
  } else if (node.fontSize <= 17) {
    return ".body";
  } else if (node.fontSize <= 20) {
    return ".title3";
  } else if (node.fontSize <= 22) {
    return ".title2";
  } else if (node.fontSize <= 28) {
    return ".title";
  } else {
    return ".largeTitle";
  }
};

/**
 * nine weights — from Ultralight to Black
 * https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/
 */
export const swiftuiWeightMatcher = (weight: number): string => {
  // yes, "ultraLight" and "semibold" are correct.
  switch (weight) {
    case 100:
      return ".ultraLight";
    case 200:
      return ".thin";
    case 300:
      return ".light";
    case 400:
      return ".regular";
    case 500:
      return ".medium";
    case 600:
      return ".semibold";
    case 700:
      return ".bold";
    case 800:
      return ".heavy";
    case 900:
      return ".black";
    default:
      return "";
  }
};
