import { CSSProperties } from "react";
import {
  AltSceneNode,
  AltGeometryMixin,
  AltBlendMixin,
  AltFrameMixin,
  AltDefaultShapeMixin,
} from "../altMixins";
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
import { htmlSize } from "./builderImpl/htmlSize";
import { htmlBorderRadius } from "./builderImpl/htmlBorderRadius";

export class HtmlDefaultBuilder {
  style: CSSProperties;
  isJSX: boolean;
  visible: boolean;
  name: string = "";
  hasFixedSize = false;

  constructor(node: AltSceneNode, showLayerName: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.style = {};
    this.visible = node.visible;

    if (showLayerName) {
      this.name = node.name.replace(" ", "");
    }
  }

  blend(node: AltSceneNode): this {
    this.style = {
      ...this.style,
      ...htmlVisibility(node),
      ...htmlRotation(node),
      ...htmlOpacity(node),
    };

    return this;
  }

  border(node: AltGeometryMixin & AltSceneNode): this {
    // add border-radius: 10, for example.
    this.style = {
      ...this.style,
      ...htmlBorderRadius(node),
    };

    // add border: 10px solid, for example.
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight > 0) {
      const fill = this.retrieveFill(node.strokes);
      const weight = node.strokeWeight;

      if (node.dashPattern.length > 0) {
        this.style.borderStyle = "dotted";
      } else {
        this.style.borderStyle = "solid";
      }

      this.style.borderWidth = weight;
      this.style.borderStyle = "solid";

      if (fill.kind === "gradient") {
        // Gradient requires these.
        this.style.borderImageSlice = 1;
        this.style.borderImageSource = fill.prop;
      } else {
        this.style.borderColor = fill.prop;
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

      this.style.left = left;
      this.style.top = top;

      if (!isRelative) {
        this.style.position = "absolute";
      }
    } else {
      // todo fix this
      this.style += position;
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

      this.style += formatWithJSX(prop, this.isJSX, fill.prop);
    } else if (fill.kind === "gradient") {
      if (property === "background-color") {
        this.style.backgroundImage = fill.prop;
      } else if (property === "text") {
        this.style.background = fill.prop;
        this.style.WebkitBackgroundClip = "text";
        this.style.WebkitTextFillColor = "transparent";
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
      this.style.boxShadow = htmlShadow(node);
    }
    return this;
  }

  // must be called before Position, because of the hasFixedSize attribute.
  widthHeight(node: AltSceneNode): this {
    // if current element is relative (therefore, children are absolute)
    // or current element is one of the absoltue children and has a width or height > w/h-64
    if ("isRelative" in node && node.isRelative === true) {
      this.style = { ...this.style, ...htmlSize(node) };
    } else {
      const partial = htmlSizePartial(node, this.isJSX);
      this.hasFixedSize = partial[0] !== "" && partial[1] !== "";

      this.style += partial.join("");
    }
    return this;
  }

  autoLayoutPadding(node: AltFrameMixin | AltDefaultShapeMixin): this {
    this.style = { ...this.style, ...htmlPadding(node) };
    return this;
  }

  build(additionalStyle: CSSProperties = {}): string {
    this.style = { ...this.style, ...additionalStyle };

    if (this.name.length > 0) {
      const classOrClassName = this.isJSX ? "className" : "class";
      return ` ${classOrClassName}="${this.name}"${this.style}`;
    } else {
      return this.style;
    }
  }
}
