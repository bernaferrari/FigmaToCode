import { globalTextStyleSegments } from "../altNodes/altConversion";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { tailwindColorFromFills } from "./builderImpl/tailwindColor";
import { tailwindSizePartial } from "./builderImpl/tailwindSize";
import { pxToLetterSpacing, pxToLineHeight } from "./conversionTables";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";

export class TailwindTextBuilder extends TailwindDefaultBuilder {
  getTextSegments(id: string): { style: string; text: string }[] {
    const segments = globalTextStyleSegments[id];
    if (!segments) {
      return [];
    }

    return segments.map((segment) => {
      const color = this.getTailwindColorFromFills(segment.fills);
      const textDecoration = this.textDecoration(segment.textDecoration);
      const textTransform = this.getTailwindTextTransform(segment.textCase);
      const lineHeightStyle = this.lineHeight(
        segment.lineHeight,
        segment.fontSize
      );
      const letterSpacingStyle = this.letterSpacing(
        segment.letterSpacing,
        segment.fontSize
      );
      const fontSizeStyle = this.getTailwindFontSizeStyle(segment.fontSize);
      const fontWeightStyle = this.getTailwindFontWeightStyle(
        segment.fontWeight
      );
      const textIndentStyle = this.getTailwindTextIndentStyle(
        segment.indentation
      );

      const styleClasses = [
        color,
        fontSizeStyle,
        fontWeightStyle,
        textDecoration,
        textTransform,
        lineHeightStyle,
        letterSpacingStyle,
        textIndentStyle,
      ]
        .filter((d) => d !== "")
        .join(" ");

      const charsWithLineBreak = segment.characters.split("\n").join("<br/>");
      return { style: styleClasses, text: charsWithLineBreak };
    });
  }

  getTailwindColorFromFills = (
    fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
  ) => {
    // Implement a function to convert fills to the appropriate Tailwind CSS color classes.
    // This can be based on your project's configuration and color palette.
    // For example, suppose your project uses the default Tailwind CSS color palette:
    return tailwindColorFromFills(fills, "text");
  };

  getTailwindTextTransform = (textCase: string) => {
    return textCase === "UPPER"
      ? "uppercase"
      : textCase === "LOWER"
      ? "lowercase"
      : "capitalize";
  };

  getTailwindLetterSpacingStyle = (letterSpacing: any) => {
    // Convert letterSpacing to the appropriate Tailwind CSS class.
    // This can be based on your project's configuration and letterSpacing scale.
    // For example, suppose your project uses the default Tailwind CSS letterSpacing scale:
    if (letterSpacing.unit === "PIXELS") {
      return `tracking-${letterSpacing.value}px`;
    } else {
      return `tracking-${letterSpacing.value * 100}%`;
    }
  };

  getTailwindFontSizeStyle = (fontSize: number) => {
    // Convert fontSize to the appropriate Tailwind CSS class.
    // This can be based on your project's configuration and fontSize scale.
    // For example, suppose your project uses the default Tailwind CSS fontSize scale:
    return `text-[${fontSize}px]`;
  };

  getTailwindFontWeightStyle = (fontWeight: number) => {
    // Convert fontWeight to the appropriate Tailwind CSS class.
    // This can be based on your project's configuration and fontWeight scale.
    // For example, suppose your project uses the default Tailwind CSS fontWeight scale:
    return `font-${fontWeight}`;
  };

  getTailwindTextIndentStyle = (indentation: number) => {
    // Convert indentation to the appropriate Tailwind CSS class.
    // This can be based on your project's configuration and spacing scale.
    // For example, suppose your project uses the default Tailwind CSS spacing scale:
    return `pl-${Math.round(indentation)}`;
  };

  // must be called before Position method
  textShapeSize = (node: TextNode): this => {
    const { width, height } = tailwindSizePartial(node);

    if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
      this.addAttributes(width);
    }

    if (node.textAutoResize === "NONE") {
      this.addAttributes(height);
    }

    return this;
  };

  // todo fontFamily
  //  fontFamily(node: TextNode): this {
  //    return this;
  //  }

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
  letterSpacing(letterSpacing: LetterSpacing, fontSize: number): this {
    const letterSpacingProp = commonLetterSpacing(letterSpacing, fontSize);
    if (letterSpacingProp > 0) {
      const value = pxToLetterSpacing(letterSpacingProp);
      this.addAttributes(`tracking-${value}`);
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/line-height/
   * example: leading-3
   */
  lineHeight(lineHeight: LineHeight, fontSize: number): this {
    const lineHeightProp = commonLineHeight(lineHeight, fontSize);
    if (lineHeightProp > 0) {
      const value = pxToLineHeight(lineHeightProp);
      this.addAttributes(`leading-${value}`);
    }

    return this;
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
  textTransform(node: TextNode): this {
    if (node.textCase === "LOWER") {
      this.addAttributes("lowercase");
    } else if (node.textCase === "TITLE") {
      this.addAttributes("capitalize");
    } else if (node.textCase === "UPPER") {
      this.addAttributes("uppercase");
    } else if (node.textCase === "ORIGINAL") {
      // default, ignore
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-decoration/
   * example: underline
   */
  textDecoration(textDecoration: TextDecoration): this {
    switch (textDecoration) {
      case "NONE":
        break;
      case "STRIKETHROUGH":
        this.addAttributes("line-through");
        break;
      case "UNDERLINE":
        this.addAttributes("underline");
        break;
    }
    return this;
  }

  reset(): void {
    this.attributes = [];
  }
}
