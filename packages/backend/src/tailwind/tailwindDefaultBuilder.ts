import { className, sliceNum } from "./../common/numToAutoFixed";
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
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";

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
      this.attributes.push(className(node.name));
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

  commonPositionStyles(
    node: SceneNode &
      SceneNodeMixin &
      BlendMixin &
      LayoutMixin &
      MinimalBlendMixin,
    optimizeLayout: boolean
  ): this {
    if (node.type === "TEXT") {
      this.textSize(node);
    } else {
      this.size(node);
    }
    this.autoLayoutPadding(node, optimizeLayout);
    this.position(node, optimizeLayout);
    this.blend(node);
    return this;
  }

  commonShapeStyles(node: GeometryMixin & BlendMixin & SceneNode): this {
    this.customColor(node.fills, "bg");

    if (node.type === "ELLIPSE") {
      this.radiusEllipse(node);
    } else {
      this.radiusRectangle(node);
    }

    this.shadow(node);
    this.border(node);
    return this;
  }

  radiusEllipse(node: SceneNode): this {
    if (node.type === "ELLIPSE") {
      this.addAttributes("rounded-full");
    }
    return this;
  }

  radiusRectangle(node: SceneNode): this {
    this.addAttributes(tailwindBorderRadius(node));
    return this;
  }

  border(node: MinimalStrokesMixin): this {
    this.addAttributes(tailwindBorderWidth(node));
    this.customColor(node.strokes, "border");
    return this;
  }

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);
      this.addAttributes(
        `left-[${sliceNum(x)}px]`,
        `top-[${sliceNum(y)}px]`,
        `absolute`
      );
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
    this.addAttributes(...tailwindShadow(node));
    return this;
  }

  // must be called before Position, because of the hasFixedSize attribute.
  size(node: SceneNode): this {
    const { width, height } = tailwindSizePartial(node);
    this.addAttributes(width, height);
    return this;
  }
  // must be called before Position method
  textSize = (node: TextNode): this => {
    const { width, height } = tailwindSizePartial(node);

    if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
      this.addAttributes(width);
    }

    if (node.textAutoResize === "NONE") {
      this.addAttributes(height);
    }

    return this;
  };

  autoLayoutPadding(node: SceneNode, optimizeLayout: boolean): this {
    if ("paddingLeft" in node) {
      this.addAttributes(
        ...tailwindPadding(
          (optimizeLayout ? node.inferredAutoLayout : null) ?? node
        )
      );
    }
    return this;
  }

  build(additionalAttr = ""): string {
    // this.attributes.unshift(this.name + additionalAttr);
    this.addAttributes(additionalAttr);

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
