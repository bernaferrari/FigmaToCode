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
import { commonIsAbsolutePosition } from "../common/commonPosition";

export class HtmlDefaultBuilder {
  styles: Array<string>;
  isJSX: boolean;
  visible: boolean;
  name: string = "";
  hasFixedSize = false;

  constructor(node: SceneNode, showLayerName: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.styles = [];
    this.visible = node.visible;
    if (showLayerName) this.name = node.name.replace(" ", "");
  }

  commonPositionStyles(
    node: SceneNode & LayoutMixin & MinimalBlendMixin
  ): this {
    this.widthHeight(node);
    this.autoLayoutPadding(node);
    this.position(node);
    this.blend(node);
    return this;
  }

  commonShapeStyles(node: GeometryMixin & BlendMixin & SceneNode): this {
    this.customColor(node.fills, "background-color");
    this.shadow(node);
    this.border(node);
    if ("clipsContent" in node && node.clipsContent === true) {
      this.addStyles(formatWithJSX("overflow", this.isJSX, "hidden"));
    }
    return this;
  }

  addStyles = (...newStyles: string[]) => {
    this.styles.push(...newStyles.filter((style) => style !== ""));
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
    this.addStyles(htmlBorderRadius(node, this.isJSX));
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

  position(node: SceneNode): this {
    if (commonIsAbsolutePosition(node)) {
      this.addStyles(
        formatWithJSX("left", this.isJSX, node.x),
        formatWithJSX("top", this.isJSX, node.y),
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
      if (property === "background-color") {
        this.addStyles(
          formatWithJSX("background-image", this.isJSX, fill.prop)
        );
      } else if (property === "text") {
        this.addStyles(
          formatWithJSX("background", this.isJSX, fill.prop),
          formatWithJSX("-webkit-background-clip", this.isJSX, "text"),
          formatWithJSX("-webkit-text-fill-color", this.isJSX, "transparent")
        );
      }
    }
    return this;
  }

  retrieveFill = (
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"]
  ): { prop: string; kind: "solid" | "gradient" | "none" } => {
    if (this.visible) {
      const gradient = htmlGradientFromFills(paintArray);
      if (gradient) return { prop: gradient, kind: "gradient" };

      const color = htmlColorFromFills(paintArray);
      if (color) return { prop: color, kind: "solid" };
    }
    return { prop: "", kind: "none" };
  };

  shadow(node: BlendMixin): this {
    const shadow = htmlShadow(node);
    if (shadow) {
      this.addStyles(formatWithJSX("box-shadow", this.isJSX, htmlShadow(node)));
    }
    return this;
  }

  widthHeight(node: SceneNode): this {
    const partial = htmlSizePartial(node, this.isJSX);
    this.hasFixedSize = partial.width !== "" && partial.height !== "";
    this.addStyles(partial.width, partial.height);
    return this;
  }

  autoLayoutPadding(node: SceneNode): this {
    if ("paddingLeft" in node) {
      this.addStyles(...htmlPadding(node, this.isJSX));
    }
    return this;
  }

  removeTrailingSpace(): this {
    return this;
  }

  build(additionalStyle: Array<string> = []): string {
    this.addStyles(...additionalStyle);
    this.removeTrailingSpace();

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
