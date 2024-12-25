import { stringToClassName, sliceNum } from "./../common/numToAutoFixed";
import { tailwindShadow } from "./builderImpl/tailwindShadow";
import {
  tailwindVisibility,
  tailwindRotation,
  tailwindOpacity,
  tailwindBlendMode,
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
import { pxToBlur } from "./conversionTables";
import {
  getClassLabel,
  formatStyleAttribute,
} from "../common/commonFormatAttributes";
import { TailwindColorType } from "types";

const isNotEmpty = (s: string) => s !== "";
const dropEmptyStrings = (strings: string[]) => strings.filter(isNotEmpty);

export class TailwindDefaultBuilder {
  attributes: string[] = [];
  style: string;
  styleSeparator: string = "";
  isJSX: boolean;
  visible: boolean;
  name: string;

  constructor(node: SceneNode, showLayerNames: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = "";
    this.visible = node.visible;
    this.name = showLayerNames ? node.name : "";

    /*
    if (showLayerNames) {
      this.attributes.push(className(node.name));
    }
    */
  }

  addAttributes = (...newStyles: string[]) => {
    this.attributes.push(...dropEmptyStrings(newStyles));
  };
  prependAttributes = (...newStyles: string[]) => {
    this.attributes.unshift(...dropEmptyStrings(newStyles));
  };

  blend(
    node: SceneNode & SceneNodeMixin & MinimalBlendMixin & LayoutMixin,
  ): this {
    this.addAttributes(
      tailwindVisibility(node),
      tailwindRotation(node),
      tailwindOpacity(node),
      tailwindBlendMode(node),
    );

    return this;
  }

  commonPositionStyles(
    node: SceneNode &
      SceneNodeMixin &
      BlendMixin &
      LayoutMixin &
      MinimalBlendMixin,
    optimizeLayout: boolean,
  ): this {
    this.size(node, optimizeLayout);
    this.autoLayoutPadding(node, optimizeLayout);
    this.position(node, optimizeLayout);
    this.blend(node);
    return this;
  }

  commonShapeStyles(node: GeometryMixin & BlendMixin & SceneNode): this {
    this.customColor(node.fills, "bg");
    this.radius(node);
    this.shadow(node);
    this.border(node);
    this.blur(node);
    return this;
  }

  radius(node: SceneNode): this {
    if (node.type === "ELLIPSE") {
      this.addAttributes("rounded-full");
    } else {
      this.addAttributes(tailwindBorderRadius(node));
    }
    return this;
  }

  border(node: SceneNode): this {
    if ("strokes" in node) {
      this.addAttributes(tailwindBorderWidth(node));
      this.customColor(node.strokes, "border");
    }

    return this;
  }

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);

      const parsedX = sliceNum(x);
      const parsedY = sliceNum(y);
      if (parsedX === "0") {
        this.addAttributes(`left-0`);
      } else {
        this.addAttributes(`left-[${parsedX}px]`);
      }
      if (parsedY === "0") {
        this.addAttributes(`top-0`);
      } else {
        this.addAttributes(`top-[${parsedY}px]`);
      }

      this.addAttributes(`absolute`);
    } else if (
      node.type === "GROUP" ||
      ("layoutMode" in node &&
        ((optimizeLayout ? node.inferredAutoLayout : null) ?? node)
          ?.layoutMode === "NONE")
    ) {
      this.addAttributes("relative");
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
    kind: TailwindColorType,
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
  size(node: SceneNode, optimizeLayout: boolean): this {
    const { width, height } = tailwindSizePartial(node, optimizeLayout);

    if (node.type === "TEXT") {
      switch (node.textAutoResize) {
        case "WIDTH_AND_HEIGHT":
          break;
        case "HEIGHT":
          this.addAttributes(width);
          break;
        case "NONE":
        case "TRUNCATE":
          this.addAttributes(width, height);
          break;
      }
    } else {
      this.addAttributes(width, height);
    }

    return this;
  }

  autoLayoutPadding(node: SceneNode, optimizeLayout: boolean): this {
    if ("paddingLeft" in node) {
      this.addAttributes(
        ...tailwindPadding(
          (optimizeLayout ? node.inferredAutoLayout : null) ?? node,
        ),
      );
    }
    return this;
  }

  blur(node: SceneNode) {
    if ("effects" in node && node.effects.length > 0) {
      const blur = node.effects.find((e) => e.type === "LAYER_BLUR");
      if (blur) {
        const blurValue = pxToBlur(blur.radius);
        if (blurValue) {
          this.addAttributes(
            blurValue === "blur" ? "blur" : `blur-${blurValue}`,
          ); // If blur value is 8, it will be "blur". Otherwise, it will be "blur-sm", "blur-md", etc. or "blur-[Xpx]"
        }
      }

      const backgroundBlur = node.effects.find(
        (e) => e.type === "BACKGROUND_BLUR",
      );
      if (backgroundBlur) {
        const backgroundBlurValue = pxToBlur(backgroundBlur.radius);
        if (backgroundBlurValue) {
          this.addAttributes(
            `backdrop-blur${
              backgroundBlurValue ? `-${backgroundBlurValue}` : ""
            }`,
          );
        }
      }
    }
  }

  build(additionalAttr = ""): string {
    this.addAttributes(additionalAttr);

    if (this.name !== "") {
      this.prependAttributes(stringToClassName(this.name));
    }
    const layerName = this.name ? ` data-layer="${this.name}"` : "";

    const classLabel = getClassLabel(this.isJSX);
    const classNames =
      this.attributes.length > 0
        ? ` ${classLabel}="${this.attributes.join(" ")}"`
        : "";
    const styles = this.style.length > 0 ? ` style="${this.style}"` : "";

    return `${layerName}${classNames}${styles}`;
  }

  reset(): void {
    this.attributes = [];
    this.style = "";
  }
}
