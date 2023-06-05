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

    const textAlign =
      alignHorizontal !== "left"
        ? `\ntextAlign: TextAlign.${alignHorizontal},`
        : "";

    const segments = this.getTextSegments(node.id);

    const basicTextStyle = {
      textAlign: textAlign,
    };

    if (segments.length === 1) {
      this.child = generateWidgetCode(
        "Text",
        {
          ...basicTextStyle,
          style: segments[0].style,
        },
        [`'${parseTextAsCode(segments[0].text)}'`]
      );
    } else {
      this.child = generateWidgetCode("Text.rich", basicTextStyle, [
        generateWidgetCode("TextSpan", {
          children: segments.map((segment) =>
            generateWidgetCode("TextSpan", {
              text: `'${parseTextAsCode(segment.text)}'`,
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
      const lineHeight = this.getFlutterLineHeightStyle(
        segment.lineHeight,
        segment.fontSize
      );
      const letterSpacing = this.getFlutterLetterSpacingStyle(
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
        height: lineHeight,
        letterSpacing: letterSpacing,
      });

      let text = segment.characters;
      if (segment.textCase === "LOWER") {
        text = text.toLowerCase();
      } else if (segment.textCase === "UPPER") {
        text = text.toUpperCase();
      }

      return { style: style, text: text };
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

  getFlutterLineHeightStyle(lineHeight: LineHeight, fontSize: number): string {
    const commonSize = commonLineHeight(lineHeight, fontSize);
    if (commonSize) {
      return sliceNum(commonSize);
    }
    return "";
  }

  getFlutterLetterSpacingStyle(
    letterSpacing: LetterSpacing,
    fontSize: number
  ): string {
    const commonSize = commonLetterSpacing(letterSpacing, fontSize);
    if (commonSize) {
      return sliceNum(commonSize);
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
  const fSize = flutterSize(node);
  const width = fSize.width;
  const height = fSize.height;
  const isExpanded = fSize.isExpanded;
  let result = "";

  if (node.textAutoResize === "NONE") {
    // = instead of += because we want to replace it

    result = generateWidgetCode("SizedBox", {
      width: width,
      height: height,
      child: child,
    });
  } else if (node.textAutoResize === "HEIGHT") {
    // if HEIGHT is set, it means HEIGHT will be calculated automatically, but width won't
    // = instead of += because we want to replace it

    result = generateWidgetCode("SizedBox", {
      width: width,
      child: child,
    });
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

export const parseTextAsCode = (phrase: string) =>
  phrase.replace(/\\\\/g, "\\\\\\\\");
