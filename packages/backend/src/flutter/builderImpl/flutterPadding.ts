import {
  generateWidgetCode,
  skipDefaultProperty,
  numberToFixedString,
} from "../../common/numToAutoFixed";
import { commonPadding } from "../../common/commonPadding";

// This must happen before Stack or after the Positioned, but not before.
export const flutterPadding = (node: InferredAutoLayoutResult): string => {
  if (!("layoutMode" in node)) {
    return "";
  }

  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    return skipDefaultProperty(
      `const EdgeInsets.all(${numberToFixedString(padding.all)})`,
      "const EdgeInsets.all(0)",
    );
  }

  if ("horizontal" in padding) {
    return generateWidgetCode("const EdgeInsets.symmetric", {
      horizontal: skipDefaultProperty(
        numberToFixedString(padding.horizontal),
        "0",
      ),
      vertical: skipDefaultProperty(numberToFixedString(padding.vertical), "0"),
    });
  }

  return generateWidgetCode("const EdgeInsets.only", {
    top: skipDefaultProperty(numberToFixedString(padding.top), "0"),
    left: skipDefaultProperty(numberToFixedString(padding.left), "0"),
    right: skipDefaultProperty(numberToFixedString(padding.right), "0"),
    bottom: skipDefaultProperty(numberToFixedString(padding.bottom), "0"),
  });
};
