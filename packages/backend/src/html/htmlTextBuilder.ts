import { formatMultipleJSX, formatWithJSX } from "../common/parseJSX";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { globalTextStyleSegments } from "../altNodes/altConversion";
import { htmlColorFromFills } from "./builderImpl/htmlColor";

export class HtmlTextBuilder extends HtmlDefaultBuilder {
  constructor(node: TextNode, showLayerName: boolean, optIsJSX: boolean) {
    super(node, showLayerName, optIsJSX);
  }

  getTextSegments(id: string): { style: string; text: string }[] {
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
          "text-decoration": this.getTextDecoration(segment.textDecoration),
          "text-transform": this.getTextTransform(segment.textCase),
          "line-height": this.getLineHeightStyle(segment.lineHeight),
          "letter-spacing": this.getLetterSpacingStyle(
            segment.letterSpacing,
            segment.fontSize
          ),
          "text-indent": segment.indentation,
          "word-wrap": "break-word",
        },
        this.isJSX
      );

      return { style: styleAttributes, text: segment.characters };
    });
  }

  fontSize(node: TextNode, isUI = false): this {
    if (node.fontSize !== figma.mixed) {
      const value = isUI ? Math.min(node.fontSize, 24) : node.fontSize;
      this.addStyles(formatWithJSX("font-size", this.isJSX, value));
    }
    return this;
  }

  getTextDecoration = (textDecoration: string) => {
    return textDecoration === "STRIKETHROUGH"
      ? "line-through"
      : textDecoration === "UNDERLINE"
      ? "underline"
      : "none";
  };

  getTextTransform = (textCase: string) => {
    return textCase === "UPPER"
      ? "uppercase"
      : textCase === "LOWER"
      ? "lowercase"
      : "none";
  };

  getLineHeightStyle = (lineHeight: LineHeight) => {
    switch (lineHeight.unit) {
      case "AUTO":
        return "normal";
      case "PIXELS":
        return lineHeight.value;
      case "PERCENT":
        return `${lineHeight.value}%`;
    }
  };

  getLetterSpacingStyle = (letterSpacing: LetterSpacing, fontSize: number) => {
    switch (letterSpacing.unit) {
      case "PIXELS":
        return letterSpacing.value;
      case "PERCENT":
        return (fontSize * letterSpacing.value) / 100;
    }
  };

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

  textTransform(node: TextNode): this {
    if (node.textCase === "LOWER") {
      this.addStyles(formatWithJSX("text-transform", this.isJSX, "lowercase"));
    } else if (node.textCase === "TITLE") {
      this.addStyles(formatWithJSX("text-transform", this.isJSX, "capitalize"));
    } else if (node.textCase === "UPPER") {
      this.addStyles(formatWithJSX("text-transform", this.isJSX, "uppercase"));
    } else if (node.textCase === "ORIGINAL") {
      // default, ignore
    }

    return this;
  }
}
