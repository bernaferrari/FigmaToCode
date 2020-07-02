import { tailwindTextSize } from "./builderImpl/tailwindTextSize";
import { AltTextNode } from "../altNodes/altMixins";
import {
  pxToMapLetterSpacing,
  pxToAbsoluteLineHeight,
  pxToFontSize,
  percentToAbsoluteLineHeight,
} from "./conversionTables";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";

export class TailwindTextBuilder extends TailwindDefaultBuilder {
  constructor(optIsJSX: boolean, node: AltTextNode, showLayerName: boolean) {
    super(optIsJSX, node, showLayerName);
  }

  textAutoSize(node: AltTextNode): this {
    this.attributes += tailwindTextSize(node);
    return this;
  }

  // todo fontFamily
  //  fontFamily(node: AltTextNode): this {
  //    return this;
  //  }

  /**
   * https://tailwindcss.com/docs/font-size/
   * example: text-md
   */
  fontSize(node: AltTextNode): this {
    // example: text-md
    if (node.fontSize !== figma.mixed) {
      const value = pxToFontSize(node.fontSize);
      this.attributes += `text-${value} `;
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/font-style/
   * example: font-extrabold
   * example: italic
   */
  fontStyle(node: AltTextNode): this {
    if (node.fontName !== figma.mixed) {
      const lowercaseStyle = node.fontName.style.toLowerCase();

      if (lowercaseStyle.match("italic")) {
        this.attributes += "italic ";
      }

      if (lowercaseStyle.match("regular")) {
        // ignore the font-style when regular (default)
        return this;
      }

      const value = node.fontName.style
        .replace("italic", "")
        .replace(" ", "")
        .toLowerCase();

      this.attributes += `font-${value} `;
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/letter-spacing/
   * example: tracking-widest
   */
  letterSpacing(node: AltTextNode): this {
    if (node.letterSpacing !== figma.mixed && node.letterSpacing.value !== 0) {
      if (node.letterSpacing.unit === "PIXELS") {
        const value = pxToMapLetterSpacing(node.letterSpacing.value);
        this.attributes += `tracking-${value} `;
      } else {
        // node.letterSpacing.unit === "PERCENT"

        // divide by 10 so it works as expected visually.
        const value = pxToMapLetterSpacing(node.letterSpacing.value / 10);
        this.attributes += `tracking-${value} `;
      }
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/line-height/
   * example: leading-3
   */
  lineHeight(node: AltTextNode): this {
    if (
      node.lineHeight !== figma.mixed &&
      node.lineHeight.unit !== "AUTO" &&
      node.lineHeight.value !== 0
    ) {
      if (node.lineHeight.unit === "PIXELS") {
        // rollup has issues when ` ${method(\n...\n)} `, so this value declaration is necessary
        const value = pxToAbsoluteLineHeight(node.lineHeight.value);
        this.attributes += `leading-${value} `;
      } else {
        // node.lineHeight.unit === "PERCENT"
        const value = percentToAbsoluteLineHeight(node.lineHeight.value);
        this.attributes += `leading-${value} `;
      }
      // else if (node.lineHeight.unit === "AUTO") {
      // default, ignore
      // }
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-align/
   * example: text-justify
   */
  textAlign(node: AltTextNode): this {
    // if layoutAlign !== MIN, Text will be wrapped by Align
    // if alignHorizontal is LEFT, don't do anything because that is native

    // only undefined in testing
    if (node.textAlignHorizontal) {
      const alignHorizontal = node.textAlignHorizontal.toString().toLowerCase();

      if (
        node.textAlignHorizontal !== "LEFT" &&
        node.textAutoResize !== "WIDTH_AND_HEIGHT"
      ) {
        this.attributes += `text-${alignHorizontal} `;
      }
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-transform/
   * example: uppercase
   */
  textTransform(node: AltTextNode): this {
    if (node.textCase === "LOWER") {
      this.attributes += "lowercase ";
    } else if (node.textCase === "TITLE") {
      this.attributes += "capitalize ";
    } else if (node.textCase === "UPPER") {
      this.attributes += "uppercase ";
    } else if (node.textCase === "ORIGINAL") {
      // default, ignore
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-decoration/
   * example: underline
   */
  textDecoration(node: AltTextNode): this {
    if (node.textDecoration === "UNDERLINE") {
      this.attributes += "underline ";
    } else if (node.textDecoration === "STRIKETHROUGH") {
      this.attributes += "line-through ";
    }

    return this;
  }

  reset(): void {
    this.attributes = "";
  }
}

// Convert generic named weights to numbers, which is the way tailwind understands
export const convertFontWeight = (weight: string): string => {
  weight = weight.toLowerCase();
  switch (weight) {
    case "thin":
      return "100";
    case "extra light":
      return "200";
    case "light":
      return "300";
    case "regular":
      return "400";
    case "medium":
      return "500";
    case "semi bold":
      return "600";
    case "bold":
      return "700";
    case "extra bold":
      return "800";
    case "black":
      return "900";
    default:
      return "400";
  }
};
