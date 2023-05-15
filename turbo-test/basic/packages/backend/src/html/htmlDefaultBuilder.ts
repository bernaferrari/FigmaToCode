import {
  AltSceneNode,
  AltGeometryMixin,
  AltBlendMixin,
  AltFrameMixin,
  AltDefaultShapeMixin,
} from "../altNodes/altMixins";
import { formatWithJSX } from "../common/parseJSX";
import { parentCoordinates } from "../common/parentCoordinates";
import { htmlShadow } from "./builderImpl/htmlShadow";
import {
  htmlVisibility,
  htmlRotation,
  htmlOpacity,
} from "./builderImpl/htmlBlend";
import { htmlPosition } from "./builderImpl/htmlPosition";
import {
  htmlColorFromFills,
  htmlGradientFromFills,
} from "./builderImpl/htmlColor";
import { htmlPadding } from "./builderImpl/htmlPadding";
import { htmlSize, htmlSizePartial } from "./builderImpl/htmlSize";
import { htmlBorderRadius } from "./builderImpl/htmlBorderRadius";

export class HtmlDefaultBuilder {
  style: Array<string>;
  isJSX: boolean;
  visible: boolean;
  name: string = "";
  hasFixedSize = false;

  constructor(node: AltSceneNode, showLayerName: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.style = [];
    this.visible = node.visible;

    if (showLayerName) {
      this.name = node.name.replace(" ", "");
    }
  }

  blend(node: AltSceneNode): this {
    this.style.push(
      htmlVisibility(node, this.isJSX),
      htmlRotation(node, this.isJSX),
      htmlOpacity(node, this.isJSX)
    );

    return this;
  }

  border(node: AltGeometryMixin & AltSceneNode): this {
    // add border-radius: 10, for example.
    this.style.push(htmlBorderRadius(node, this.isJSX));

    // add border: 10px solid, for example.
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight > 0) {
      const fill = this.retrieveFill(node.strokes);
      const weight = node.strokeWeight;

      if (node.dashPattern.length > 0) {
        this.style.push(formatWithJSX("border-style", this.isJSX, "dotted"));
      } else {
        this.style.push(formatWithJSX("border-style", this.isJSX, "solid"));
      }

      this.style.push(formatWithJSX("border-width", this.isJSX, weight));
      this.style.push(formatWithJSX("border-style", this.isJSX, "solid"));

      if (fill.kind === "gradient") {
        // Gradient requires these.
        this.style.push(
          formatWithJSX("border-image-slice", this.isJSX, 1),
          formatWithJSX("border-image-source", this.isJSX, fill.prop)
        );
      } else {
        this.style.push(formatWithJSX("border-color", this.isJSX, fill.prop));
      }
    }

    return this;
  }

  position(
    node: AltSceneNode,
    parentId: string,
    isRelative: boolean = false
  ): this {
    const position = htmlPosition(node, parentId);

    if (position === "absoluteManualLayout" && node.parent) {
      // tailwind can't deal with absolute layouts.

      const [parentX, parentY] = parentCoordinates(node.parent);

      const left = node.x - parentX;
      const top = node.y - parentY;

      this.style.push(
        formatWithJSX("left", this.isJSX, left),
        formatWithJSX("top", this.isJSX, top)
      );

      if (!isRelative) {
        this.style.push(formatWithJSX("position", this.isJSX, "absolute"));
      }
    } else {
      this.style.push(position);
    }

    return this;
  }

  customColor(
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
    property: "text" | "background-color"
  ): this {
    const fill = this.retrieveFill(paintArray);
    if (fill.kind === "solid") {
      // When text, solid must be outputted as 'color'.
      const prop = property === "text" ? "color" : property;

      this.style.push(formatWithJSX(prop, this.isJSX, fill.prop));
    } else if (fill.kind === "gradient") {
      if (property === "background-color") {
        this.style.push(
          formatWithJSX("background-image", this.isJSX, fill.prop)
        );
      } else if (property === "text") {
        this.style.push(
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
    // visible is true or undefinied (tests)
    if (this.visible) {
      const gradient = htmlGradientFromFills(paintArray);
      if (gradient) {
        return { prop: gradient, kind: "gradient" };
      } else {
        const color = htmlColorFromFills(paintArray);
        if (color) {
          return { prop: color, kind: "solid" };
        }
      }
    }
    return { prop: "", kind: "none" };
  };

  shadow(node: AltBlendMixin): this {
    const shadow = htmlShadow(node);
    if (shadow) {
      this.style.push(
        formatWithJSX("box-shadow", this.isJSX, htmlShadow(node))
      );
    }
    return this;
  }

  // must be called before Position, because of the hasFixedSize attribute.
  widthHeight(node: AltSceneNode): this {
    // if current element is relative (therefore, children are absolute)
    // or current element is one of the absoltue children and has a width or height > w/h-64
    if ("isRelative" in node && node.isRelative === true) {
      this.style.push(htmlSize(node, this.isJSX));
    } else {
      const partial = htmlSizePartial(node, this.isJSX);
      this.hasFixedSize = partial[0] !== "" && partial[1] !== "";

      partial.join("");
    }
    return this;
  }

  autoLayoutPadding(node: AltFrameMixin | AltDefaultShapeMixin): this {
    this.style.push(htmlPadding(node, this.isJSX));
    return this;
  }

  removeTrailingSpace(): this {
    return this;
  }

  build(additionalStyle: Array<string> = []): string {
    this.style.push(...additionalStyle);
    this.removeTrailingSpace();

    let formattedStyle = "";
    if (this.style) {
      if (this.isJSX) {
        formattedStyle = ` style={{${this.style
          .map((s) => s.trim())
          .join(",")}}}`;
      } else {
        formattedStyle = ` style="${this.style.join(";")}"`;
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
