import { numberToFixedString } from "../../common/numToAutoFixed";
import { commonPadding } from "../../common/commonPadding";
import { SwiftUIModifier } from "types";

export const swiftuiPadding = (
  node: InferredAutoLayoutResult,
): SwiftUIModifier | null => {
  if (!("layoutMode" in node)) {
    return null;
  }

  const padding = commonPadding(node);
  if (!padding) {
    return null;
  }

  if ("all" in padding) {
    if (padding.all === 0) {
      return null;
    }
    return ["padding", numberToFixedString(padding.all)];
  }

  if ("horizontal" in padding) {
    const vertical = numberToFixedString(padding.vertical);
    const horizontal = numberToFixedString(padding.horizontal);
    return [
      "padding",
      `EdgeInsets(top: ${vertical}, leading: ${horizontal}, bottom: ${vertical}, trailing: ${horizontal})`,
    ];
  }

  const top = numberToFixedString(padding.top);
  const left = numberToFixedString(padding.left);
  const bottom = numberToFixedString(padding.bottom);
  const right = numberToFixedString(padding.right);
  return [
    "padding",
    `EdgeInsets(top: ${top}, leading: ${left}, bottom: ${bottom}, trailing: ${right})`,
  ];
};
