import { formatWithJSX } from "../common/parseJSX";
import { parentCoordinates } from "../common/parentCoordinates";
import { tailwindShadow } from "./builderImpl/tailwindShadow";
import {
  tailwindVisibility,
  tailwindRotation,
  tailwindOpacity,
} from "./builderImpl/tailwindBlend";
import {
  tailwindBorderWidth,
  tailwindBorderRadius,
} from "./builderImpl/tailwindBorder";
import {
  tailwindColorFromFills,
  tailwindGradientFromFills,
} from "./builderImpl/tailwindColor";
import { tailwindSizePartial } from "./builderImpl/tailwindSize";
import { tailwindPadding } from "./builderImpl/tailwindPadding";
import { commonIsAbsolutePosition } from "../common/commonPosition";

export class TailwindDefaultBuilder {
  attributes: string[] = [];
  style: string;
  styleSeparator: string = "";
  isJSX: boolean;
  visible: boolean;
  name: string = "";

  constructor(node: SceneNode, showLayerName: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = "";
    this.visible = node.visible;

    if (showLayerName) {
      this.name = `${node.name.replace(" ", "")}`;
    }
  }

  addAttributes = (...newStyles: string[]) => {
    this.attributes.push(...newStyles.filter((style) => style !== ""));
  };

  blend(node: SceneNode & SceneNodeMixin & BlendMixin & LayoutMixin): this {
    this.addAttributes(
      tailwindVisibility(node),
      tailwindRotation(node),
      tailwindOpacity(node)
    );

    return this;
  }

  radiusEllipse(node: SceneNode): this {
    if (node.type === "ELLIPSE") {
      this.addAttributes("rounded-full");
    }
    return this;
  }

  radiusRectangle(node: SceneNode & CornerMixin & RectangleCornerMixin): this {
    this.addAttributes(tailwindBorderRadius(node));
    return this;
  }

  border(node: MinimalStrokesMixin): this {
    this.addAttributes(tailwindBorderWidth(node));
    this.customColor(node.strokes, "border");
    return this;
  }

  position(node: SceneNode, parentId: string, isRelative = false): this {
    if (commonIsAbsolutePosition(node, parentId)) {
      this.style += formatWithJSX("left", this.isJSX, node.x);
      this.style += formatWithJSX("top", this.isJSX, node.y);
    } else {
      // this.addAttributes(position);
    }

    // if (position === "absoluteManualLayout" && node.parent) {
    //   // tailwind can't deal with absolute layouts.

    //   if (!("x" in node.parent)) {
    //     return this;
    //   }

    //   const [parentX, parentY] = parentCoordinates(node.parent);

    //   const left = node.x - parentX;
    //   const top = node.y - parentY;

    //   this.style += formatWithJSX("left", this.isJSX, left);
    //   this.style += formatWithJSX("top", this.isJSX, top);

    //   if (!isRelative) {
    //   }
    // } else {
    // this.addAttributes(position);
    // }

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
    if (this.visible) {
      let gradient = "";
      if (kind === "bg") {
        gradient = tailwindGradientFromFills(paint);
      }
      if (gradient) {
        this.addAttributes(gradient);
      } else {
        this.addAttributes(tailwindColorFromFills(paint, kind));
      }
    }
    return this;
  }

  /**
   * https://tailwindcss.com/docs/box-shadow/
   * example: shadow
   */
  shadow(node: BlendMixin): this {
    this.addAttributes(tailwindShadow(node));
    return this;
  }

  // must be called before Position, because of the hasFixedSize attribute.
  widthHeight(node: SceneNode): this {
    // if current element is relative (therefore, children are absolute)
    // or current element is one of the absoltue children and has a width or height > w/h-64

    // if ("isRelative" in node && node.isRelative === true) {
    //   this.style += htmlSizeForTailwind(node, this.isJSX);
    // } else if (
    //   // node.parent?.isRelative === true ||
    //   node.width > 384 ||
    //   node.height > 384
    // ) {
    // to avoid mixing html and tailwind sizing too much, only use html sizing when absolutely necessary.
    // therefore, if only one attribute is larger than 256, only use the html size in there.
    //   const [tailwindWidth, tailwindHeight] = tailwindSizePartial(node);
    //   const [htmlWidth, htmlHeight] = htmlSizePartialForTailwind(
    //     node,
    //     this.isJSX
    //   );

    //   // when textAutoResize is NONE or WIDTH_AND_HEIGHT, it has a defined width.
    //   if (node.type !== "TEXT" || node.textAutoResize !== "WIDTH_AND_HEIGHT") {
    //     if (node.width > 384) {
    //       this.style += htmlWidth;
    //     } else {
    //       this.attributes += tailwindWidth;
    //     }

    //     this.hasFixedSize = htmlWidth !== "";
    //   }

    //   // when textAutoResize is NONE has a defined height.
    //   if (node.type !== "TEXT" || node.textAutoResize === "NONE") {
    //     if (node.width > 384) {
    //       this.style += htmlHeight;
    //     } else {
    //       this.attributes += tailwindHeight;
    //     }

    //     this.hasFixedSize = htmlHeight !== "";
    //   }
    // } else {
    const { width, height } = tailwindSizePartial(node);

    // Width
    this.addAttributes(width);
    this.addAttributes(height);

    // this.hasFixedSize = tailwindWidth !== "" && tailwindHeight !== "";
    // }
    return this;
  }

  autoLayoutPadding(node: BaseFrameMixin): this {
    this.addAttributes(...tailwindPadding(node));
    return this;
  }

  build(additionalAttr = ""): string {
    // this.attributes.unshift(this.name + additionalAttr);

    if (this.style.length > 0) {
      this.style = ` style="${this.style}"`;
    }
    if (!this.attributes.length && !this.style) {
      return "";
    }
    const classOrClassName = this.isJSX ? "className" : "class";
    if (this.attributes.length === 0) {
      return "";
    }

    return ` ${classOrClassName}="${this.attributes.join(" ")}"${this.style}`;
  }

  reset(): void {
    this.attributes = [];
    this.style = "";
  }
}
