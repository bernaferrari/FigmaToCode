import {
  generateWidgetCode,
  skipDefaultProperty,
  sliceNum,
} from "./../common/numToAutoFixed";
import { FlutterDefaultBuilder } from "./flutterDefaultBuilder";
import { flutterColorFromFills } from "./builderImpl/flutterColor";
import { flutterSize } from "./builderImpl/flutterSize";
import { globalTextStyleSegments } from "../altNodes/altConversion";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";

export class FlutterTextBuilder extends FlutterDefaultBuilder {
  constructor(optChild: string = "") {
    super(optChild);
  }

  reset(): void {
    this.child = "";
  }

  createText(node: TextNode): this {
    let alignHorizontal =
      node.textAlignHorizontal?.toString()?.toLowerCase() ?? "left";
    alignHorizontal =
      alignHorizontal === "justified" ? "justify" : alignHorizontal;

    const basicTextStyle = {
      textAlign:
        alignHorizontal !== "left" ? `TextAlign.${alignHorizontal}` : "",
    };

    const segments = this.getTextSegments(node.id);
    if (segments.length === 1) {
      this.child = generateWidgetCode(
        "Text",
        {
          ...basicTextStyle,
          style: segments[0].style,
        },
        [`'${segments[0].text}'`]
      );
    } else {
      this.child = generateWidgetCode("Text.rich", basicTextStyle, [
        generateWidgetCode("TextSpan", {
          children: segments.map((segment) =>
            generateWidgetCode("TextSpan", {
              text: `'${segment.text}'`,
              style: segment.style,
            })
          ),
        }),
      ]);
    }

    return this;
  }

  getTextSegments(id: string): { style: string; text: string }[] {
    const segments = globalTextStyleSegments[id];
    if (!segments) {
      return [];
    }

    return segments.map((segment) => {
      const color = flutterColorFromFills(segment.fills);

      const fontSize = `${sliceNum(segment.fontSize)}`;
      const fontStyle = this.fontStyle(segment.fontName);
      const fontFamily = `'${segment.fontName.family}'`;
      const fontWeight = `FontWeight.w${segment.fontWeight}`;
      const lineHeight = this.lineHeight(segment.lineHeight, segment.fontSize);
      const letterSpacing = this.letterSpacing(
        segment.letterSpacing,
        segment.fontSize
      );

      const style = generateWidgetCode("TextStyle", {
        color: color,
        fontSize: fontSize,
        fontStyle: fontStyle,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        textDecoration: skipDefaultProperty(
          this.getFlutterTextDecoration(segment.textDecoration),
          "TextDecoration.none"
        ),
        // textTransform: textTransform,
        height: lineHeight/fontSize,
        letterSpacing: letterSpacing,
      });

      let text = segment.characters;
      if (segment.textCase === "LOWER") {
        text = text.toLowerCase();
      } else if (segment.textCase === "UPPER") {
        text = text.toUpperCase();
      }

      return {
        style: style,
        text: parseTextAsCode(text).replace(/\$/g, "\\$"),
      };
    });
  }

  getFlutterTextDecoration(decoration: TextDecoration): string {
    switch (decoration) {
      case "UNDERLINE":
        return "TextDecoration.underline";
      case "STRIKETHROUGH":
        return "TextDecoration.lineThrough";
      default:
        return "TextDecoration.none";
    }
  }

  lineHeight(lineHeight: LineHeight, fontSize: number): string {
    switch (lineHeight.unit) {
      case "AUTO":
        return "";
      case "PIXELS":
        return sliceNum(lineHeight.value / fontSize);
      case "PERCENT":
        return sliceNum(lineHeight.value / 100);
    }
  }

  letterSpacing(letterSpacing: LetterSpacing, fontSize: number): string {
    const value = commonLetterSpacing(letterSpacing, fontSize);
    if (value) {
      return sliceNum(value);
    }
    return "";
  }

  textAutoSize(node: TextNode): this {
    this.child = wrapTextAutoResize(node, this.child);
    return this;
  }

  fontStyle = (fontName: FontName): string => {
    const lowercaseStyle = fontName.style.toLowerCase();
    if (lowercaseStyle.match("italic")) {
      return "FontStyle.italic";
    }
    return "";
  };
}

export const wrapTextAutoResize = (node: TextNode, child: string): string => {
  const { width, height, isExpanded } = flutterSize(node);
  let result = "";

  switch (node.textAutoResize) {
    case "WIDTH_AND_HEIGHT":
      break;
    case "HEIGHT":
      result = generateWidgetCode("SizedBox", {
        width: width,
        child: child,
      });
      break;
    case "NONE":
    case "TRUNCATE":
      result = generateWidgetCode("SizedBox", {
        width: width,
        height: height,
        child: child,
      });
      break;
  }

  if (isExpanded) {
    return generateWidgetCode("Expanded", {
      child: result,
    });
  } else if (result.length > 0) {
    return result;
  }

  return child;
};

export const parseTextAsCode = (originalText: string) =>
  originalText.replace(/\n/g, "\\n");
