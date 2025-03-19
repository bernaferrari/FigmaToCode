import { numberToFixedString } from "../common/numToAutoFixed";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { SwiftuiDefaultBuilder } from "./swiftuiDefaultBuilder";
import { swiftuiWeightMatcher } from "./builderImpl/swiftuiTextWeight";
import { swiftuiSize } from "./builderImpl/swiftuiSize";
import { SwiftUIElement } from "./builderImpl/swiftuiParser";
import { parseTextAsCode } from "../flutter/flutterTextBuilder";
import { swiftuiSolidColorFromDirectFills } from "./builderImpl/swiftuiColor";
import { StyledTextSegmentSubset } from "types";

export class SwiftuiTextBuilder extends SwiftuiDefaultBuilder {
  node?: TextNode;
  modifiers: string[] = [];

  constructor(kind: string = "Text") {
    super(kind);
  }

  reset(): void {
    this.modifiers = [];
  }

  textAutoSize(node: TextNode): this {
    this.modifiers.push(this.wrapTextAutoResize(node));
    return this;
  }

  textDecoration(textDecoration: TextDecoration): string | null {
    switch (textDecoration) {
      case "UNDERLINE":
        // https://developer.apple.com/documentation/swiftui/text/underline(_:color:)
        return "underline";
      case "STRIKETHROUGH":
        // https://developer.apple.com/documentation/swiftui/text/strikethrough(_:color:)
        return "strikethrough";
      case "NONE":
        return null;
    }
  }

  textColor(fills: Paint[]): string {
    const fillColor = swiftuiSolidColorFromDirectFills(fills);
    if (fillColor) {
      return fillColor;
    }
    return "";
  }

  textStyle(style: string): string | null {
    // https://developer.apple.com/documentation/swiftui/text/italic()
    if (style.toLowerCase().match("italic")) {
      return "italic";
    }
    return null;
  }

  fontWeight(fontWeight: number): string {
    // for some reason this must be set before the multilineTextAlignment
    if (fontWeight !== 400) {
      const weight = swiftuiWeightMatcher(fontWeight);
      return `.weight(${weight})`;
    }
    return "";
  }

  textStyle2 = (node: TextNode): this => {
    // todo might be a good idea to calculate the width based on the font size and check if view is really multi-line
    if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
      // it can be confusing, but multilineTextAlignment is always set to left by default.
      if (node.textAlignHorizontal === "CENTER") {
        this.modifiers.push(".multilineTextAlignment(.center)");
      } else if (node.textAlignHorizontal === "RIGHT") {
        this.modifiers.push(".multilineTextAlignment(.trailing)");
      }
    }

