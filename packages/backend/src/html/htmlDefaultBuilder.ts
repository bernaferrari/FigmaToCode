import { formatWithJSX } from "../common/parseJSX";
import { htmlShadow } from "./builderImpl/htmlShadow";
import {
  htmlVisibility,
  htmlRotation,
  htmlOpacity,
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
import { className } from "../common/numToAutoFixed";
import { PluginSettings } from "../code";

export class HtmlDefaultBuilder {
  styles: Array<string>;
  isJSX: boolean;
  visible: boolean;
  name: string = "";

  constructor(node: SceneNode, showLayerName: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.styles = [];
    this.visible = node.visible;
    if (showLayerName) {
      this.name = className(node.name);
    }
  }

  commonPositionStyles(
    node: SceneNode & LayoutMixin & MinimalBlendMixin,
    optimizeLayout: boolean
  ): this {
    this.size(node);
    this.autoLayoutPadding(node, optimizeLayout);
    this.position(node, optimizeLayout);
    this.blend(node);
    return this;
  }

  commonShapeStyles(
    node: GeometryMixin & SceneNode,
    localSettings: PluginSettings
  ): this {
    this.customColor(node.fills, "background-color");
    this.shadow(node);
    this.border(node);
    return this;
  }

  addStyles = (...newStyles: string[]) => {
    this.styles.push(...newStyles.filter((style) => style));
  };

  blend(node: SceneNode & LayoutMixin & MinimalBlendMixin): this {
    this.addStyles(
      htmlVisibility(node, this.isJSX),
      ...htmlRotation(node, this.isJSX),
      htmlOpacity(node, this.isJSX)
    );
    return this;
  }

  border(node: GeometryMixin & SceneNode): this {
    this.addStyles(...htmlBorderRadius(node, this.isJSX));
    if (
      node.strokes &&
      node.strokes.length > 0 &&
      node.strokeWeight !== figma.mixed &&
      node.strokeWeight > 0
    ) {
      const fill = this.retrieveFill(node.strokes);
      const weight = node.strokeWeight;
      const borderStyle = node.dashPattern.length > 0 ? "dotted" : "solid";

      if (fill.kind === "gradient") {
        this.addStyles(
          formatWithJSX("border", this.isJSX, `${weight}px ${borderStyle}`)
        );
        this.addStyles(
          formatWithJSX("border-image-slice", this.isJSX, 1),
          formatWithJSX("border-image-source", this.isJSX, fill.prop)
        );
      } else {
        this.addStyles(
          formatWithJSX(
            "border",
            this.isJSX,
            `${weight}px ${borderStyle} ${fill.prop}`
          )
        );
      }
    }
    return this;
  }

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);

      this.addStyles(
        formatWithJSX("left", this.isJSX, x),
        formatWithJSX("top", this.isJSX, y),
        formatWithJSX("position", this.isJSX, "absolute")
      );
    }

    return this;
  }

  customColor(
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
    property: "text" | "background-color"
  ): this {
    const fill = this.retrieveFill(paintArray);

    if (fill.kind === "solid") {
      const prop = property === "text" ? "color" : property;
      this.addStyles(formatWithJSX(prop, this.isJSX, fill.prop));
    } else if (fill.kind === "gradient") {
      this.applyGradientStyle(fill, property);
    }

    return this;
  }

  applyGradientStyle(
    fill: { prop: string; kind: "solid" | "gradient" | "none" },
    property: "text" | "background-color"
  ) {
    if (property === "background-color") {
      this.addStyles(formatWithJSX("background-image", this.isJSX, fill.prop));
    } else if (property === "text") {
      this.addStyles(
        formatWithJSX("background", this.isJSX, fill.prop),
        formatWithJSX("-webkit-background-clip", this.isJSX, "text"),
        formatWithJSX("-webkit-text-fill-color", this.isJSX, "transparent")
      );
    }
  }

  retrieveFill(paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"]): {
    prop: string;
    kind: "solid" | "gradient" | "none";
  } {
    if (this.visible) {
      const gradient = htmlGradientFromFills(paintArray);
      if (gradient) {
        return { prop: gradient, kind: "gradient" };
      }

      const color = htmlColorFromFills(paintArray);
      if (color) {
        return { prop: color, kind: "solid" };
      }
    }
    return { prop: "", kind: "none" };
  }

  shadow(node: SceneNode): this {
    if ("effects" in node) {
      const shadow = htmlShadow(node);
      if (shadow) {
        this.addStyles(
          formatWithJSX("box-shadow", this.isJSX, htmlShadow(node))
        );
      }
    }
    return this;
  }

  size(node: SceneNode): this {
    const { width, height } = htmlSizePartial(node, this.isJSX);

    if (node.type === "TEXT") {
      switch (node.textAutoResize) {
        case "WIDTH_AND_HEIGHT":
          this.addStyles(width, height);
          break;
        case "HEIGHT":
          this.addStyles(height);
          break;
        case "NONE":
          break;
      }
    } else {
      this.addStyles(width, height);
    }

    return this;
  }

  autoLayoutPadding(node: SceneNode, optimizeLayout: boolean): this {
    if ("paddingLeft" in node) {
      this.addStyles(...htmlPadding(node, this.isJSX, optimizeLayout));
    }
    return this;
  }

  build(additionalStyle: Array<string> = []): string {
    this.addStyles(...additionalStyle);

    const formattedStyles = this.styles.map((s) => s.trim());
    let formattedStyle = "";
    if (this.styles.length > 0) {
      if (this.isJSX) {
        formattedStyle = ` style={{${formattedStyles.join(", ")}}}`;
      } else {
        formattedStyle = ` style="${formattedStyles.join("; ")}"`;
      }
    }
    if (this.name.length > 0) {
      const classOrClassName = this.isJSX ? "className" : "class";
      return ` ${classOrClassName}="${this.name}"${formattedStyle}`;
    } else {
      return formattedStyle;
    }
  }
}
