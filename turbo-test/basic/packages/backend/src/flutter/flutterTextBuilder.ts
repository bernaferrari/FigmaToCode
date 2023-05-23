import { generateWidgetCode, sliceNum } from "../common/numToAutoFixed";
import { convertFontWeight } from "../common/convertFontWeight";
import { indentString } from "../common/indentString";
import { commonLetterSpacing } from "../common/commonTextHeightSpacing";
import { FlutterDefaultBuilder } from "./flutterDefaultBuilder";
import { flutterColorFromFills } from "./builderImpl/flutterColor";
import { flutterSize } from "./builderImpl/flutterSize";
import { globalTextStyleSegments } from "../altNodes/altConversion";

export class FlutterTextBuilder extends FlutterDefaultBuilder {
  constructor(optChild: string = "") {
    super(optChild);
  }

  reset(): void {
    this.child = "";
  }

  createText(node: TextNode): this {
    this.child = makeTextComponent(node);
    return this;
  }

  getTextSegments(id: string): { style: string; text: string }[] {
    const segments = globalTextStyleSegments[id];
    if (!segments) {
      return [];
    }

    return segments.map((segment) => {
      const color = flutterColorFromFills(segment.fills);
      const textDecoration = this.getFlutterTextDecoration(
        segment.textDecoration
      );
      const textTransform = this.getFlutterTextTransform(segment.textCase);
      const lineHeightStyle = this.getFlutterLineHeightStyle(
        segment.lineHeight
      );
      const letterSpacingStyle = this.getFlutterLetterSpacingStyle(
        segment.letterSpacing
      );

      const style = generateWidgetCode("TextStyle", {
        color: color,
        fontSize: segment.fontSize,
        fontFamily: segment.fontName.family,
        fontStyle: segment.fontName.style,
        fontWeight: `FontWeight.w${segment.fontWeight}`,
        decoration: textDecoration,
        textTransform: textTransform,
        lineHeight: lineHeightStyle,
        letterSpacing: letterSpacingStyle,
        textIndent: segment.indentation,
      });

      return { style: style, text: segment.characters };
    });
  }

  getFlutterTextDecoration(decoration: TextDecoration): string {
    switch (decoration) {
      case "UNDERLINE":
        return "TextDecoration.underline";
      case "STRIKETHROUGH":
        return "TextDecoration.lineThrough";
      default:
        return "TextDecoration.none";
    }
  }

  getFlutterTextTransform(textCase: TextCase): string {
    // Flutter doesn't have a direct attribute for text-transform
    // You'll need to transform the text itself before passing it to the Text widget
    return "";
  }

  getFlutterLineHeightStyle(lineHeight: LineHeight): string {
    if (lineHeight.unit === "AUTO") {
      return "";
    } else {
      return `height: ${lineHeight.value}`;
    }
  }

  getFlutterLetterSpacingStyle(letterSpacing: LetterSpacing): string {
    // if (letterSpacing.unit === "AUTO") {
    //   return "";
    // } else {
    //   return `letterSpacing: ${letterSpacing.value}`;
    // }
    return "";
  }

  textAutoSize(node: TextNode): this {
    this.child = wrapTextAutoResize(node, this.child);
    return this;
  }
}

export const makeTextComponent = (node: TextNode): string => {
  // only undefined in testing
  let alignHorizontal =
    node.textAlignHorizontal?.toString()?.toLowerCase() ?? "left";
  alignHorizontal =
    alignHorizontal === "justified" ? "justify" : alignHorizontal;

  // todo if layoutAlign !== MIN, Text will be wrapped by Align
  // if alignHorizontal is LEFT, don't do anything because that is native
  const textAlign =
    alignHorizontal !== "left"
      ? `\ntextAlign: TextAlign.${alignHorizontal},`
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

  const style = textStyle
    ? `\nstyle: TextStyle(${indentString(textStyle, 2)}\n),`
    : "";

  const splittedChars = text.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1 ? splittedChars.join("\\n") : text;

  const properties = `\n"${charsWithLineBreak}",${textAlign}${style}`;

  return `Text(${indentString(properties, 2)}\n),`;
};

export const getTextStyle = (node: TextNode): string => {
  // example: text-md
  let styleBuilder = "";

  styleBuilder = generateWidgetCode("TextStyle", {
    color: flutterColorFromFills(node.fills),
    fontSize: node.fontSize !== figma.mixed ? sliceNum(node.fontSize) : "",
    decoration:
      node.textDecoration === "UNDERLINE" ? "TextDecoration.underline" : "",
  });

  if (node.fontName !== figma.mixed) {
    const lowercaseStyle = node.fontName.style.toLowerCase();

    if (lowercaseStyle.match("italic")) {
      styleBuilder += "\nfontStyle: FontStyle.italic,";
    }

    // ignore the font-style when regular (default)
    if (!lowercaseStyle.match("regular")) {
      const value = node.fontName.style
        .replace("italic", "")
        .replace(" ", "")
        .toLowerCase();

      const weight = convertFontWeight(value);

      if (weight) {
        styleBuilder += `\nfontFamily: "${node.fontName.family}",`;
        styleBuilder += `\nfontWeight: FontWeight.w${weight},`;
      }
    }
  }

  // todo lineSpacing
  const letterSpacing = commonLetterSpacing(node);
  if (letterSpacing > 0) {
    styleBuilder += `\nletterSpacing: ${sliceNum(letterSpacing)},`;
  }

  return styleBuilder;
};

export const wrapTextAutoResize = (node: TextNode, child: string): string => {
  const fSize = flutterSize(node);
  const width = fSize.width;
  const height = fSize.height;
  const isExpanded = fSize.isExpanded;
  let result = "";

  if (node.textAutoResize === "NONE") {
    // = instead of += because we want to replace it

    result = generateWidgetCode("SizedBox", {
      width: width,
      height: height,
      child: child,
    });
  } else if (node.textAutoResize === "HEIGHT") {
    // if HEIGHT is set, it means HEIGHT will be calculated automatically, but width won't
    // = instead of += because we want to replace it

    result = generateWidgetCode("SizedBox", {
      width: width,
      child: child,
    });
  }

  if (isExpanded) {
    return generateWidgetCode("Expanded", {
      child: result,
    });
  } else if (result.length > 0) {
    return result;
  }

  return child;
};
