import { commonLineHeight } from "./../common/commonTextHeightSpacing";
import {
  swiftuiFontMatcher,
  swiftuiWeightMatcher,
} from "./builderImpl/swiftuiTextWeight";
import { SwiftuiDefaultBuilder } from "./swiftuiDefaultBuilder";
import { AltTextNode } from "../altNodes/altMixins";
import { numToAutoFixed } from "../common/numToAutoFixed";
import { commonLetterSpacing } from "../common/commonTextHeightSpacing";
import { convertFontWeight } from "../common/convertFontWeight";
import { swiftuiSize } from "./builderImpl/swiftuiSize";

export class SwiftuiTextBuilder extends SwiftuiDefaultBuilder {
  reset(): void {
    this.modifiers = "";
  }

  textAutoSize(node: AltTextNode): this {
    this.modifiers += this.wrapTextAutoResize(node);
    return this;
  }

  textDecoration(node: AltTextNode): this {
    // https://developer.apple.com/documentation/swiftui/text/underline(_:color:)
    if (node.textDecoration === "UNDERLINE") {
      this.modifiers += "\n.underline()";
    }

    // https://developer.apple.com/documentation/swiftui/text/strikethrough(_:color:)
    if (node.textDecoration === "STRIKETHROUGH") {
      this.modifiers += "\n.strikethrough()";
    }

    // https://developer.apple.com/documentation/swiftui/text/italic()
    if (
      node.fontName !== figma.mixed &&
      node.fontName.style.toLowerCase().match("italic")
    ) {
      this.modifiers += "\n.italic()";
    }

    return this;
  }

  textStyle = (node: AltTextNode): this => {
    // for some reason this must be set before the multilineTextAlignment
    if (node.fontName !== figma.mixed) {
      const fontWeight = convertFontWeight(node.fontName.style);
      if (fontWeight && fontWeight !== "400") {
        const weight = swiftuiWeightMatcher(fontWeight);
        this.modifiers += `\n.fontWeight(${weight})`;
      }
    }

    // https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/
    const retrievedFont = swiftuiFontMatcher(node);
    if (retrievedFont) {
      this.modifiers += `\n.font(${retrievedFont})`;
    }

    // todo might be a good idea to calculate the width based on the font size and check if view is really multi-line
    if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
      // it can be confusing, but multilineTextAlignment is always set to left by default.
      if (node.textAlignHorizontal === "CENTER") {
        this.modifiers += `\n.multilineTextAlignment(.center)`;
      } else if (node.textAlignHorizontal === "RIGHT") {
        this.modifiers += `\n.multilineTextAlignment(.trailing)`;
      }
    }

    return this;
  };

  letterSpacing = (node: AltTextNode): this => {
    const letterSpacing = commonLetterSpacing(node);
    if (letterSpacing > 0) {
      this.modifiers += `\n.tracking(${numToAutoFixed(letterSpacing)})`;
    }

    return this;
  };

  // the difference between kerning and tracking is that tracking spaces everything, kerning keeps lignatures,
  // Figma spaces everything, so we are going to use tracking.
  lineHeight = (node: AltTextNode): this => {
    const letterHeight = commonLineHeight(node);

    if (letterHeight > 0) {
      this.modifiers += `\n.lineSpacing(${numToAutoFixed(letterHeight)})`;
    }

    return this;
  };

  wrapTextAutoResize = (node: AltTextNode): string => {
    const [propWidth, propHeight] = swiftuiSize(node);

    let comp = "";
    if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
      comp += propWidth;
    }

    if (node.textAutoResize === "NONE") {
      // if it is NONE, it isn't WIDTH_AND_HEIGHT, which means the comma must be added.
      comp += ", ";
      comp += propHeight;
    }

    if (comp.length > 0) {
      const align = this.textAlignment(node);

      return `\n.frame(${comp}${align})`;
    }

    return "";
  };

  // SwiftUI has two alignments for Text, when it is a single line and when it is multiline. This one is for single line.
  textAlignment = (node: AltTextNode): string => {
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
}
