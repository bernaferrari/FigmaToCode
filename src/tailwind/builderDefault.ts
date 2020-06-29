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
import { pxToLayoutSize } from "./conversionTables";
import { tailwindSize } from "./builderImpl/tailwindSize";
import { tailwindPadding } from "./builderImpl/tailwindPadding";

export class tailwindDefaultBuilder {
  attributes: string = "";
  style: string;
  styleSeparator: string = "";
  isJSX: boolean;
  visible: boolean;
  name: string = "";

  constructor(optIsJSX: boolean, node: AltSceneNode, showLayerName: boolean) {
    this.isJSX = optIsJSX;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = this.isJSX ? " style={{" : ' style="';
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

      // todo need a way to improve this
      this.style += `left:${left}${this.styleSeparator} top:${top}`;
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
      this.attributes += tailwindColor(paint, kind);
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/box-shadow/
   * example: shadow
   */
  shadow(node: AltBlendMixin): this {
    // [when testing] node.effects can be undefined
    if (node.effects && node.effects.length > 0) {
      const drop_shadow: Array<ShadowEffect> = node.effects.filter(
        (d): d is ShadowEffect => d.type === "DROP_SHADOW"
      );
      let boxShadow = "";
      // simple shadow from tailwind
      if (drop_shadow) {
        boxShadow = "shadow";
      }

      const innerShadow =
        node.effects.filter((d): d is ShadowEffect => d.type === "INNER_SHADOW")
          .length > 0
          ? "shadow-inner"
          : "";

      this.attributes += innerShadow;

      // todo customize the shadow

      // if (drop_shadow) {
      //   drop_shadow.forEach((d: ShadowEffect) => {
      //     d.radius;
      //     boxShadow += `BoxShadow(
      //       color: ${rgbTohex(d.color)},
      //       blurRadius: ${d.radius},
      //       offset: Offset(${d.offset.x}, ${d.offset.y}),
      //     ), `;
      //   });
      // }
      // TODO layer blur, shadow-outline
      this.attributes += `${boxShadow} `;
    }

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

    if (this.style.length < 12) {
      this.style = "";
    } else {
      if (this.isJSX) {
        this.style = `${this.style}}}`;
      } else {
        this.style = `${this.style};"`;
      }
    }
    if (!this.attributes && !this.style) {
      return "";
    }
    const classOrClassName = this.isJSX ? "className" : "class";
    return ` ${classOrClassName}="${this.attributes}"${this.style}`;
  }

  reset() {
    this.attributes = "";
  }
}
