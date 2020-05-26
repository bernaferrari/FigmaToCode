import { CodeBuilder } from "../builder_interface";
import {
  mapLetterSpacing,
  convertPxToTailwindAttr,
  mapAbsoluteLineHeight,
  mapFontSize,
  nearestValue,
  mapBorderRadius,
  mapWidthHeightSize,
  retrieveContainerPosition,
} from "./tailwind_wrappers";
import { getContainerSizeProp } from "./tailwind_widget";
import { tailwindColor } from "./tailwind_helpers";

export class tailwindAttributesBuilder implements CodeBuilder {
  attributes: string = "";
  style: string = "";
  isJSX: boolean = false;

  constructor(optAttribute: string = "", optIsJSX: boolean = false) {
    this.attributes = optAttribute;
    this.isJSX = optIsJSX;
  }

  createText(node: TextNode): this {
    return this;
  }

  createContainer(
    node:
      | RectangleNode
      | FrameNode
      | InstanceNode
      | ComponentNode
      | EllipseNode,
    child: string
  ): this {
    return this;
  }

  /**
   * https://tailwindcss.com/docs/opacity/
   * default is [0, 25, 50, 75, 100], but '100' will be ignored:
   * if opacity was changed, let it be visible. Therefore, 98% => 75
   */
  opacity(node: BlendMixin): this {
    if (node.opacity !== 1) {
      const values = [0, 25, 50, 75];
      this.attributes += `opacity-${nearestValue(node.opacity, values)} `;
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/visibility/
   * example: invisible
   */
  visibility(node: SceneNode): this {
    if (!node.visible) {
      this.attributes += `invisible`;
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/rotate/
   * default is [-180, -90, -45, 0, 45, 90, 180], but '0' will be ignored:
   * if rotation was changed, let it be perceived. Therefore, 1 => 45
   */
  rotation(node: LayoutMixin): this {
    // that's how you convert angles to clockwise radians: angle * -pi/180
    // using 3.14159 as Pi for enough precision and to avoid importing math lib.
    if (node.rotation > 0) {
      const array = [-180, -90, -45, 45, 90, 180];
      const nearest = nearestValue(node.rotation, array);
      let minusIfNegative = nearest < 0 ? `-` : ``;

      this.attributes += `${minusIfNegative}rotate-${nearest}}) `;
    }
    return this;
  }

  containerPosition(node: SceneNode, parentId: string): this {
    let position = retrieveContainerPosition(node, parentId);
    if (position === "absoluteManualLayout") {
      // tailwind can't deal with absolute layouts.
      // todo need a way to improve this
      if (this.isJSX) {
        this.style = ` style={{left:${node.x}, top:${node.y}}}`;
      } else {
        this.style = ` style="left:${node.x};top:${node.y}"`;
      }
      position = "";
    } else {
      this.attributes += position;
    }
    return this;
  }

  textInAlign(node: TextNode): this {
    return this;
  }

  textAutoSize(node: TextNode): this {
    return this;
  }

  fontFamily(node: TextNode): this {
    return this;
  }

  /**
   * https://tailwindcss.com/docs/font-size/
   * example: text-md
   */
  fontSize(node: TextNode): this {
    // example: text-md
    if (node.fontSize !== figma.mixed) {
      this.attributes += `text-${convertPxToTailwindAttr(
        node.fontSize,
        mapFontSize
      )} `;
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/font-style/
   * example: font-extrabold
   * example: italic
   */
  fontStyle = (node: TextNode): this => {
    if (node.fontName !== figma.mixed) {
      const lowercaseStyle = node.fontName.style.toLowerCase();

      if (lowercaseStyle.match("italic")) {
        this.attributes += "italic ";
      }

      if (lowercaseStyle.match("regular")) {
        // ignore the font-style when regular (default)
        return this;
      }

      this.attributes += `font-${node.fontName.style
        .replace("italic", "")
        .replace(" ", "")
        .toLowerCase()} `;
    }
    return this;
  };

  /**
   * https://tailwindcss.com/docs/letter-spacing/
   * example: tracking-widest
   */
  letterSpacing = (node: TextNode): this => {
    if (node.letterSpacing !== figma.mixed) {
      if (node.letterSpacing.unit === "PIXELS") {
        this.attributes += `tracking-${convertPxToTailwindAttr(
          node.letterSpacing.value,
          mapLetterSpacing
        )} `;
      } else if (node.letterSpacing.unit === "PERCENT") {
        // todo PERCENT
      }
    }
    return this;
  };

  /**
   * https://tailwindcss.com/docs/line-height/
   * example: leading-3
   */
  lineHeight(node: TextNode): this {
    if (node.lineHeight !== figma.mixed) {
      if (node.lineHeight.unit === "AUTO") {
        // default, ignore
      } else if (node.lineHeight.unit === "PIXELS") {
        this.attributes += `leading-${convertPxToTailwindAttr(
          node.lineHeight.value,
          mapAbsoluteLineHeight
        )} `;
      } else if (node.lineHeight.unit === "PERCENT") {
        // todo add support for relative line height (normal, relaxed, loose, snug, tight).
      }
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-align/
   * example: text-justify
   */
  textAlign(node: TextNode): this {
    // if layoutAlign !== MIN, Text will be wrapped by Align
    // if alignHorizontal is LEFT, don't do anything because that is native
    const alignHorizontal = node.textAlignHorizontal.toString().toLowerCase();

    if (node.layoutAlign === "MIN" && alignHorizontal !== "left") {
      this.attributes += `text-${alignHorizontal} `;
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
    this.attributes += tailwindColor(paint, kind);
    return this;
  }

  /**
   * https://tailwindcss.com/docs/text-transform/
   * example: uppercase
   */
  textTransform(node: TextNode): this {
    if (node.textCase === "LOWER") {
      this.attributes += "lowercase ";
    } else if (node.textCase === "TITLE") {
      this.attributes += "capitalize ";
    } else if (node.textCase === "UPPER") {
      this.attributes += "uppercase ";
    } else if (node.textCase === "ORIGINAL") {
      // default, ignore
    }

    return this;
  }

  /**
   * https://tailwindcss.com/docs/box-shadow/
   * example: shadow
   */
  shadow(node: BlendMixin): this {
    if (node.effects.length > 0) {
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
  borderWidth(node: GeometryMixin): this {
    // [node.strokeWeight] can have a value even when there are no strokes
    if (node.strokes.length > 0 && node.strokeWeight > 0) {
      const array = [2, 4, 8];
      this.attributes += `border-${nearestValue(node.strokeWeight, array)} `;
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/border-radius/
   * example: rounded-sm
   * example: rounded-tr-lg
   */
  borderRadius(
    node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode
  ): this {
    if (node.type === "ELLIPSE") {
      this.attributes += "rounded-full ";
      return this;
    }

    if (node.cornerRadius === 0) {
      // ignore when 0
      return this;
    }

    const border = (value: number): string =>
      convertPxToTailwindAttr(value, mapBorderRadius);

    let comp = "";

    if (node.cornerRadius !== figma.mixed) {
      comp += `rounded-${border(node.cornerRadius)} `;
    } else {
      // todo optimize for tr/tl/br/bl instead of t/r/l/b
      if (node.topLeftRadius !== 0) {
        comp += `rounded-tl-${border(node.topLeftRadius)} `;
      }
      if (node.topRightRadius !== 0) {
        comp += `rounded-tr-${border(node.topRightRadius)} `;
      }
      if (node.bottomLeftRadius !== 0) {
        comp += `rounded-bl-${border(node.bottomLeftRadius)} `;
      }
      if (node.bottomLeftRadius !== 0) {
        comp += `rounded-br-${border(node.bottomRightRadius)} `;
      }
    }

    this.attributes += comp;
    return this;
  }

  /**
   * https://tailwindcss.com/docs/height/
   * example: w-64 h-16
   */
  widthHeight(
    node:
      | DefaultFrameMixin
      | (GeometryMixin & BaseNodeMixin & LayoutMixin & ChildrenMixin)
      | DefaultShapeMixin
  ): this {
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
    this.attributes += additionalAttr;
    this.removeTrailingSpace();

    const classOrClassName = this.isJSX ? "className" : "class";
    return `${classOrClassName}=\"${this.attributes}\"${this.style}`;
  }

  /**
   * https://tailwindcss.com/docs/padding/
   * example: px-2 py-8
   */
  autoLayoutPadding(node: DefaultFrameMixin | DefaultShapeMixin): this {
    // Add padding if necessary!
    // padding is currently only valid for auto layout.
    // todo get padding also for not-auto-layout
    // [horizontalPadding] and [verticalPadding] can have values even when AutoLayout is off
    if ("layoutMode" in node && node.layoutMode !== "NONE") {
      if (node.horizontalPadding > 0) {
        this.attributes += `px-${convertPxToTailwindAttr(
          node.horizontalPadding,
          mapWidthHeightSize
        )} `;
      }

      if (node.verticalPadding > 0) {
        this.attributes += `py-${convertPxToTailwindAttr(
          node.verticalPadding,
          mapWidthHeightSize
        )} `;
      }
    }
    return this;
  }
}
