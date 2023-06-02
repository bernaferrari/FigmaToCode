import { sliceNum } from "../../common/numToAutoFixed";
import { commonPadding } from "../../common/commonPadding";

// This must happen before Stack or after the Positioned, but not before.
export const swiftuiPadding = (
  node: inferredAutoLayoutResult,
  optimizeLayout: boolean
): string => {
  if (!("layoutMode" in node)) {
    return "";
  }

  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    return `.padding(${sliceNum(padding.all)})`;
  }

  // horizontal and vertical, as the default AutoLayout
  if ("horizontal" in padding) {
    const vertical = sliceNum(padding.vertical);
    const horizontal = sliceNum(padding.horizontal);
    return `.padding(EdgeInsets(top: ${vertical}, leading: ${horizontal}, bottom: ${vertical}, trailing: ${horizontal}))`;
  }

  const top = sliceNum(padding.top);
  const left = sliceNum(padding.left);
  const bottom = sliceNum(padding.bottom);
  const right = sliceNum(padding.right);
  return `.padding(EdgeInsets(top: ${top}, leading: ${left}, bottom: ${bottom}, trailing: ${right}))`;
};
