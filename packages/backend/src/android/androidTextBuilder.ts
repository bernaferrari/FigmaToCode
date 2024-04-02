import { sliceNum } from "../common/numToAutoFixed";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { androidDefaultBuilder, resourceLowerCaseName } from "./androidDefaultBuilder";
import { androidSize } from "./builderImpl/androidSize";
import { globalTextStyleSegments } from "../altNodes/altConversion";
import { androidElement } from "./builderImpl/androidParser";
import { parseTextAsCode } from "../flutter/flutterTextBuilder";
import { androidSolidColor } from "./builderImpl/androidColor";

export class androidTextBuilder extends androidDefaultBuilder {
  modifiers: string[] = [];

  constructor(kind: string = "TextView") {
    super(kind);
  }

  reset(): void {
    this.modifiers = [];
  }

  textAutoSize(node: TextNode): this {
    this.pushModifier(["android:textAlignment", this.wrapTextAutoResize(node)])
    return this;
  }

  textDecoration(textDecoration: TextDecoration): string | null {
    switch (textDecoration) {
      case "UNDERLINE":
        // https://developer.apple.com/documentation/swiftui/text/underline(_:color:)
        return "underline";
      case "STRIKETHROUGH":
        // https://developer.apple.com/documentation/swiftui/text/strikethrough(_:color:)
        return "strikethrough";
      case "NONE":
        return null;
    }
  }

  textColor(fills: Paint[]): string {
    const fillColor = androidSolidColor(fills);
    if (fillColor) {
      return fillColor;
    }
    return "";
  }

  textStyle(style: string): string | null {
    // https://developer.apple.com/documentation/android/text/italic()
    if (style.toLowerCase().match("italic")) {
      return "italic";
    }
    return null;
  }

  fontWeight(fontWeight: number): string {
    // for some reason this must be set before the multilineTextAlignment
    if (fontWeight !== 400) {
      return `${fontWeight}`;
    }
    return "";
  }

  textStyle2 = (node: TextNode): this => {
    // todo might be a good idea to calculate the width based on the font size and check if view is really multi-line
    if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
      // it can be confusing, but multilineTextAlignment is always set to left by default.
      if (node.textAlignHorizontal === "CENTER") {
        this.modifiers.push(".multilineTextAlignment(.center)");
      } else if (node.textAlignHorizontal === "RIGHT") {
        this.modifiers.push(".multilineTextAlignment(.trailing)");
      }
    }

    return this;
  };

  createText(node: TextNode): this {
    let alignHorizontal =
      node.textAlignHorizontal?.toString()?.toLowerCase() ?? "left";
    alignHorizontal =
      alignHorizontal === "justified" ? "justify" : alignHorizontal;

    // const basicTextStyle = {
    //   textAlign:
    //     alignHorizontal !== "left" ? `TextAlign.${alignHorizontal}` : "",
    // };

    const segments = this.getTextSegments(node);
    if (segments) {
      this.element = segments;
    } else {
      this.element = new androidElement("TextView");
    }

    return this;
  }

  getTextSegments(node: TextNode): androidElement | null {
    const segments = globalTextStyleSegments[node.id];
    if (!segments) {
      return null;
    }

    const segment = segments[0];

    // return segments.map((segment) => {
    const fontSize = sliceNum(segment.fontSize);
    const fontFamily = segment.fontName.family;
    const fontWeight = this.fontWeight(segment.fontWeight);
    const lineHeight = this.lineHeight(segment.lineHeight, segment.fontSize);
    const letterSpacing = this.letterSpacing(
      segment.letterSpacing,
      segment.fontSize
    );

    let updatedText = parseTextAsCode(node.characters);
    if (segment.textCase === "LOWER") {
      updatedText = node.characters.toLowerCase();
    } else if (segment.textCase === "UPPER") {
      updatedText = node.characters.toUpperCase();
    }

    const element = new androidElement("TextView")
      .addModifier(["android:letterSpacing", letterSpacing])
      .addModifier(["android:lineSpacingExtra", lineHeight ? `${lineHeight}px` : null])
      .addModifier(["android:textStyle",this.textDecoration(segment.textDecoration)])
      .addModifier(["android:typeface",this.textStyle(segment.fontName.style)])
      .addModifier(["android:textColor", this.textColor(segment.fills)])
      .addModifier(["android:textAppearance", `@style/text_${segment.fontSize}_${segment.fontWeight}`]);

      // .addModifier(["android:textSize",`${fontSize}sp`])
      // .addModifier(["android:textFontWeight",fontWeight])
      // .addModifier(["android:fontFamily",`@font/${resourceFontName(fontFamily)}`])
      // .addModifier(["android:includeFontPadding","false"])

      if (node.name !== "text_variable") {
        element.addModifier(["android:text", `@string/${node.name}`])
      }

    return element;
    // });
  }

  letterSpacing = (
    letterSpacing: LetterSpacing,
    fontSize: number
  ): string | null => {
    const value = commonLetterSpacing(letterSpacing, fontSize);
    if (value > 0) {
      return sliceNum(value);
    }
    return null;
  };

  // the difference between kerning and tracking is that tracking spaces everything, kerning keeps lignatures,
  // Figma spaces everything, so we are going to use tracking.
  lineHeight = (lineHeight: LineHeight, fontSize: number): string | null => {
    const value = commonLineHeight(lineHeight, fontSize);
    if (value > 0) {
      return sliceNum(value);
    }
    return null;
  };

  wrapTextAutoResize = (node: TextNode): string => {
    const { width } = androidSize(node,false);

    let comp: string[] = [];
    switch (node.textAutoResize) {
      case "HEIGHT":
        comp.push(width);
        break;
      default:
        break;
    }

    if (comp.length > 0) {
      return this.textAlignment(node);
    }

    return "";
  };

  textAlignment = (node: TextNode): string => {
    let hAlign = "";
    switch (node.textAlignHorizontal) {
      case "LEFT":
        hAlign = "textStart"
      case "RIGHT":
        hAlign = "textEnd"
      default:
        hAlign = "center"
    }

    // when they are centered
    return hAlign;
  };
}
