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
  formatDataAttribute,
  getClassLabel,
} from "../common/commonFormatAttributes";
import { TailwindColorType, TailwindSettings } from "types";

const isNotEmpty = (s: string) => s !== "";
const dropEmptyStrings = (strings: string[]) => strings.filter(isNotEmpty);

export class TailwindDefaultBuilder {
  attributes: string[] = [];
  style: string;
  data: string[];
  styleSeparator: string = "";
  node: SceneNode;
  settings: TailwindSettings;

  get name() {
    return this.settings.showLayerNames ? this.node.name : "";
  }
  get visible() {
    return this.node.visible;
  }
  get isJSX() {
    return this.settings.jsx;
  }
  get optimizeLayout() {
    return this.settings.optimizeLayout;
  }

  constructor(node: SceneNode, settings: TailwindSettings) {
    this.node = node;
    this.settings = settings;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = "";
    this.data = [];
  }

  addAttributes = (...newStyles: string[]) => {
    this.attributes.push(...dropEmptyStrings(newStyles));
  };
  prependAttributes = (...newStyles: string[]) => {
    this.attributes.unshift(...dropEmptyStrings(newStyles));
  };

  blend(): this {
    this.addAttributes(
      tailwindVisibility(this.node),
      tailwindRotation(this.node as LayoutMixin),
      tailwindOpacity(this.node as MinimalBlendMixin),
      tailwindBlendMode(this.node as MinimalBlendMixin),
    );

    return this;
  }

  commonPositionStyles(): this {
    this.size();
    this.autoLayoutPadding();
    this.position();
    this.blend();
    return this;
  }

  commonShapeStyles(): this {
    this.customColor((this.node as MinimalFillsMixin).fills, "bg");
    this.radius();
    this.shadow();
    this.border();
    this.blur();
    return this;
  }

  radius(): this {
    if (this.node.type === "ELLIPSE") {
      this.addAttributes("rounded-full");
    } else {
      this.addAttributes(tailwindBorderRadius(this.node));
    }
    return this;
  }

  border(): this {
    if ("strokes" in this.node) {
      this.addAttributes(tailwindBorderWidth(this.node));
      this.customColor(this.node.strokes, "border");
    }

    return this;
  }

  position(): this {
    const { node, optimizeLayout } = this;

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
  shadow(): this {
    this.addAttributes(...tailwindShadow(this.node as BlendMixin));
    return this;
  }

  // must be called before Position, because of the hasFixedSize attribute.
  size(): this {
    const { node, optimizeLayout } = this;
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

  autoLayoutPadding(): this {
    if ("paddingLeft" in this.node) {
      this.addAttributes(
        ...tailwindPadding(
          (this.optimizeLayout ? this.node.inferredAutoLayout : null) ??
            this.node,
        ),
      );
    }
    return this;
  }

  blur() {
    const { node } = this;
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

  addData(label: string, value?: string): this {
    const attribute = formatDataAttribute(label, value);
    this.data.push(attribute);
    return this;
  }

  build(additionalAttr = ""): string {
    this.addAttributes(additionalAttr);

    if (this.name !== "") {
      this.prependAttributes(stringToClassName(this.name));
    }
    if (this.name) {
      this.addData("layer", this.name);
    }

    const classLabel = getClassLabel(this.isJSX);
    const classNames =
      this.attributes.length > 0
        ? ` ${classLabel}="${this.attributes.join(" ")}"`
        : "";
    const styles = this.style.length > 0 ? ` style="${this.style}"` : "";
    const dataAttributes = this.data.join("");

    return `${dataAttributes}${classNames}${styles}`;
  }

  reset(): void {
    this.attributes = [];
    this.data = [];
    this.style = "";
  }
}
