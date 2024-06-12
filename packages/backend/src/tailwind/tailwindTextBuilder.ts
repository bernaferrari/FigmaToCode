import { globalTextStyleSegments } from "../altNodes/altConversion";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { tailwindSolidColor } from "./builderImpl/tailwindColor.js";
import {
  pxToFontSize,
  pxToLetterSpacing,
  pxToLineHeight,
} from "./conversionTables";
import { TailwindDefaultBuilder, nodePaintFromFills, nodePaintStyleForFigNode } from "./tailwindDefaultBuilder";

export class TailwindTextBuilder extends TailwindDefaultBuilder {
  async getTextSegments(id: string): Promise<{ style: string; text: string; }[]> {
    const segments = globalTextStyleSegments[id];
    if (!segments) {
      return [];
    }

    return await Promise.all(segments.map(async (segment) => {
      const color = await this.getTailwindColorFromSegment(segment);
      const textDecoration = this.textDecoration(segment.textDecoration);
      const textTransform = this.textTransform(segment.textCase);
      const lineHeightStyle = this.lineHeight(
        segment.lineHeight,
        segment.fontSize
      );
      const letterSpacingStyle = this.letterSpacing(
        segment.letterSpacing,
        segment.fontSize
      );
      // const textIndentStyle = this.indentStyle(segment.indentation);

      const styleClasses = [
        color,
        this.fontSize(segment.fontSize),
        this.fontWeight(segment.fontWeight),
        this.fontFamily(segment.fontName),
        textDecoration,
        textTransform,
        lineHeightStyle,
        letterSpacingStyle,
        // textIndentStyle,
      ]
        .filter((d) => d !== "")
        .join(" ");

      const charsWithLineBreak = segment.characters.split("\n").join("<br/>");
      return { style: styleClasses, text: charsWithLineBreak };
    }));
  }

  getTailwindColorFromSegment = async(
    segment: StyledTextSegment
  ) => {
    // Implement a function to convert fills to the appropriate Tailwind CSS color classes.
    // This can be based on your project's configuration and color palette.
    // For example, suppose your project uses the default Tailwind CSS color palette:
    const paint = await nodePaintStyleForFigNode(segment)
    return  paint?.solid ? tailwindSolidColor(paint, paint.opacity ?? 1, "text") : "";
  };

  fontSize = (fontSize: number) => {
    return `text-${pxToFontSize(fontSize)}`;
  };

  fontWeight = (fontWeight: number): string => {
    switch (fontWeight) {
      case 100:
        return "font-thin";
      case 200:
        return "font-extralight";
      case 300:
        return "font-light";
      case 400:
        return "font-normal";
      case 500:
        return "font-medium";
      case 600:
        return "font-semibold";
      case 700:
        return "font-bold";
      case 800:
        return "font-extrabold";
      case 900:
        return "font-black";
      default:
        return "";
    }
  };

  indentStyle = (indentation: number) => {
    // Convert indentation to the appropriate Tailwind CSS class.
    // This can be based on your project's configuration and spacing scale.
    // For example, suppose your project uses the default Tailwind CSS spacing scale:
    return `pl-${Math.round(indentation)}`;
  };

  fontFamily = (fontName: FontName): string => {
    return "font-['" + fontName.family + "']";
  };

  /**
   * https://tailwindcss.com/docs/font-size/
   * example: text-md
   */
  // fontSize(fontSize: number): this {
  //   // example: text-md
  //   const value = pxToFontSize(fontSize);
  //   this.addAttributes(`text-${value}`);
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
        this.addAttributes("italic");
      }

      if (lowercaseStyle.match("regular")) {
        // ignore the font-style when regular (default)
        return this;
      }

      const value = node.fontName.style
        .replace("italic", "")
        .replace(" ", "")
        .toLowerCase();

      this.addAttributes(`font-${value}`);
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/letter-spacing/
   * example: tracking-widest
   */
  letterSpacing(letterSpacing: LetterSpacing, fontSize: number): string {
    const letterSpacingProp = commonLetterSpacing(letterSpacing, fontSize);
    if (letterSpacingProp > 0) {
      const value = pxToLetterSpacing(letterSpacingProp);
      return `tracking-${value}`;
    }

    return "";
  }

  /**
   * https://tailwindcss.com/docs/line-height/
   * example: leading-3
   */
  lineHeight(lineHeight: LineHeight, fontSize: number): string {
    const lineHeightProp = commonLineHeight(lineHeight, fontSize);
    if (lineHeightProp > 0) {
      const value = pxToLineHeight(lineHeightProp);
      return `leading-${value}`;
    }

    return "";
  }

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
          this.addAttributes(`text-center`);
          break;
        case "RIGHT":
          this.addAttributes(`text-right`);
          break;
        case "JUSTIFIED":
          this.addAttributes(`text-justify`);
          break;
        default:
          break;
      }
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-transform/
   * example: uppercase
   */
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

  /**
   * https://tailwindcss.com/docs/text-decoration/
   * example: underline
   */
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

  reset(): void {
    this.attributes = [];
  }
}
