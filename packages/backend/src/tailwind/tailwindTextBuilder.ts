import { globalTextStyleSegments } from "../altNodes/altConversion";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { tailwindColorFromFills } from "./builderImpl/tailwindColor";
import { tailwindSizePartial } from "./builderImpl/tailwindSize";
import {
  pxToLetterSpacing,
  pxToLineHeight,
  pxToFontSize,
} from "./conversionTables";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";

export class TailwindTextBuilder extends TailwindDefaultBuilder {
  // constructor(node: TextNode, showLayerName: boolean, optIsJSX: boolean) {
  //   super(node, showLayerName, optIsJSX);
  // }
  getTextSegments(id: string): { style: string; text: string }[] {
    const segments = globalTextStyleSegments[id];
    if (!segments) {
      return [];
    }

    return segments.map((segment) => {
      const color = this.getTailwindColorFromFills(segment.fills);
      const textDecoration = this.getTailwindTextDecoration(
        segment.textDecoration
      );
      const textTransform = this.getTailwindTextTransform(segment.textCase);
      const lineHeightStyle = this.getTailwindLineHeightStyle(
        segment.lineHeight
      );
      const letterSpacingStyle = this.getTailwindLetterSpacingStyle(
        segment.letterSpacing
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

      return { style: styleClasses, text: segment.characters };
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

  getTailwindTextDecoration = (textDecoration: string) => {
    return textDecoration === "STRIKETHROUGH"
      ? "line-through"
      : textDecoration === "UNDERLINE"
      ? "underline"
      : "no-underline";
  };

  getTailwindTextTransform = (textCase: string) => {
    return textCase === "UPPER"
      ? "uppercase"
      : textCase === "LOWER"
      ? "lowercase"
      : "capitalize";
  };

  getTailwindLineHeightStyle = (lineHeight: any) => {
    // Convert lineHeight to the appropriate Tailwind CSS class.
    // This can be based on your project's configuration and lineHeight scale.
    // For example, suppose your project uses the default Tailwind CSS lineHeight scale:
    if (lineHeight.unit === "AUTO") {
      return "leading-normal";
    } else if (lineHeight.unit === "PIXELS") {
      return `leading-${lineHeight.value}px`;
    } else if (lineHeight.unit === "PERCENT") {
      return `leading-${lineHeight.value}%`;
    }
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
  fontSize(node: TextNode): this {
    // example: text-md
    if (node.fontSize !== figma.mixed) {
      const value = pxToFontSize(node.fontSize);
      this.addAttributes(`text-${value}`);
    }

    return this;
  }

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
  letterSpacing(node: TextNode): this {
    const letterSpacing = commonLetterSpacing(node);
    if (letterSpacing > 0) {
      const value = pxToLetterSpacing(letterSpacing);
      this.addAttributes(`tracking-${value}`);
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/line-height/
   * example: leading-3
   */
  lineHeight(node: TextNode): this {
    const lineHeight = commonLineHeight(node);
    if (lineHeight > 0) {
      const value = pxToLineHeight(lineHeight);
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
  textDecoration(node: TextNode): this {
    if (node.textDecoration === "UNDERLINE") {
      this.addAttributes("underline");
    } else if (node.textDecoration === "STRIKETHROUGH") {
      this.addAttributes("line-through");
    }

    return this;
  }

  reset(): void {
    this.attributes = [];
  }
}
