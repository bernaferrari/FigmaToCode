import {
  generateWidgetCode,
  skipDefaultProperty,
  numberToFixedString,
} from "./../common/numToAutoFixed";
import { FlutterDefaultBuilder } from "./flutterDefaultBuilder";
import {
  flutterColorFromDirectFills,
  flutterColorFromFills,
} from "./builderImpl/flutterColor";
import { flutterSize } from "./builderImpl/flutterSize";
import {
  commonLetterSpacing,
  commonLineHeight,
} from "../common/commonTextHeightSpacing";
import { StyledTextSegmentSubset } from "types/src/types";

export class FlutterTextBuilder extends FlutterDefaultBuilder {
  node?: TextNode;

  constructor(optChild: string = "") {
    super(optChild);
  }

  reset(): void {
    this.child = "";
  }

  createText(node: TextNode): this {
    this.node = node;
    let alignHorizontal =
      node.textAlignHorizontal?.toString()?.toLowerCase() ?? "left";
    alignHorizontal =
      alignHorizontal === "justified" ? "justify" : alignHorizontal;

    const basicTextStyle = {
      textAlign:
        alignHorizontal !== "left" ? `TextAlign.${alignHorizontal}` : "",
    };

    const segments = this.getTextSegments(node);
    if (segments.length === 1) {
      this.child = generateWidgetCode(
        "Text",
        {
          ...basicTextStyle,
          style: segments[0].style,
        },
        [`'${segments[0].text}'`],
      );
    } else {
      this.child = generateWidgetCode("Text.rich", basicTextStyle, [
        generateWidgetCode("TextSpan", {
          children: segments.map((segment) =>
            generateWidgetCode("TextSpan", {
              text: `'${segment.text}'`,
              style: segment.style,
            }),
          ),
        }),
      ]);
    }

    return this;
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
      const color = flutterColorFromDirectFills(segment.fills);

      const fontSize = `${numberToFixedString(segment.fontSize)}`;
      const fontStyle = this.fontStyle(segment.fontName);
      const fontFamily = `'${segment.fontName.family}'`;
      const fontWeight = `FontWeight.w${segment.fontWeight}`;
      const lineHeight = this.lineHeight(segment.lineHeight, segment.fontSize);
      const letterSpacing = this.letterSpacing(
        segment.letterSpacing,
        segment.fontSize,
      );

      const styleProperties: { [key: string]: string } = {
        color: color,
        fontSize: fontSize,
        fontStyle: fontStyle,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        textDecoration: skipDefaultProperty(
          this.getFlutterTextDecoration(segment.textDecoration),
          "TextDecoration.none",
        ),
        // textTransform: textTransform,
        height: lineHeight,
        letterSpacing: letterSpacing,
      };

      if (
        (segment.openTypeFeatures as unknown as { SUBS: boolean }).SUBS === true
      ) {
        styleProperties.fontFeatures = `[FontFeature.enable("subs")]`;
      } else if (
        (segment.openTypeFeatures as unknown as { SUPS: boolean }).SUPS === true
      ) {
        styleProperties.fontFeatures = `[FontFeature.enable("sups")]`;
      }

      // Add text-shadow if a drop shadow is applied
      const shadow = this.textShadow();
      if (shadow) {
        styleProperties.shadows = shadow;
      }

      const style = generateWidgetCode("TextStyle", styleProperties);

      let text = segment.characters;
      if (segment.textCase === "LOWER") {
        text = text.toLowerCase();
      } else if (segment.textCase === "UPPER") {
        text = text.toUpperCase();
      }

      return {
        style: style,
        text: parseTextAsCode(text).replace(/\$/g, "\\$"),
        openTypeFeatures: segment.openTypeFeatures,
      };
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

  lineHeight(lineHeight: LineHeight, fontSize: number): string {
    switch (lineHeight.unit) {
      case "AUTO":
        return "";
      case "PIXELS":
        return numberToFixedString(lineHeight.value / fontSize);
      case "PERCENT":
        return numberToFixedString(lineHeight.value / 100);
    }
  }

  letterSpacing(letterSpacing: LetterSpacing, fontSize: number): string {
    const value = commonLetterSpacing(letterSpacing, fontSize);
    if (value) {
      return numberToFixedString(value);
    }
    return "";
  }

  textAutoSize(node: TextNode): this {
    let result = this.child;
    
    switch (node.textAutoResize) {
      case "WIDTH_AND_HEIGHT":
        break;
      case "HEIGHT":
        result = generateWidgetCode("SizedBox", {
          width: node.width,
          child: result,
        });
        break;
      case "NONE":
      case "TRUNCATE":
        result = generateWidgetCode("SizedBox", {
          width: node.width,
          height: node.height,
          child: result,
        });
        break;
    }
    
    result = wrapTextWithLayerBlur(node, result);
    
    this.child = result;
    return this;
  }

  fontStyle = (fontName: FontName): string => {
    const lowercaseStyle = fontName.style.toLowerCase();
    if (lowercaseStyle.match("italic")) {
      return "FontStyle.italic";
    }
    return "";
  };

  /**
   * New method to handle text shadow.
   * Checks if a drop shadow effect is applied to the node and
   * returns Flutter code for the TextStyle "shadows" property.
   */
  textShadow(): string {
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
        const hex = ((1 << 24) + (r << 16) + (g << 8) + b)
          .toString(16)
          .slice(1)
          .toUpperCase();
        return `[Shadow(offset: Offset(${offsetX}, ${offsetY}), blurRadius: ${blurRadius}, color: Color(0xFF${hex}).withOpacity(${ds.color.a.toFixed(
          2,
        )}))]`;
      }
    }
    return "";
  }
}

export const wrapTextWithLayerBlur = (
  node: TextNode,
  child: string,
): string => {
  if (node.effects) {
    const blurEffect = node.effects.find(
      (effect) =>
        effect.type === "LAYER_BLUR" &&
        effect.visible !== false &&
        effect.radius > 0,
    );
    if (blurEffect) {
      return generateWidgetCode("ImageFiltered", {
        imageFilter: `ImageFilter.blur(sigmaX: ${blurEffect.radius}, sigmaY: ${blurEffect.radius})`,
        child: child,
      });
    }
  }
  return child;
};

export const parseTextAsCode = (originalText: string) =>
  originalText.replace(/\n/g, "\\n");
