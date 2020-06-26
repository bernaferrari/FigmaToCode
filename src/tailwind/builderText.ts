import { AltTextNode } from "../common/altMixins";
import { magicMargin } from "../common/nodeWidthHeight";
import {
  pxToMapLetterSpacing,
  pxToAbsoluteLineHeight,
  pxToLayoutSize,
  pxToFontSize,
  percentToAbsoluteLineHeight,
} from "./conversionTables";
import { tailwindDefaultBuilder } from "./builderDefault";

export class tailwindTextNodeBuilder extends tailwindDefaultBuilder {
  constructor(optIsJSX: boolean, node: AltTextNode, showLayerName: boolean) {
    super(optIsJSX, node, showLayerName);
  }

  textAutoSize(node: AltTextNode): this {
    // if (node.parent && "layoutMode" in node.parent) {
    //   if (node.parent.layoutMode === "VERTICAL") {
    //     // when parent is AutoLayout, the text width is set by the parent
    //     return this;
    //   }
    // }

    if (node.textAutoResize === "NONE") {
      const hRem = pxToLayoutSize(node.height);
      const wRem = pxToLayoutSize(node.width);

      let propHeight = `h-${hRem} `;
      let propWidth = `w-${wRem} `;

      if (node.parent && "width" in node.parent) {
        // set the width to max if the view is near the corner
        // that will be complemented with margins from [retrieveContainerPosition]
        // the third check [parentWidth - nodeWidth >= 2 * magicMargin]
        // was made to avoid setting h-full when parent is almost the same size as children
        if (
          node.parent.x - node.x <= magicMargin &&
          node.width + 2 * magicMargin >= node.parent.width &&
          node.parent.width - node.width >= 2 * magicMargin
        ) {
          propWidth = "w-full ";
        }

        if (
          node.parent.y - node.y <= magicMargin &&
          node.height + 2 * magicMargin >= node.parent.height &&
          node.parent.height - node.height >= 2 * magicMargin
        ) {
          propHeight = "h-full ";
        }
      }

      this.attributes += propHeight;
      this.attributes += propWidth;
    } else if (node.textAutoResize === "HEIGHT") {
      const wRem = pxToLayoutSize(node.width);
      let propHeight = `w-${wRem} `;

      if (node.parent) {
        if (
          node.parent.x - node.x <= magicMargin &&
          node.width + 2 * magicMargin >= node.parent.width &&
          node.parent.width - node.width >= 2 * magicMargin
        ) {
          propHeight = "w-full ";
        }
      }

      this.attributes += propHeight;
    }

    return this;
  }

  fontFamily(node: AltTextNode): this {
    // todo fontFamily
    return this;
  }

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
  fontStyle = (node: AltTextNode): this => {
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
  };

  /**
   * https://tailwindcss.com/docs/letter-spacing/
   * example: tracking-widest
   */
  letterSpacing = (node: AltTextNode): this => {
    if (node.letterSpacing !== figma.mixed) {
      if (
        node.letterSpacing.unit === "PIXELS" &&
        node.letterSpacing.value !== 0
      ) {
        const value = pxToMapLetterSpacing(node.letterSpacing.value);
        this.attributes += `tracking-${value} `;
      } else if (
        node.letterSpacing.unit === "PERCENT" &&
        node.letterSpacing.value !== 0
      ) {
        // divide by 10 so it works as expected visually.
        const value = pxToMapLetterSpacing(node.letterSpacing.value / 10);
        this.attributes += `tracking-${value} `;
      }
    }
    return this;
  };

  /**
   * https://tailwindcss.com/docs/line-height/
   * example: leading-3
   */
  lineHeight(node: AltTextNode): this {
    if (node.lineHeight !== figma.mixed) {
      if (node.lineHeight.unit === "PIXELS") {
        // rollup has issues when ` ${method(\n...\n)} `, so this value declaration is necessary
        const value = pxToAbsoluteLineHeight(node.lineHeight.value);
        this.attributes += `leading-${value} `;
      } else if (node.lineHeight.unit === "PERCENT") {
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
    const alignHorizontal = node.textAlignHorizontal.toString().toLowerCase();

    if (
      node.textAlignHorizontal !== "LEFT" &&
      node.textAutoResize !== "WIDTH_AND_HEIGHT"
    ) {
      this.attributes += `text-${alignHorizontal} `;
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

  reset() {
    this.attributes = "";
  }
}
