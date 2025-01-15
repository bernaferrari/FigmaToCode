import { formatWithJSX } from "../common/parseJSX";
import { htmlShadow } from "./builderImpl/htmlShadow";
import {
  htmlVisibility,
  htmlRotation,
  htmlOpacity,
  htmlBlendMode,
} from "./builderImpl/htmlBlend";
import {
  htmlColorFromFills,
  htmlGradientFromFills,
} from "./builderImpl/htmlColor";
import { htmlPadding } from "./builderImpl/htmlPadding";
import { htmlSizePartial } from "./builderImpl/htmlSize";
import { htmlBorderRadius } from "./builderImpl/htmlBorderRadius";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import { sliceNum, stringToClassName } from "../common/numToAutoFixed";
import { commonStroke } from "../common/commonStroke";
import {
  formatClassAttribute,
  formatDataAttribute,
  formatStyleAttribute,
} from "../common/commonFormatAttributes";
import { HTMLSettings } from "types";

export class HtmlDefaultBuilder {
  styles: Array<string>;
  data: Array<string>;
  node: SceneNode;
  settings: HTMLSettings;

  get name() {
    return this.settings.showLayerNames ? this.node.name : "";
  }
  get visible() {
    return this.node.visible;
  }
  get isJSX() {
    return this.settings.jsx;
  }
  get optimizeLayout() {
    return this.settings.optimizeLayout;
  }

  constructor(node: SceneNode, settings: HTMLSettings) {
    this.node = node;
    this.settings = settings;
    this.styles = [];
    this.data = [];
  }

  commonPositionStyles(): this {
    this.size();
    this.autoLayoutPadding();
    this.position();
    this.blend();
    return this;
  }

  commonShapeStyles(): this {
    if ("fills" in this.node) {
      this.applyFillsToStyle(
        this.node.fills,
        this.node.type === "TEXT" ? "text" : "background",
      );
    }
    this.shadow();
    this.border();
    this.blur();
    return this;
  }

  addStyles = (...newStyles: string[]) => {
    this.styles.push(...newStyles.filter((style) => style));
  };

  blend(): this {
    const { node, isJSX } = this;
    this.addStyles(
      htmlVisibility(node, isJSX),
      ...htmlRotation(node as LayoutMixin, isJSX),
      htmlOpacity(node as MinimalBlendMixin, isJSX),
      htmlBlendMode(node as MinimalBlendMixin, isJSX),
    );
    return this;
  }

  border(): this {
    const { node } = this;
    this.addStyles(...htmlBorderRadius(node, this.isJSX));

    const commonBorder = commonStroke(node);
    if (!commonBorder) {
      return this;
    }

    const strokes = ("strokes" in node && node.strokes) || undefined;
    const color = htmlColorFromFills(strokes);
    const borderStyle =
      "dashPattern" in node && node.dashPattern.length > 0 ? "dotted" : "solid";

    const consolidateBorders = (border: number): string =>
      [`${sliceNum(border)}px`, color, borderStyle].filter((d) => d).join(" ");

    if ("all" in commonBorder) {
      if (commonBorder.all === 0) {
        return this;
      }
      const weight = commonBorder.all;
      this.addStyles(
        formatWithJSX("border", this.isJSX, consolidateBorders(weight)),
      );
    } else {
      if (commonBorder.left !== 0) {
        this.addStyles(
          formatWithJSX(
            "border-left",
            this.isJSX,
            consolidateBorders(commonBorder.left),
          ),
        );
      }
      if (commonBorder.top !== 0) {
        this.addStyles(
          formatWithJSX(
            "border-top",
            this.isJSX,
            consolidateBorders(commonBorder.top),
          ),
        );
      }
      if (commonBorder.right !== 0) {
        this.addStyles(
          formatWithJSX(
            "border-right",
            this.isJSX,
            consolidateBorders(commonBorder.right),
          ),
        );
      }
      if (commonBorder.bottom !== 0) {
        this.addStyles(
          formatWithJSX(
            "border-bottom",
            this.isJSX,
            consolidateBorders(commonBorder.bottom),
          ),
        );
      }
    }
    return this;
  }

  position(): this {
    const { node, optimizeLayout, isJSX } = this;
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);

