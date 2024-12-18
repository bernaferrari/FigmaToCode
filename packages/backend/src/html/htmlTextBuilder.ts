import { formatMultipleJSX, formatWithJSX } from "../common/parseJSX";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { globalTextStyleSegments } from "../altNodes/altConversion";
import { htmlColorFromFills } from "./builderImpl/htmlColor";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";

export class HtmlTextBuilder extends HtmlDefaultBuilder {
  constructor(node: TextNode, showLayerNames: boolean, optIsJSX: boolean) {
    super(node, showLayerNames, optIsJSX);
  }

  getTextSegments(
    id: string,
  ): {
    style: string;
    text: string;
    openTypeFeatures: { [key: string]: boolean };
  }[] {
    const segments = globalTextStyleSegments[id];
    if (!segments) {
      return [];
    }

    return segments.map((segment) => {
      const styleAttributes = formatMultipleJSX(
        {
          color: htmlColorFromFills(segment.fills),
          "font-size": segment.fontSize,
          "font-family": segment.fontName.family,
          "font-style": this.getFontStyle(segment.fontName.style),
          "font-weight": `${segment.fontWeight}`,
          "text-decoration": this.textDecoration(segment.textDecoration),
          "text-transform": this.textTransform(segment.textCase),
          "line-height": this.lineHeight(segment.lineHeight, segment.fontSize),
          "letter-spacing": this.letterSpacing(
            segment.letterSpacing,
            segment.fontSize,
          ),
          // "text-indent": segment.indentation,
          "word-wrap": "break-word",
        },
        this.isJSX,
      );

      const charsWithLineBreak = segment.characters.split("\n").join("<br/>");
      return {
        style: styleAttributes,
        text: charsWithLineBreak,
        openTypeFeatures: segment.openTypeFeatures,
      };
    });
  }

  fontSize(node: TextNode, isUI = false): this {
    if (node.fontSize !== figma.mixed) {
      const value = isUI ? Math.min(node.fontSize, 24) : node.fontSize;
      this.addStyles(formatWithJSX("font-size", this.isJSX, value));
    }
    return this;
  }

  textDecoration(textDecoration: TextDecoration): string {
    switch (textDecoration) {
      case "STRIKETHROUGH":
        return "line-through";
      case "UNDERLINE":
        return "underline";
      case "NONE":
        return "";
    }
  }

  textTransform(textCase: TextCase): string {
    switch (textCase) {
      case "UPPER":
        return "uppercase";
      case "LOWER":
        return "lowercase";
      case "TITLE":
        return "capitalize";
      case "ORIGINAL":
      case "SMALL_CAPS":
      case "SMALL_CAPS_FORCED":
      default:
        return "";
    }
  }

  letterSpacing(letterSpacing: LetterSpacing, fontSize: number): number | null {
    const letterSpacingProp = commonLetterSpacing(letterSpacing, fontSize);
    if (letterSpacingProp > 0) {
      return letterSpacingProp;
    }
    return null;
  }

  lineHeight(lineHeight: LineHeight, fontSize: number): number | null {
    const lineHeightProp = commonLineHeight(lineHeight, fontSize);
    if (lineHeightProp > 0) {
      return lineHeightProp;
    }
    return null;
  }

  /**
   * https://tailwindcss.com/docs/font-style/
   * example: font-extrabold
   * example: italic
   */
  getFontStyle(style: string): string {
    if (style.toLowerCase().match("italic")) {
      return "italic";
    }
    return "";
  }

  textAlign(node: TextNode): this {
    // if alignHorizontal is LEFT, don't do anything because that is native

    // only undefined in testing
    if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
      // todo when node.textAutoResize === "WIDTH_AND_HEIGHT" and there is no \n in the text, this can be ignored.
      let textAlign = "";
      switch (node.textAlignHorizontal) {
        case "CENTER":
          textAlign = "center";
          break;
        case "RIGHT":
          textAlign = "right";
          break;
        case "JUSTIFIED":
          textAlign = "justify";
          break;
      }
      this.addStyles(formatWithJSX("text-align", this.isJSX, textAlign));
    }
    return this;
  }
}
