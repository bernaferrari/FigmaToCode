import {
  generateWidgetCode,
  skipDefaultProperty,
  sliceNum,
} from "../../common/numToAutoFixed";
import { commonPadding } from "../../common/commonPadding";

// This must happen before Stack or after the Positioned, but not before.
export const flutterPadding = (node: SceneNode): string => {
  if (!("layoutMode" in node)) {
    return "";
  }

  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    if (padding.all === 0) {
      return "";
    }
    return `const EdgeInsets.all(${sliceNum(padding.all)})`;
  }

  if ("horizontal" in padding) {
    return generateWidgetCode("const EdgeInsets.symmetric", {
      horizontal: skipDefaultProperty(sliceNum(padding.horizontal), "0"),
      vertical: skipDefaultProperty(sliceNum(padding.vertical), "0"),
    });
  }

  return generateWidgetCode("const EdgeInsets.only", {
    top: skipDefaultProperty(sliceNum(padding.top), "0"),
    left: skipDefaultProperty(sliceNum(padding.left), "0"),
    right: skipDefaultProperty(sliceNum(padding.right), "0"),
    bottom: skipDefaultProperty(sliceNum(padding.bottom), "0"),
  });
};