      this.addStyles(
        formatWithJSX("left", isJSX, x),
        formatWithJSX("top", isJSX, y),
        formatWithJSX("position", isJSX, "absolute"),
      );
    } else {
      if (
        node.type === "GROUP" ||
        ("layoutMode" in node &&
          ((optimizeLayout ? node.inferredAutoLayout : null) ?? node)
            ?.layoutMode === "NONE")
      ) {
        this.addStyles(formatWithJSX("position", isJSX, "relative"));
      }
    }

    return this;
  }

  applyFillsToStyle(
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
    property: "text" | "background",
  ): this {
    if (property === "text") {
      this.addStyles(
        formatWithJSX("text", this.isJSX, htmlColorFromFills(paintArray)),
      );
      return this;
    }

    const backgroundValues = this.buildBackgroundValues(paintArray);
    if (backgroundValues) {
      this.addStyles(formatWithJSX("background", this.isJSX, backgroundValues));
    }

    return this;
  }

  buildBackgroundValues(
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
  ): string {
    if (paintArray === figma.mixed) {
      return "";
    }

    // If one fill and it's a solid, return the solid RGB color
    if (paintArray.length === 1 && paintArray[0].type === "SOLID") {
      return htmlColorFromFills(paintArray);
    }

    // If multiple fills, deal with gradients and convert solid colors to a "dumb" linear-gradient
    const styles = paintArray.map((paint) => {
      if (paint.type === "SOLID") {
        const color = htmlColorFromFills([paint]);
        return `linear-gradient(0deg, ${color} 0%, ${color} 100%)`;
      } else if (
        paint.type === "GRADIENT_LINEAR" ||
        paint.type === "GRADIENT_RADIAL" ||
        paint.type === "GRADIENT_ANGULAR"
      ) {
        return htmlGradientFromFills([paint]);
      }

      return ""; // Handle other paint types safely
    });

    return styles.filter((value) => value !== "").join(", ");
  }

  shadow(): this {
    const { node, isJSX } = this;
    if ("effects" in node) {
      const shadow = htmlShadow(node);
      if (shadow) {
        this.addStyles(formatWithJSX("box-shadow", isJSX, htmlShadow(node)));
      }
    }
    return this;
  }

  size(): this {
    const { node, settings } = this;
    const { width, height } = htmlSizePartial(
      node,
      settings.jsx,
      settings.optimizeLayout,
    );

    if (node.type === "TEXT") {
      switch (node.textAutoResize) {
        case "WIDTH_AND_HEIGHT":
          break;
        case "HEIGHT":
          this.addStyles(width);
          break;
        case "NONE":
        case "TRUNCATE":
          this.addStyles(width, height);
          break;
      }
    } else {
      this.addStyles(width, height);
    }

    return this;
  }

  autoLayoutPadding(): this {
    const { node, isJSX, optimizeLayout } = this;
    if ("paddingLeft" in node) {
      this.addStyles(
        ...htmlPadding(
          (optimizeLayout ? node.inferredAutoLayout : null) ?? node,
          isJSX,
        ),
      );
    }
    return this;
  }

  blur() {
    const { node } = this;
    if ("effects" in node && node.effects.length > 0) {
      const blur = node.effects.find(
        (e) => e.type === "LAYER_BLUR" && e.visible,
      );
      if (blur) {
        this.addStyles(
          formatWithJSX(
            "filter",
            this.isJSX,
            `blur(${sliceNum(blur.radius)}px)`,
          ),
        );
      }

      const backgroundBlur = node.effects.find(
        (e) => e.type === "BACKGROUND_BLUR" && e.visible,
      );
      if (backgroundBlur) {
        this.addStyles(
          formatWithJSX(
            "backdrop-filter",
            this.isJSX,
            `blur(${sliceNum(backgroundBlur.radius)}px)`,
          ),
        );
      }
    }
  }

  addData(label: string, value?: string): this {
    const attribute = formatDataAttribute(label, value);
    this.data.push(attribute);
    return this;
  }

  build(additionalStyle: Array<string> = []): string {
    this.addStyles(...additionalStyle);

    let classAttribute = "";
    if (this.name) {
      this.addData("layer", this.name);
      const layerNameClass = stringToClassName(this.name);
      classAttribute = formatClassAttribute(
        layerNameClass === "" ? [] : [layerNameClass],
        this.isJSX,
      );
    }

    const dataAttributes = this.data.join("");
    const styleAttribute = formatStyleAttribute(this.styles, this.isJSX);

    return `${dataAttributes}${classAttribute}${styleAttribute}`;
  }
}
