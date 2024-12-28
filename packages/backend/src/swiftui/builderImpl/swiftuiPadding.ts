import { sliceNum } from "../../common/numToAutoFixed";
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
    return ["padding", sliceNum(padding.all)];
  }

  if ("horizontal" in padding) {
    const vertical = sliceNum(padding.vertical);
    const horizontal = sliceNum(padding.horizontal);
    return [
      "padding",
      `EdgeInsets(top: ${vertical}, leading: ${horizontal}, bottom: ${vertical}, trailing: ${horizontal})`,
    ];
  }

  const top = sliceNum(padding.top);
  const left = sliceNum(padding.left);
  const bottom = sliceNum(padding.bottom);
  const right = sliceNum(padding.right);
  return [
    "padding",
    `EdgeInsets(top: ${top}, leading: ${left}, bottom: ${bottom}, trailing: ${right})`,
  ];
};
