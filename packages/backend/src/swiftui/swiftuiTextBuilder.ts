import { sliceNum } from "../common/numToAutoFixed";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { SwiftuiDefaultBuilder } from "./swiftuiDefaultBuilder";
import { swiftuiWeightMatcher } from "./builderImpl/swiftuiTextWeight";
import { swiftuiSize } from "./builderImpl/swiftuiSize";
import { globalTextStyleSegments } from "../altNodes/altConversion";
import { SwiftUIElement } from "./builderImpl/swiftuiParser";
import { parseTextAsCode } from "../flutter/flutterTextBuilder";
import { swiftuiSolidColor } from "./builderImpl/swiftuiColor";

export class SwiftuiTextBuilder extends SwiftuiDefaultBuilder {
  modifiers: string[] = [];

  constructor(kind: string = "Text") {
    super(kind);
  }

  reset(): void {
    this.modifiers = [];
  }

  textAutoSize(node: TextNode): this {
    this.modifiers.push(this.wrapTextAutoResize(node));
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
    const fillColor = swiftuiSolidColor(fills);
    if (fillColor) {
      return fillColor;
    }
    return "";
  }

  textStyle(style: string): string | null {
    // https://developer.apple.com/documentation/swiftui/text/italic()
    if (style.toLowerCase().match("italic")) {
      return "italic";
    }
    return null;
  }

  fontWeight(fontWeight: number): string {
    // for some reason this must be set before the multilineTextAlignment
    if (fontWeight !== 400) {
      const weight = swiftuiWeightMatcher(fontWeight);
      return `.weight(${weight})`;
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

    const segments = this.getTextSegments(node.id, node.characters);
    if (segments) {
      this.element = segments;
    } else {
      this.element = new SwiftUIElement("Text()");
    }

    return this;
  }

  getTextSegments(id: string, characters: string): SwiftUIElement | null {
    const segments = globalTextStyleSegments[id];
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
      segment.fontSize,
    );

    let updatedText = parseTextAsCode(characters); //segment.characters); swiftUI only supports a single text.
    if (segment.textCase === "LOWER") {
      updatedText = characters.toLowerCase();
    } else if (segment.textCase === "UPPER") {
      updatedText = characters.toUpperCase();
    }

    const element = new SwiftUIElement(
      `Text(${parseTextAsCode(`"${characters}"`)})`,
    )
      .addModifier([
        "font",
        `Font.custom("${fontFamily}", size: ${fontSize})${
          fontWeight ? `${fontWeight}` : ""
        }`,
      ])
      .addModifier(["tracking", letterSpacing])
      .addModifier(["lineSpacing", lineHeight])
      .addModifier([this.textDecoration(segment.textDecoration), ""])
      .addModifier([this.textStyle(segment.fontName.style), ""])
      .addModifier(["foregroundColor", this.textColor(segment.fills)]);

    return element;
    // });
  }

  letterSpacing = (
    letterSpacing: LetterSpacing,
    fontSize: number,
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
    const { width, height } = swiftuiSize(node);

    let comp: string[] = [];
    switch (node.textAutoResize) {
      case "WIDTH_AND_HEIGHT":
        break;
      case "HEIGHT":
        comp.push(width);
        break;
      case "NONE":
      case "TRUNCATE":
        comp.push(width, height);
        break;
    }

    if (comp.length > 0) {
      const align = this.textAlignment(node);
      return `.frame(${comp.join(", ")}${align})`;
    }

    return "";
  };

  // SwiftUI has two alignments for Text, when it is a single line and when it is multiline. This one is for single line.
  textAlignment = (node: TextNode): string => {
    let hAlign = "";
    if (node.textAlignHorizontal === "LEFT") {
      hAlign = "leading";
    } else if (node.textAlignHorizontal === "RIGHT") {
      hAlign = "trailing";
    }

    let vAlign = "";
    if (node.textAlignVertical === "TOP") {
      vAlign = "top";
    } else if (node.textAlignVertical === "BOTTOM") {
      vAlign = "bottom";
    }

    if (hAlign && !vAlign) {
      // result should be leading or trailing
      return `, alignment: .${hAlign}`;
    } else if (!hAlign && vAlign) {
      // result should be top or bottom
      return `, alignment: .${vAlign}`;
    } else if (hAlign && vAlign) {
      // make the first char from hAlign uppercase
      const hAlignUpper = hAlign.charAt(0).toUpperCase() + hAlign.slice(1);
      // result should be topLeading, topTrailing, bottomLeading or bottomTrailing
      return `, alignment: .${vAlign}${hAlignUpper}`;
    }

    // when they are centered
    return "";
  };
}
