import { htmlGradient } from "../htmlBuilder/htmlGradient";
import { tailwindShadow } from "./builderImpl/tailwindShadow";
import {
  AltSceneNode,
  AltGeometryMixin,
  AltBlendMixin,
  AltFrameMixin,
  AltDefaultShapeMixin,
} from "../altNodes/altMixins";
import {
  tailwindVisibility,
  tailwindRotation,
  tailwindOpacity,
} from "./builderImpl/tailwindBlend";
import {
  tailwindBorderWidth,
  tailwindBorderRadius,
} from "./builderImpl/tailwindBorder";
import { tailwindPosition } from "./builderImpl/tailwindPosition";
import { tailwindColor } from "./builderImpl/tailwindColor";
import { tailwindSize } from "./builderImpl/tailwindSize";
import { tailwindPadding } from "./builderImpl/tailwindPadding";

export class TailwindDefaultBuilder {
  attributes: string = "";
  style: string;
  styleSeparator: string = "";
  isJSX: boolean;
  visible: boolean;
  name: string = "";

  constructor(optIsJSX: boolean, node: AltSceneNode, showLayerName: boolean) {
    this.isJSX = optIsJSX;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = "";
    this.visible = node.visible;

    if (showLayerName) {
      this.name = node.name.replace(" ", "") + " ";
    }
  }

  blend(node: AltSceneNode): this {
    this.attributes += tailwindVisibility(node);
    this.attributes += tailwindRotation(node);
    this.attributes += tailwindOpacity(node);

    return this;
  }

  border(node: AltGeometryMixin & AltSceneNode): this {
    this.attributes += tailwindBorderWidth(node);
    this.attributes += tailwindBorderRadius(node);
    this.customColor(node.strokes, "border");

    return this;
  }

  position(node: AltSceneNode, parentId: string): this {
    const position = tailwindPosition(node, parentId);

    if (position === "absoluteManualLayout" && node.parent) {
      // tailwind can't deal with absolute layouts.

      const parentX = "layoutMode" in node.parent ? 0 : node.parent.x;
      const parentY = "layoutMode" in node.parent ? 0 : node.parent.y;

      const left = node.x - parentX;
      const top = node.y - parentY;

      // todo is there a way to improve this?
      this.style += `left:${left}px${this.styleSeparator} top:${top}px${this.styleSeparator} `;
      this.attributes += "absolute ";
    } else {
      this.attributes += position;
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-color/
   * example: text-blue-500
   * example: text-opacity-25
   * example: bg-blue-500
   */
  customColor(
    paint: ReadonlyArray<Paint> | PluginAPI["mixed"],
    kind: string
  ): this {
    // visible is true or undefinied (tests)
    if (this.visible !== false) {
      let gradient = "";
      if (kind === "bg") {
        gradient = htmlGradient(paint, this.isJSX);
      }
      if (gradient) {
        this.style += gradient + this.styleSeparator;
      } else {
        this.attributes += tailwindColor(paint, kind);
      }
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/box-shadow/
   * example: shadow
   */
  shadow(node: AltBlendMixin): this {
    this.attributes += tailwindShadow(node);
    return this;
  }

  widthHeight(node: AltSceneNode): this {
    this.attributes += tailwindSize(node);
    return this;
  }

  autoLayoutPadding(node: AltFrameMixin | AltDefaultShapeMixin): this {
    this.attributes += tailwindPadding(node);
    return this;
  }

  removeTrailingSpace(): this {
    if (this.attributes.length > 0 && this.attributes.slice(-1) === " ") {
      this.attributes = this.attributes.slice(0, -1);
    }
    return this;
  }

  build(additionalAttr: string = ""): string {
    this.attributes = this.name + additionalAttr + this.attributes;
    this.removeTrailingSpace();

    if (this.style) {
      if (this.isJSX) {
        this.style = ` style={{${this.style}}}`;
      } else {
        this.style = ` style="${this.style}"`;
      }
    }
    if (!this.attributes && !this.style) {
      return "";
    }
    const classOrClassName = this.isJSX ? "className" : "class";
    return ` ${classOrClassName}="${this.attributes}"${this.style}`;
  }

  reset(): void {
    this.attributes = "";
  }
}
