import { commonLetterSpacing } from "./../common/commonTextHeightSpacing";
import { FlutterDefaultBuilder } from "./flutterDefaultBuilder";
import { AltTextNode } from "../altNodes/altMixins";
import { flutterColorFromFills } from "./builderImpl/flutterColor";
import { numToAutoFixed } from "../common/numToAutoFixed";
import { convertFontWeight } from "../common/convertFontWeight";

export class FlutterTextBuilder extends FlutterDefaultBuilder {
  constructor(optChild: string = "") {
    super(optChild);
  }

  reset(): void {
    this.child = "";
  }

  createText(node: AltTextNode): this {
    this.child = makeTextComponent(node);
    return this;
  }

  textAutoSize(node: AltTextNode): this {
    this.child = wrapTextAutoResize(node, this.child);
    return this;
  }
}

export const makeTextComponent = (node: AltTextNode): string => {
  // only undefined in testing
  let alignHorizontal =
    node.textAlignHorizontal?.toString()?.toLowerCase() ?? "left";
  alignHorizontal =
    alignHorizontal === "justified" ? "justify" : alignHorizontal;

  // todo if layoutAlign !== MIN, Text will be wrapped by Align
  // if alignHorizontal is LEFT, don't do anything because that is native
  const textAlign =
    alignHorizontal !== "left"
      ? `textAlign: TextAlign.${alignHorizontal}, `
      : "";

  let text = node.characters;
  if (node.textCase === "LOWER") {
    text = text.toLowerCase();
  } else if (node.textCase === "UPPER") {
    text = text.toUpperCase();
  }
  // else if (node.textCase === "TITLE") {
  // TODO this
  // }

  const textStyle = getTextStyle(node);

  const style = textStyle ? `style: TextStyle(${textStyle}), ` : "";

  const splittedChars = text.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1 ? splittedChars.join("\\n") : text;

  return `Text("${charsWithLineBreak}", ${textAlign}${style}), `;
};

export const getTextStyle = (node: AltTextNode): string => {
  // example: text-md
  let styleBuilder = "";

  styleBuilder += flutterColorFromFills(node.fills);

  if (node.fontSize !== figma.mixed) {
    styleBuilder += `fontSize: ${numToAutoFixed(node.fontSize)}, `;
  }

  if (node.textDecoration === "UNDERLINE") {
    styleBuilder += "decoration: TextDecoration.underline, ";
  }

  if (node.fontName !== figma.mixed) {
    const lowercaseStyle = node.fontName.style.toLowerCase();

    if (lowercaseStyle.match("italic")) {
      styleBuilder += "fontStyle: FontStyle.italic, ";
    }

    // ignore the font-style when regular (default)
    if (!lowercaseStyle.match("regular")) {
      const value = node.fontName.style
        .replace("italic", "")
        .replace(" ", "")
        .toLowerCase();

      const weight = convertFontWeight(value);

      if (weight) {
        styleBuilder += `fontFamily: "${node.fontName.family}", `;
        styleBuilder += `fontWeight: FontWeight.w${weight}, `;
      }
    }
  }

  // todo lineSpacing
  const letterSpacing = commonLetterSpacing(node);
  if (letterSpacing > 0) {
    styleBuilder += `letterSpacing: ${numToAutoFixed(letterSpacing)}, `;
  }

  return styleBuilder;
};

export const wrapTextAutoResize = (
  node: AltTextNode,
  child: string
): string => {
  if (node.textAutoResize === "NONE") {
    // = instead of += because we want to replace it
    return `SizedBox(width: ${numToAutoFixed(
      node.width
    )}, height: ${numToAutoFixed(node.height)}, child: ${child}),`;
  } else if (node.textAutoResize === "HEIGHT") {
    // if HEIGHT is set, it means HEIGHT will be calculated automatically, but width won't
    // = instead of += because we want to replace it
    return `SizedBox(width: ${numToAutoFixed(node.width)}, child: ${child}),`;
  }

  return child;
};
