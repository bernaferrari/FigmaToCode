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
      const fontSize = `${segment.fontSize}`;
      const fontStyle = "";
      const fontFamily = segment.fontName.family;
      const fontWeight = `FontWeight.w${segment.fontWeight}`;
      const textTransform = "";
      const lineHeight = this.getFlutterLineHeightStyle(segment.lineHeight);
      const letterSpacing = "";

      const style = generateWidgetCode("TextStyle", {
        color,
        fontSize: fontSize,
        fontStyle: fontStyle,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        textTransform: textTransform,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing,
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

  getFlutterLineHeightStyle(lineHeight: LineHeight): string {
    if (lineHeight.unit === "AUTO") {
      return "";
    } else {
      return `height: ${lineHeight.value}`;
    }
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

  const textStyle = getTextStyle(node);

  const style = textStyle ? `\nstyle: ${textStyle}` : "";

  const splittedChars = text.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1 ? splittedChars.join("\\n") : text;

  const properties = `\n"${charsWithLineBreak}",${textAlign}${style}`;

  return `Text(${properties.trim()});`;
};

export const getTextStyle = (node: TextNode): string => {
  let styleBuilder = new Map();

  const color = flutterColorFromFills(node.fills);
  color ? styleBuilder.set("color", color) : "";

  const fontSize = node.fontSize !== figma.mixed ? sliceNum(node.fontSize) : "";
  fontSize ? styleBuilder.set("fontSize", fontSize) : "";

  if (node.textDecoration === "UNDERLINE") {
    styleBuilder.set("decoration", "TextDecoration.underline");
  }

  if (node.fontName !== figma.mixed) {
    const lowercaseStyle = node.fontName.style.toLowerCase();
    if (lowercaseStyle.match("italic")) {
      styleBuilder.set("fontStyle", "FontStyle.italic");
    }

    if (!lowercaseStyle.match("regular")) {
      const value = node.fontName.style
        .replace("italic", "")
        .replace(" ", "")
        .toLowerCase();

      const weight = convertFontWeight(value);

      if (weight) {
        styleBuilder.set("fontFamily", `"${node.fontName.family}"`);
        styleBuilder.set("fontWeight", `FontWeight.w${weight}`);
      }
    }
  }

  const letterSpacing = commonLetterSpacing(node);
  if (letterSpacing > 0) {
    styleBuilder.set("letterSpacing", `${sliceNum(letterSpacing)}`);
  }

  return `TextStyle(${[...styleBuilder]
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ")});`;
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
