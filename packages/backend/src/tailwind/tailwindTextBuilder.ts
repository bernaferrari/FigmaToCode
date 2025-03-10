import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { tailwindColorFromFills } from "./builderImpl/tailwindColor";
import {
  pxToFontSize,
  pxToLetterSpacing,
  pxToLineHeight,
  pxToBlur,
} from "./conversionTables";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";
import { config } from "./tailwindConfig";
import { StyledTextSegmentSubset } from "types";

export class TailwindTextBuilder extends TailwindDefaultBuilder {
  getTextSegments(node: TextNode): {
    style: string;
    text: string;
    openTypeFeatures: { [key: string]: boolean };
  }[] {
    const segments = (node as any)
      .styledTextSegments as StyledTextSegmentSubset[];

    if (!segments) {
      return [];
    }

    return segments.map((segment) => {
      const color = this.getTailwindColorFromFills(segment.fills);
      const textDecoration = this.textDecoration(segment.textDecoration);
      const textTransform = this.textTransform(segment.textCase);
      const lineHeightStyle = this.lineHeight(
        segment.lineHeight,
        segment.fontSize,
      );
      const letterSpacingStyle = this.letterSpacing(
        segment.letterSpacing,
        segment.fontSize,
      );
      // const textIndentStyle = this.indentStyle(segment.indentation);
      const blurStyle = this.layerBlur();
      const shadowStyle = this.textShadow();

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
        blurStyle,
        shadowStyle,
      ]
        .filter(Boolean)
        .join(" ");

      const charsWithLineBreak = segment.characters.split("\n").join("<br/>");
      return {
        style: styleClasses,
        text: charsWithLineBreak,
        openTypeFeatures: segment.openTypeFeatures,
      };
    });
  }

  getTailwindColorFromFills = (
    fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
  ) => {
    // Implement a function to convert fills to the appropriate Tailwind CSS color classes.
    // This can be based on your project's configuration and color palette.
    // For example, suppose your project uses the default Tailwind CSS color palette:
    return tailwindColorFromFills(fills, "text");
  };

  fontSize = (fontSize: number) => {
    return `text-${pxToFontSize(fontSize)}`;
  };

  fontWeight = (fontWeight: number): string => {
    const weight = config.fontWeight[fontWeight];
    return weight ? `font-${weight}` : "";
  };

  indentStyle = (indentation: number) => {
    // Convert indentation to the appropriate Tailwind CSS class.
    // This can be based on your project's configuration and spacing scale.
    // For example, suppose your project uses the default Tailwind CSS spacing scale:
    return `pl-${Math.round(indentation)}`;
  };

  fontFamily = (fontName: FontName): string => {
    if (config.fontFamily.sans.includes(fontName.family)) {
      return "font-sans";
    }
    if (config.fontFamily.serif.includes(fontName.family)) {
      return "font-serif";
    }
    if (config.fontFamily.mono.includes(fontName.family)) {
      return "font-mono";
    }
    const underscoreFontName = fontName.family.replace(/\s/g, "_");

    return "font-['" + underscoreFontName + "']";
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
        .replaceAll("italic", "")
        .replaceAll(" ", "")
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
  textAlignHorizontal(): this {
    // if alignHorizontal is LEFT, don't do anything because that is native
    const node = this.node as TextNode;
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
   * https://tailwindcss.com/docs/vertical-align/
   * example: align-top, align-middle, align-bottom
   */
  textAlignVertical(): this {
    const node = this.node as TextNode;
    switch (node.textAlignVertical) {
      case "TOP":
        this.addAttributes("justify-start");
        break;
      case "CENTER":
        this.addAttributes("justify-center");
        break;
      case "BOTTOM":
        this.addAttributes("justify-end");
        break;
      default:
        break;
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

  /**
   * https://v3.tailwindcss.com/docs/blur
   */
  layerBlur = (): string => {
    if (this.node && (this.node as TextNode).effects) {
      const effects = (this.node as TextNode).effects;
      const blurEffect = effects.find(
        (effect) => effect.type === "LAYER_BLUR" && effect.visible !== false,
      );
      if (blurEffect && blurEffect.radius && blurEffect.radius > 0) {
        const blurSuffix = pxToBlur(blurEffect.radius);
        if (blurSuffix) {
          return `blur-${blurSuffix}`;
        }
      }
    }
    return "";
  };

  /**
   * New method to handle text shadow.
   * When a drop shadow is applied to a text element,
   * this method returns an arbitrary Tailwind utility class
   * in the following format:
   *
   * [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.50)]
   */
  textShadow = (): string => {
    if (this.node && (this.node as TextNode).effects) {
      const effects = (this.node as TextNode).effects;
      const dropShadow = effects.find(
        (effect) => effect.type === "DROP_SHADOW" && effect.visible !== false,
      );
      if (dropShadow) {
        const ds = dropShadow as DropShadowEffect;
        const offsetX = Math.round(ds.offset.x);
        const offsetY = Math.round(ds.offset.y);
        const blurRadius = Math.round(ds.radius);
        const r = Math.round(ds.color.r * 255);
        const g = Math.round(ds.color.g * 255);
        const b = Math.round(ds.color.b * 255);
        const aFixed = ds.color.a.toFixed(2);
        return `[text-shadow:_${offsetX}px_${offsetY}px_${blurRadius}px_rgb(${r}_${g}_${b}_/_${aFixed})]`;
      }
    }
    return "";
  };

  reset(): void {
    this.attributes = [];
  }
}
