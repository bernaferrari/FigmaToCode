import { htmlSize, htmlSizePartial } from "./../htmlBuilder/htmlSize";
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
import { tailwindSizePartial } from "./builderImpl/tailwindSize";
import { tailwindPadding } from "./builderImpl/tailwindPadding";
import { parseNumJSX } from "../common/parseJSX";
import { parentCoordinates } from "../common/parentCoordinates";

export class TailwindDefaultBuilder {
  attributes: string = "";
  style: string;
  styleSeparator: string = "";
  isJSX: boolean;
  visible: boolean;
  name: string = "";
  hasFixedSize = false;

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
    const position = tailwindPosition(node, parentId, this.hasFixedSize);

    if (position === "absoluteManualLayout" && node.parent) {
      // tailwind can't deal with absolute layouts.

      const [parentX, parentY] = parentCoordinates(node.parent);

      const left = node.x - parentX;
      const top = node.y - parentY;

      this.style += parseNumJSX("left", "left", this.isJSX, left);
      this.style += parseNumJSX("top", "top", this.isJSX, top);

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

  // must be called before Position, because of the hasFixedSize attribute.
  widthHeight(node: AltSceneNode): this {
    // if current element is relative (therefore, children are absolute)
    // or current element is one of the absoltue children and has a width or height > w/h-64
    if ("isRelative" in node && node.isRelative === true) {
      this.style += htmlSize(node, this.isJSX);
    } else if (
      node.parent?.isRelative === true &&
      (node.width > 256 || node.height > 256)
    ) {
      // to avoid mixing html and tailwind sizing too much, only use html sizing when absolutely necessary.
      // therefore, if only one attribute is larger than 256, only use the html size in there.
      const [tWidth, tHeight] = tailwindSizePartial(node);
      const [hWidth, hHeight] = htmlSizePartial(node, this.isJSX);

      if (node.width > 256) {
        this.style += hWidth;
        this.attributes += tHeight;
        this.hasFixedSize = hWidth !== "";
      }

      if (node.height > 256) {
        this.attributes += tWidth;
        this.style += hHeight;
        this.hasFixedSize = tWidth !== "";
      }
    } else {
      const partial = tailwindSizePartial(node);
      this.hasFixedSize = partial[0] !== "" && partial[1] !== "";

      this.attributes += partial.join("");
    }
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

    if (this.style.length > 0 && this.style.slice(-1) === " ") {
      this.style = this.style.slice(0, -1);
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
