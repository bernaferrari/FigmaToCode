import {
  AltFrameMixin,
  AltDefaultShapeMixin,
  AltSceneNode,
  AltLayoutMixin,
  AltBlendMixin,
  AltGeometryMixin,
} from "./../common/altMixins";
import { getContainerSizeProp } from "./size";
import { tailwindColor } from "./colors";
import {
  pxToBorderRadius,
  pxToLayoutSize,
  nearestValue,
} from "./conversion_tables";
import { retrieveContainerPosition } from "./position";

export class tailwindAttributesBuilder {
  attributes: string = "";
  style: string = "";
  styleSeparator: string = "";
  isJSX: boolean = false;
  visible: boolean = true;

  constructor(
    optAttribute: string = "",
    optIsJSX: boolean,
    visible: boolean = true
  ) {
    this.attributes = optAttribute;
    this.isJSX = optIsJSX;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = this.isJSX ? " style={{" : ' style="';
    this.visible = visible;
  }

  /**
   * https://tailwindcss.com/docs/opacity/
   * default is [0, 25, 50, 75, 100], but '100' will be ignored:
   * if opacity was changed, let it be visible. Therefore, 98% => 75
   * node.opacity is between [0, 1]; output will be [0, 100]
   */
  opacity(node: BlendMixin): this {
    // [when testing] node.opacity can be undefined
    if (node.opacity !== undefined && node.opacity !== 1) {
      const values = [0, 25, 50, 75];
      this.attributes += `opacity-${nearestValue(node.opacity * 100, values)} `;
    }
    return this;
  }

  blendAttr(node: AltSceneNode): this {
    this.visibility(node);
    this.rotation(node);
    this.opacity(node);

    return this;
  }

  /**
   * https://tailwindcss.com/docs/visibility/
   * example: invisible
   */
  visibility(node: AltSceneNode): this {
    // [when testing] node.visible can be undefined

    // When something is invisible in Figma, it isn't gone. Groups can make use of it.
    // Therefore, instead of changing the visibility (which causes bugs in nested divs),
    // this plugin is going to ignore color and stroke
    if (node.visible !== undefined && !node.visible) {
      this.attributes += "invisible ";
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/rotate/
   * default is [-180, -90, -45, 0, 45, 90, 180], but '0' will be ignored:
   * if rotation was changed, let it be perceived. Therefore, 1 => 45
   */
  rotation(node: AltLayoutMixin): this {
    // that's how you convert angles to clockwise radians: angle * -pi/180
    // using 3.14159 as Pi for enough precision and to avoid importing math lib.
    if (node.rotation !== undefined && node.rotation !== 0) {
      const array = [-180, -90, -45, 45, 90, 180];
      let nearest = nearestValue(node.rotation, array);
      let minusIfNegative = "";
      if (nearest < 0) {
        minusIfNegative = "-";
        nearest = -nearest;
      }

      this.attributes += `${minusIfNegative}rotate-${nearest} `;
    }
    return this;
  }

  containerPosition(node: AltSceneNode, parentId: string): this {
    const position = retrieveContainerPosition(node, parentId);
    if (
      position === "absoluteManualLayout" &&
      node.parent &&
      "width" in node.parent
    ) {
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
    if (this.visible) {
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
      // TODO inner shadow, layer blur
      this.attributes += `${boxShadow} `;
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/border-width/
   * example: border-2
   */
  borderWidth(node: AltGeometryMixin): this {
    // [node.strokeWeight] can have a value even when there are no strokes
    // [when testing] node.effects can be undefined
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight > 0) {
      const array = [1, 2, 4, 8];
      const nearest = nearestValue(node.strokeWeight, array);
      if (nearest === 1) {
        // special case
        this.attributes += `border `;
      } else {
        this.attributes += `border-${nearest} `;
      }
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/border-radius/
   * example: rounded-sm
   * example: rounded-tr-lg
   */
  borderRadius(node: AltSceneNode): this {
    if (node.type === "ELLIPSE") {
      this.attributes += "rounded-full ";
      return this;
    }
    // else if ("cornerRadius" in node && !("topLeftRadius" in node)) {
    //   // probably only used when testing
    //   if (node.cornerRadius !== figma.mixed) {
    //     this.attributes += `rounded-${pxToBorderRadius(node.cornerRadius)} `;
    //   }
    //   return this;
    // }
    else if (!("topLeftRadius" in node)) {
      return this;
    } else if (!node.cornerRadius || node.cornerRadius === 0) {
      // ignore when 0
      return this;
    }

    let comp = "";

    if (node.cornerRadius !== figma.mixed) {
      comp += `rounded${pxToBorderRadius(node.cornerRadius)} `;
    } else {
      // todo optimize for tr/tl/br/bl instead of t/r/l/b
      if (node.topLeftRadius !== 0) {
        comp += `rounded-tl${pxToBorderRadius(node.topLeftRadius)} `;
      }
      if (node.topRightRadius !== 0) {
        comp += `rounded-tr${pxToBorderRadius(node.topRightRadius)} `;
      }
      if (node.bottomLeftRadius !== 0) {
        comp += `rounded-bl${pxToBorderRadius(node.bottomLeftRadius)} `;
      }
      if (node.bottomLeftRadius !== 0) {
        comp += `rounded-br${pxToBorderRadius(node.bottomRightRadius)} `;
      }
    }

    this.attributes += comp;
    return this;
  }

  /**
   * https://tailwindcss.com/docs/height/
   * example: w-64 h-16
   */
  widthHeight(node: AltSceneNode): this {
    this.attributes += getContainerSizeProp(node);
    return this;
  }

  removeTrailingSpace(): this {
    if (this.attributes.length > 0 && this.attributes.slice(-1) === " ") {
      this.attributes = this.attributes.slice(0, -1);
    }
    return this;
  }

  buildAttributes(additionalAttr: string = ""): string {
    this.attributes = additionalAttr + this.attributes;
    this.removeTrailingSpace();
    if (this.style.length < 12) {
      this.style = "";
    } else {
      this.style += this.isJSX ? `}}` : ';"';
    }

    const classOrClassName = this.isJSX ? "className" : "class";
    return `${classOrClassName}=\"${this.attributes}\"${this.style}`;
  }
  /**
   * https://tailwindcss.com/docs/padding/
   * example: px-2 py-8
   */
  autoLayoutPadding(node: AltFrameMixin | AltDefaultShapeMixin): this {
    // Add padding if necessary!
    // padding is currently only valid for auto layout.
    // todo get padding also for not-auto-layout
    // [horizontalPadding] and [verticalPadding] can have values even when AutoLayout is off
    if ("layoutMode" in node && node.layoutMode !== "NONE") {
      if (
        node.horizontalPadding > 0 &&
        node.horizontalPadding === node.verticalPadding
      ) {
        this.attributes += `p-${pxToLayoutSize(node.horizontalPadding)} `;
      } else {
        if (node.horizontalPadding > 0) {
          this.attributes += `px-${pxToLayoutSize(node.horizontalPadding)} `;
        }

        if (node.verticalPadding > 0) {
          this.attributes += `py-${pxToLayoutSize(node.verticalPadding)} `;
        }
      }
    }
    return this;
  }

  reset() {
    this.attributes = "";
  }
}
