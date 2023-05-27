import { formatWithJSX } from "../common/parseJSX";
import { convertFontWeight } from "../common/convertFontWeight";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { globalTextStyleSegments } from "../altNodes/altConversion";
import { htmlColorFromFills } from "./builderImpl/htmlColor";
import { htmlSizePartial } from "./builderImpl/htmlSize";

export class HtmlTextBuilder extends HtmlDefaultBuilder {
  constructor(node: TextNode, showLayerName: boolean, optIsJSX: boolean) {
    super(node, showLayerName, optIsJSX);
  }

  getCommonStyles(segment: StyledTextSegment) {
    const color = htmlColorFromFills(segment.fills);
    const textDecoration = this.getTextDecoration(segment.textDecoration);
    const textTransform = this.getTextTransform(segment.textCase);
    const lineHeightStyle = this.getLineHeightStyle(segment.lineHeight);
    const letterSpacingStyle = this.getLetterSpacingStyle(
      segment.letterSpacing
    );

    return [
      `color: ${color}`,
      `font-size: ${segment.fontSize}px`,
      `font-family: ${segment.fontName.family}`,
      `font-style: ${segment.fontName.style}`,
      `font-weight: ${segment.fontWeight}`,
      `text-decoration: ${textDecoration}`,
      `text-transform: ${textTransform}`,
      `word-wrap: break-word`,
      lineHeightStyle,
      letterSpacingStyle,
    ].join("; ");
  }

  getTextSegments(id: string): { style: string; text: string }[] {
    const segments = globalTextStyleSegments[id];
    if (!segments) {
      return [];
    }

    const firstSegment = segments[0];

    return segments.map((segment) => {
      const color = htmlColorFromFills(segment.fills);
      const textDecoration = this.getTextDecoration(segment.textDecoration);
      const textTransform = this.getTextTransform(segment.textCase);
      const lineHeightStyle = this.getLineHeightStyle(segment.lineHeight);
      const letterSpacingStyle = this.getLetterSpacingStyle(
        segment.letterSpacing
      );

      const styleAttributes = [
        `color: ${color}`,
        `font-size: ${segment.fontSize}px`,
        `font-family: ${segment.fontName.family}`,
        `font-style: ${segment.fontName.style}`,
        `font-weight: ${segment.fontWeight}`,
        `text-decoration: ${textDecoration}`,
        `text-transform: ${textTransform}`,
        `word-wrap: break-word`,
        lineHeightStyle,
        letterSpacingStyle,
        `text-indent: ${segment.indentation}`,
      ].join("; ");

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

  getLineHeightStyle = (lineHeight: any) => {
    if (lineHeight.unit === "AUTO") {
      return "line-height: normal";
    } else if (lineHeight.unit === "PIXELS") {
      return `line-height: ${lineHeight.value}px`;
    } else if (lineHeight.unit === "PERCENT") {
      return `line-height: ${lineHeight.value}%`;
    }
  };

  getLetterSpacingStyle = (letterSpacing: any) => {
    return letterSpacing.unit === "PIXELS"
      ? `letter-spacing: ${letterSpacing.value}px`
      : `letter-spacing: ${letterSpacing.value * 100}%`;
  };

  /**
   * https://tailwindcss.com/docs/font-size/
   * example: text-md
   */
  // fontSize(node: TextNode, isUI = false): this {
  //   // example: text-md
  //   if (node.fontSize !== figma.mixed) {
  //     // special limit when used in UI.
  //     const value = isUI ? Math.min(node.fontSize, 24) : node.fontSize;

  //     this.addStyles(formatWithJSX("font-size", this.isJSX, value));
  //   }

  //   return this;
  // }

  /**
   * https://tailwindcss.com/docs/font-style/
   * example: font-extrabold
   * example: italic
   */
  fontStyle(node: TextNode): this {
    if (node.fontName !== figma.mixed) {
      const lowercaseStyle = node.fontName.style.toLowerCase();

      if (lowercaseStyle.match("italic")) {
        this.addStyles(formatWithJSX("font-style", this.isJSX, "italic"));
      }

      if (lowercaseStyle.match("regular")) {
        // ignore the font-style when regular (default)
        return this;
      }

      const value = node.fontName.style
        .replace("italic", "")
        .replace(" ", "")
        .toLowerCase();

      const weight = convertFontWeight(value);

      if (weight !== null && weight !== "400") {
        this.addStyles(formatWithJSX("font-weight", this.isJSX, weight));
      }
    }
    return this;
  }

  // /**
  //  * https://tailwindcss.com/docs/letter-spacing/
  //  * example: tracking-widest
  //  */
  // letterSpacing(node: TextNode): this {
  //   const letterSpacing = commonLetterSpacing(node);
  //   if (letterSpacing > 0) {
  //     this.addStyles(
  //       formatWithJSX("letter-spacing", this.isJSX, letterSpacing)
  //     );
  //   }

  //   return this;
  // }

  // /**
  //  * Since Figma is built on top of HTML + CSS, lineHeight properties are easy to map.
  //  */
  // lineHeight(node: TextNode): this {
  //   if (node.lineHeight !== figma.mixed) {
  //     switch (node.lineHeight.unit) {
  //       case "AUTO":
  //         this.addStyles(formatWithJSX("line-height", this.isJSX, "100%"));
  //         break;
  //       case "PERCENT":
  //         this.addStyles(
  //           formatWithJSX(
  //             "line-height",
  //             this.isJSX,
  //             `${sliceNum(node.lineHeight.value)}%`
  //           )
  //         );
  //         break;
  //       case "PIXELS":
  //         this.addStyles(
  //           formatWithJSX("line-height", this.isJSX, node.lineHeight.value)
  //         );
  //         break;
  //     }
  //   }

  //   return this;
  // }

  /**
   * https://tailwindcss.com/docs/text-align/
   * example: text-justify
   */
  textAlign(node: TextNode): this {
    // if alignHorizontal is LEFT, don't do anything because that is native

    // only undefined in testing
    if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
      // todo when node.textAutoResize === "WIDTH_AND_HEIGHT" and there is no \n in the text, this can be ignored.
      switch (node.textAlignHorizontal) {
        case "CENTER":
          this.addStyles(formatWithJSX("text-align", this.isJSX, "center"));
          break;
        case "RIGHT":
          this.addStyles(formatWithJSX("text-align", this.isJSX, "right"));
          break;
        case "JUSTIFIED":
          this.addStyles(formatWithJSX("text-align", this.isJSX, "justify"));
          break;
      }
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-transform/
   * example: uppercase
   */
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

  /**
   * https://tailwindcss.com/docs/text-decoration/
   * example: underline
   */
  // textDecoration(node: TextNode): this {
  //   if (node.textDecoration === "UNDERLINE") {
  //     this.addStyles(formatWithJSX("text-decoration", this.isJSX, "underline"));
  //   } else if (node.textDecoration === "STRIKETHROUGH") {
  //     this.addStyles(
  //       formatWithJSX("text-decoration", this.isJSX, "line-through")
  //     );
  //   }

  //   return this;
  // }

  textShapeSize = (node: TextNode, isJsx: boolean): this => {
    const { width, height } = htmlSizePartial(node, isJsx);

    if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
      this.addStyles(width);
    }

    if (node.textAutoResize === "NONE") {
      this.addStyles(height);
    }

    return this;
  };
}
