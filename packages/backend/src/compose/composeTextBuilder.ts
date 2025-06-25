import { commonLetterSpacing } from "../common/commonTextHeightSpacing";
import { numberToFixedString } from "../common/numToAutoFixed";
import { ComposeDefaultBuilder } from "./composeDefaultBuilder";
import { rgbTo6hex } from "../common/color";
import { getCommonRadius } from "../common/commonRadius";
import { retrieveTopFill } from "../common/retrieveFill";

export class ComposeTextBuilder extends ComposeDefaultBuilder {
  constructor() {
    super("");
  }

  createText(node: TextNode): this {
    this.child = this.getText(node);
    return this;
  }

  private getText(node: TextNode): string {
    const text = node.characters;
    const textStyles = this.getTextStyles(node);
    
    return `Text(
    text = "${text.replace(/"/g, '\\"')}",
    ${textStyles}
)`;
  }

  private getTextStyles(node: TextNode): string {
    const styles: string[] = [];

    // Font size
    if (node.fontSize !== figma.mixed) {
      styles.push(`fontSize = ${node.fontSize}.sp`);
    }

    // Font weight
    if (node.fontWeight !== figma.mixed) {
      const weight = this.mapFontWeight(node.fontWeight);
      if (weight) {
        styles.push(`fontWeight = FontWeight.${weight}`);
      }
    }

    // Text color
    const fill = retrieveTopFill(node.fills);
    if (fill?.type === "SOLID") {
      const color = rgbTo6hex(fill.color);
      styles.push(`color = Color(0xFF${color})`);
    }

    // Letter spacing
    if (node.letterSpacing !== figma.mixed && node.letterSpacing !== 0) {
      const spacing = commonLetterSpacing(node.letterSpacing, node.fontSize as number);
      styles.push(`letterSpacing = ${spacing}.sp`);
    }

    // Line height
    if (node.lineHeight !== figma.mixed && typeof node.lineHeight === "object" && node.lineHeight.unit === "PIXELS") {
      styles.push(`lineHeight = ${node.lineHeight.value}.sp`);
    }

    // Text align
    if (node.textAlignHorizontal !== "LEFT") {
      const alignment = this.mapTextAlign(node.textAlignHorizontal);
      if (alignment) {
        styles.push(`textAlign = TextAlign.${alignment}`);
      }
    }

    // Text decoration
    if (node.textDecoration === "UNDERLINE") {
      styles.push(`textDecoration = TextDecoration.Underline`);
    } else if (node.textDecoration === "STRIKETHROUGH") {
      styles.push(`textDecoration = TextDecoration.LineThrough`);
    }

    return styles.join(",\n    ");
  }

  private mapFontWeight(weight: number): string | null {
    const weightMap: Record<number, string> = {
      100: "Thin",
      200: "ExtraLight",
      300: "Light",
      400: "Normal",
      500: "Medium",
      600: "SemiBold",
      700: "Bold",
      800: "ExtraBold",
      900: "Black",
    };
    return weightMap[weight] || null;
  }

  private mapTextAlign(align: string): string | null {
    const alignMap: Record<string, string> = {
      "LEFT": "Left",
      "CENTER": "Center",
      "RIGHT": "Right",
      "JUSTIFIED": "Justify",
    };
    return alignMap[align] || null;
  }

  textAutoSize(node: TextNode): this {
    // Compose doesn't have equivalent to Flutter's textAutoSize
    // Instead, we can use maxLines and overflow properties
    if (node.textAutoResize === "NONE") {
      // Fixed size text
      this.child = this.child.replace(
        /Text\(/,
        `Text(
    maxLines = 1,
    overflow = TextOverflow.Ellipsis,`
      );
    }
    return this;
  }
}