    return this;
  };

  createText(node: TextNode): this {
    this.node = node;
    let alignHorizontal =
      node.textAlignHorizontal?.toString()?.toLowerCase() ?? "left";
    alignHorizontal =
      alignHorizontal === "justified" ? "justify" : alignHorizontal;

    // const basicTextStyle = {
    //   textAlign:
    //     alignHorizontal !== "left" ? `TextAlign.${alignHorizontal}` : "",
    // };

    const segments = this.getTextSegments(node, node.characters);
    if (segments) {
      this.element = segments;
    } else {
      this.element = new SwiftUIElement("Text()");
    }

    return this;
  }

  getTextSegments(node: TextNode, characters: string): SwiftUIElement | null {
    const segments = (node as any)
      .styledTextSegments as StyledTextSegmentSubset[];
    if (!segments) {
      return null;
    }

    const segment = segments[0];

    // return segments.map((segment) => {
    const fontSize = numberToFixedString(segment.fontSize);
    const fontFamily = segment.fontName.family;
    const fontWeight = this.fontWeight(segment.fontWeight);
    const lineHeight = this.lineHeight(segment.lineHeight, segment.fontSize);
    const letterSpacing = this.letterSpacing(
      segment.letterSpacing,
      segment.fontSize,
    );

    let updatedText = parseTextAsCode(characters); //segment.characters); swiftUI only supports a single text.
    if (segment.textCase === "LOWER") {
      updatedText = characters.toLowerCase();
    } else if (segment.textCase === "UPPER") {
      updatedText = characters.toUpperCase();
    }

    const element = new SwiftUIElement(
      `Text(${parseTextAsCode(`"${characters}"`)})`,
    )
      .addModifier([
        "font",
        `Font.custom("${fontFamily}", size: ${fontSize})${
          fontWeight ? `${fontWeight}` : ""
        }`,
      ])
      .addModifier(["tracking", letterSpacing])
      .addModifier(["lineSpacing", lineHeight])
      .addModifier([this.textDecoration(segment.textDecoration), ""])
      .addModifier([this.textStyle(segment.fontName.style), ""])
      .addModifier(["foregroundColor", this.textColor(segment.fills)]);

    const blurMod = this.textBlur();
    if (blurMod !== "") {
      element.addModifier([blurMod, ""]);
    }

    const shadowMod = this.textShadow();
    if (shadowMod !== "") {
      element.addModifier([shadowMod, ""]);
    }

    return element;
    // });
  }

  letterSpacing = (
    letterSpacing: LetterSpacing,
    fontSize: number,
  ): string | null => {
    const value = commonLetterSpacing(letterSpacing, fontSize);
    if (value > 0) {
      return numberToFixedString(value);
    }
    return null;
  };

  // the difference between kerning and tracking is that tracking spaces everything, kerning keeps lignatures,
  // Figma spaces everything, so we are going to use tracking.
  lineHeight = (lineHeight: LineHeight, fontSize: number): string | null => {
    const value = commonLineHeight(lineHeight, fontSize);
    if (value > 0) {
      return numberToFixedString(value);
    }
    return null;
  };

  wrapTextAutoResize = (node: TextNode): string => {
    const { width, height, constraints } = swiftuiSize(node);

    let comp: string[] = [];
    switch (node.textAutoResize) {
      case "WIDTH_AND_HEIGHT":
        break;
      case "HEIGHT":
        comp.push(width);
        break;
      case "NONE":
      case "TRUNCATE":
        comp.push(width, height);
        break;
    }

    comp.push(...constraints);

    if (comp.length > 0) {
      const align = this.textAlignment(node);
      return `.frame(${comp.join(", ")}${align})`;
    }

    return "";
  };

  // SwiftUI has two alignments for Text, when it is a single line and when it is multiline. This one is for single line.
  textAlignment = (node: TextNode): string => {
    let hAlign = "";
    if (node.textAlignHorizontal === "LEFT") {
      hAlign = "leading";
    } else if (node.textAlignHorizontal === "RIGHT") {
      hAlign = "trailing";
    }

    let vAlign = "";
    if (node.textAlignVertical === "TOP") {
      vAlign = "top";
    } else if (node.textAlignVertical === "BOTTOM") {
      vAlign = "bottom";
    }

    if (hAlign && !vAlign) {
      // result should be leading or trailing
      return `, alignment: .${hAlign}`;
    } else if (!hAlign && vAlign) {
      // result should be top or bottom
      return `, alignment: .${vAlign}`;
    } else if (hAlign && vAlign) {
      // make the first char from hAlign uppercase
      const hAlignUpper = hAlign.charAt(0).toUpperCase() + hAlign.slice(1);
      // result should be topLeading, topTrailing, bottomLeading or bottomTrailing
      return `, alignment: .${vAlign}${hAlignUpper}`;
    }

    // when they are centered
    return "";
  };

  textBlur = (): string => {
    if (this.node && this.node.effects) {
      const blurEffect = this.node.effects.find(
        (effect) =>
          effect.type === "LAYER_BLUR" &&
          effect.visible !== false &&
          effect.radius > 0,
      );
      if (blurEffect) {
        return `.blur(radius: ${blurEffect.radius})`;
      }
    }
    return "";
  };

  textShadow = (): string => {
    if (this.node && this.node.effects) {
      const dropShadow = this.node.effects.find(
        (effect) => effect.type === "DROP_SHADOW" && effect.visible !== false,
      );
      if (dropShadow) {
        const ds = dropShadow as DropShadowEffect;
        const offsetX = Math.round(ds.offset.x);
        const offsetY = Math.round(ds.offset.y);
        const blurRadius = Math.round(ds.radius);
        return `.shadow(color: Color(red: ${ds.color.r.toFixed(
          2,
        )}, green: ${ds.color.g.toFixed(2)}, blue: ${ds.color.b.toFixed(
          2,
        )}, opacity: ${ds.color.a.toFixed(
          2,
        )}), radius: ${blurRadius}, x: ${offsetX}, y: ${offsetY})`;
      }
    }
    return "";
  };
}
