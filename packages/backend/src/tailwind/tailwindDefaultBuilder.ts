import {
  stringToClassName,
  numberToFixedString,
} from "./../common/numToAutoFixed";
import { tailwindShadow } from "./builderImpl/tailwindShadow";
import {
  tailwindVisibility,
  tailwindRotation,
  tailwindOpacity,
  tailwindBlendMode,
  tailwindBackgroundBlendMode,
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
import { MinimalFillsTrait, MinimalStrokesTrait, Paint } from "../api_types";

const isNotEmpty = (s: string) => s !== "" && s !== null && s !== undefined;
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
    return this.node.visible ?? true;
  }
  get isJSX() {
    return this.settings.tailwindGenerationMode === "jsx";
  }

  constructor(node: SceneNode, settings: TailwindSettings) {
    this.node = node;
    this.settings = settings;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = "";
    this.data = [];
  }

  addAttributes = (...newStyles: string[]) => {
    // Filter out empty strings and trim any extra spaces
    const cleanedStyles = dropEmptyStrings(newStyles).map((s) => s.trim());
    this.attributes.push(...cleanedStyles);
  };

  prependAttributes = (...newStyles: string[]) => {
    // Filter out empty strings and trim any extra spaces
    const cleanedStyles = dropEmptyStrings(newStyles).map((s) => s.trim());
    this.attributes.unshift(...cleanedStyles);
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
    this.customColor((this.node as MinimalFillsTrait).fills, "bg");
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
      const { isOutline, property } = tailwindBorderWidth(this.node);
      this.addAttributes(property);
      this.customColor(
        this.node.strokes as MinimalStrokesTrait,
        isOutline ? "outline" : "border",
      );
    }

    return this;
  }

  position(): this {
    const { node } = this;
    if (commonIsAbsolutePosition(node)) {
      const { x, y } = getCommonPositionValue(node, this.settings);

      const parsedX = numberToFixedString(x);
      const parsedY = numberToFixedString(y);
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
    } else if (node.type === "GROUP" || (node as any).isRelative) {
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
  customColor(paint: ReadonlyArray<Paint>, kind: TailwindColorType): this {
    if (this.visible) {
      let gradient = "";
      if (kind === "bg") {
        gradient = tailwindGradientFromFills(paint);

        // Add background blend mode class if applicable
        const blendModeClass = tailwindBackgroundBlendMode(paint);
        if (blendModeClass) {
          this.addAttributes(blendModeClass);
        }
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
    const { node, settings } = this;
    const { width, height, constraints } = tailwindSizePartial(node, settings);

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

    // Add any min/max constraints
    if (constraints) {
      this.addAttributes(constraints);
    }

    return this;
  }

  autoLayoutPadding(): this {
    if ("paddingLeft" in this.node) {
      this.addAttributes(...tailwindPadding(this.node));
    }
    return this;
  }

  blur() {
    const { node } = this;
    if ("effects" in node && node.effects.length > 0) {
      const blur = node.effects.find(
        (e) => e.type === "LAYER_BLUR" && e.visible,
      );
      if (blur) {
        const blurValue = pxToBlur(blur.radius / 2);
        if (blurValue) {
          this.addAttributes(
            blurValue === "blur" ? "blur" : `blur-${blurValue}`,
          ); // If blur value is 8, it will be "blur". Otherwise, it will be "blur-sm", "blur-md", etc. or "blur-[Xpx]"
        }
      }

      const backgroundBlur = node.effects.find(
        (e) => e.type === "BACKGROUND_BLUR" && e.visible,
      );
      if (backgroundBlur) {
        const backgroundBlurValue = pxToBlur(backgroundBlur.radius / 2);
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
    if (additionalAttr) {
      this.addAttributes(additionalAttr);
    }

    if (this.name !== "") {
      this.prependAttributes(stringToClassName(this.name));
    }
    if (this.name) {
      this.addData("layer", this.name.trim());
    }

    if ("componentProperties" in this.node && this.node.componentProperties) {
      Object.entries(this.node.componentProperties)
        ?.map((prop) => {
          if (prop[1].type === "VARIANT" || prop[1].type === "BOOLEAN") {
            const cleanName = prop[0]
              .split("#")[0]
              .replace(/\s+/g, "-")
              .toLowerCase();

            return formatDataAttribute(cleanName, String(prop[1].value));
          }
          return "";
        })
        .filter(Boolean)
        .sort()
        .forEach((d) => this.data.push(d));
    }

    const classLabel = getClassLabel(this.isJSX);
    const classNames =
      this.attributes.length > 0
        ? ` ${classLabel}="${this.attributes.filter(Boolean).join(" ")}"`
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
