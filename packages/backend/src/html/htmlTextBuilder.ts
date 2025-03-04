import { formatMultipleJSX, formatWithJSX } from "../common/parseJSX";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { htmlColorFromFills } from "./builderImpl/htmlColor";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { HTMLSettings, StyledTextSegmentSubset } from "types";

export class HtmlTextBuilder extends HtmlDefaultBuilder {
  constructor(node: TextNode, settings: HTMLSettings) {
    super(node, settings);
  }

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
      // Prepare additional CSS properties from layer blur and drop shadow effects.
      const additionalStyles: { [key: string]: string } = {};

      const layerBlurStyle = this.getLayerBlurStyle();
      if (layerBlurStyle) {
        additionalStyles.filter = layerBlurStyle;
      }
      const textShadowStyle = this.getTextShadowStyle();
      if (textShadowStyle) {
        additionalStyles["text-shadow"] = textShadowStyle;
      }

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
          ...additionalStyles,
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

  textAlignHorizontal(): this {
    const node = this.node as TextNode;
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

  textAlignVertical(): this {
    const node = this.node as TextNode;
    if (node.textAlignVertical && node.textAlignVertical !== "TOP") {
      let alignItems = "";
      switch (node.textAlignVertical) {
        case "CENTER":
          alignItems = "center";
          break;
        case "BOTTOM":
          alignItems = "flex-end";
          break;
      }
      if (alignItems) {
        this.addStyles(
          formatWithJSX("justify-content", this.isJSX, alignItems),
        );
        this.addStyles(formatWithJSX("display", this.isJSX, "flex"));
        this.addStyles(formatWithJSX("flex-direction", this.isJSX, "column"));
      }
    }
    return this;
  }

  /**
   * Returns a CSS filter value for layer blur.
   */
  private getLayerBlurStyle(): string {
    if (this.node && (this.node as TextNode).effects) {
      const effects = (this.node as TextNode).effects;
      const blurEffect = effects.find(
        (effect) =>
          effect.type === "LAYER_BLUR" &&
          effect.visible !== false &&
          effect.radius > 0,
      );
      if (blurEffect && blurEffect.radius) {
        return `blur(${blurEffect.radius}px)`;
      }
    }
    return "";
  }

  /**
   * Returns a CSS text-shadow value if a drop shadow effect is applied.
   */
  private getTextShadowStyle(): string {
    if (this.node && (this.node as TextNode).effects) {
      const effects = (this.node as TextNode).effects;
      const dropShadow = effects.find(
        (effect) => effect.type === "DROP_SHADOW" && effect.visible !== false,
      );
      if (dropShadow) {
        const ds = dropShadow as DropShadowEffect; // Type narrow the effect.
        const offsetX = Math.round(ds.offset.x);
        const offsetY = Math.round(ds.offset.y);
        const blurRadius = Math.round(ds.radius);
        const r = Math.round(ds.color.r * 255);
        const g = Math.round(ds.color.g * 255);
        const b = Math.round(ds.color.b * 255);
        const a = ds.color.a;
        return `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${r}, ${g}, ${b}, ${a.toFixed(
          2,
        )})`;
      }
    }
    return "";
  }
}
