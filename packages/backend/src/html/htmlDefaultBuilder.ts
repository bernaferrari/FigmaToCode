import { formatWithJSX } from "../common/parseJSX";
import { htmlShadow } from "./builderImpl/htmlShadow";
import {
  htmlVisibility,
  htmlRotation,
  htmlOpacity,
  htmlBlendMode,
} from "./builderImpl/htmlBlend";
import {
  buildBackgroundValues,
  htmlColorFromFills,
} from "./builderImpl/htmlColor";
import { htmlPadding } from "./builderImpl/htmlPadding";
import { htmlSizePartial } from "./builderImpl/htmlSize";
import { htmlBorderRadius } from "./builderImpl/htmlBorderRadius";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import {
  numberToFixedString,
  stringToClassName,
} from "../common/numToAutoFixed";
import { commonStroke } from "../common/commonStroke";
import {
  formatClassAttribute,
  formatDataAttribute,
  formatStyleAttribute,
} from "../common/commonFormatAttributes";
import { HTMLSettings } from "types";
import {
  cssCollection,
  generateUniqueClassName,
  stylesToCSS,
} from "./htmlMain";

export class HtmlDefaultBuilder {
  styles: Array<string>;
  data: Array<string>;
  node: SceneNode;
  settings: HTMLSettings;
  cssClassName: string | null = null;

  get name() {
    if (this.settings.htmlGenerationMode === "styled-components") {
      return this.settings.showLayerNames
        ? (this.node as any).uniqueName || this.node.name
        : "";
    }
    return this.settings.showLayerNames ? this.node.name : "";
  }

  get visible() {
    return this.node.visible;
  }

  get isJSX() {
    return this.settings.htmlGenerationMode === "jsx";
  }

  get exportCSS() {
    return this.settings.htmlGenerationMode === "svelte";
  }

  get useStyledComponents() {
    return this.settings.htmlGenerationMode === "styled-components";
  }

  get useInlineStyles() {
    return (
      this.settings.htmlGenerationMode === "html" ||
      this.settings.htmlGenerationMode === "jsx"
    );
  }

  // Get the appropriate HTML element based on node type
  get htmlElement(): string {
    if (this.node.type === "TEXT") return "p";
    return "div";
  }

  constructor(node: SceneNode, settings: HTMLSettings) {
    this.node = node;
    this.settings = settings;
    this.styles = [];
    this.data = [];

    // For both Svelte and styled-components, use sequential class names
    if (
      this.settings.htmlGenerationMode === "svelte" ||
      this.settings.htmlGenerationMode === "styled-components"
    ) {
      // Use uniqueName (which already has _01, _02 suffixes) if available
      let baseClassName =
        (this.node as any).uniqueName ||
        this.node.name ||
        this.node.type.toLowerCase();

      // Clean the name and create a valid CSS class name
      baseClassName = baseClassName
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      // Make sure it's valid
      if (!/^[a-z]/i.test(baseClassName)) {
        baseClassName = `${this.node.type.toLowerCase()}-${baseClassName}`;
      }

      // Generate unique class name with simple counter suffix
      this.cssClassName = generateUniqueClassName(baseClassName);
    }
  }

  commonPositionStyles(): this {
    this.size();
    this.autoLayoutPadding();
    this.position();
    this.blend();
    return this;
  }

  commonShapeStyles(): this {
    if ("fills" in this.node) {
      this.applyFillsToStyle(
        this.node.fills,
        this.node.type === "TEXT" ? "text" : "background",
      );
    }
    this.shadow();
    this.border(this.settings);
    this.blur();
    return this;
  }

  addStyles = (...newStyles: string[]) => {
    this.styles.push(...newStyles.filter((style) => style));
  };

  blend(): this {
    const { node, isJSX } = this;
    this.addStyles(
      htmlVisibility(node, isJSX),
      ...htmlRotation(node as LayoutMixin, isJSX),
      htmlOpacity(node as MinimalBlendMixin, isJSX),
      htmlBlendMode(node as MinimalBlendMixin, isJSX),
    );
    return this;
  }

  border(settings: HTMLSettings): this {
    const { node } = this;
    this.addStyles(...htmlBorderRadius(node, this.isJSX));

    const commonBorder = commonStroke(node);
    if (!commonBorder) {
      return this;
    }

    const strokes = ("strokes" in node && node.strokes) || undefined;
    const color = htmlColorFromFills(strokes as any);
    if (!color) {
      return this;
    }
    const borderStyle =
      "dashPattern" in node && node.dashPattern.length > 0 ? "dotted" : "solid";

    const strokeAlign = "strokeAlign" in node ? node.strokeAlign : "INSIDE";

    // Function to create border value string
    const consolidateBorders = (border: number): string =>
      [`${numberToFixedString(border)}px`, color, borderStyle]
        .filter((d) => d)
        .join(" ");

    if ("all" in commonBorder) {
      if (commonBorder.all === 0) {
        return this;
      }
      const weight = commonBorder.all;

      if (
        strokeAlign === "CENTER" ||
        strokeAlign === "OUTSIDE" ||
        node.type === "FRAME" ||
        node.type === "INSTANCE" ||
        node.type === "COMPONENT"
      ) {
        this.addStyles(
          formatWithJSX("outline", this.isJSX, consolidateBorders(weight)),
        );
        if (strokeAlign === "CENTER") {
          this.addStyles(
            formatWithJSX(
              "outline-offset",
              this.isJSX,
              `${numberToFixedString(-weight / 2)}px`,
            ),
          );
        } else if (strokeAlign === "INSIDE") {
          this.addStyles(
            formatWithJSX(
              "outline-offset",
              this.isJSX,
              `${numberToFixedString(-weight)}px`,
            ),
          );
        }
      } else {
        // Default: use regular border on autolayout + strokeAlign: inside
        this.addStyles(
          formatWithJSX("border", this.isJSX, consolidateBorders(weight)),
        );
      }
    } else {
      // For non-uniform borders, always use individual border properties
      if (commonBorder.left !== 0) {
        this.addStyles(
          formatWithJSX(
            "border-left",
            this.isJSX,
            consolidateBorders(commonBorder.left),
          ),
        );
      }
      if (commonBorder.top !== 0) {
        this.addStyles(
          formatWithJSX(
            "border-top",
            this.isJSX,
            consolidateBorders(commonBorder.top),
          ),
        );
      }
      if (commonBorder.right !== 0) {
        this.addStyles(
          formatWithJSX(
            "border-right",
            this.isJSX,
            consolidateBorders(commonBorder.right),
          ),
        );
      }
      if (commonBorder.bottom !== 0) {
        this.addStyles(
          formatWithJSX(
            "border-bottom",
            this.isJSX,
            consolidateBorders(commonBorder.bottom),
          ),
        );
      }
    }
    return this;
  }

  position(): this {
    const { node, isJSX } = this;
    const isAbsolutePosition = commonIsAbsolutePosition(node);
    if (isAbsolutePosition) {
      const { x, y } = getCommonPositionValue(node, this.settings);

      this.addStyles(
        formatWithJSX("left", isJSX, x),
        formatWithJSX("top", isJSX, y),
        formatWithJSX("position", isJSX, "absolute"),
      );
    } else {
      if (node.type === "GROUP" || (node as any).isRelative) {
        this.addStyles(formatWithJSX("position", isJSX, "relative"));
      }
    }

    return this;
  }

  applyFillsToStyle(
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
    property: "text" | "background",
  ): this {
    if (property === "text") {
      this.addStyles(
        formatWithJSX(
          "text",
          this.isJSX,
          htmlColorFromFills(paintArray as any),
        ),
      );
      return this;
    }

    const backgroundValues = buildBackgroundValues(paintArray as any);
    if (backgroundValues) {
      this.addStyles(formatWithJSX("background", this.isJSX, backgroundValues));

      // Add blend mode property if multiple fills exist with different blend modes
      if (paintArray !== figma.mixed) {
        const blendModes = this.buildBackgroundBlendModes(paintArray);
        if (blendModes) {
          this.addStyles(
            formatWithJSX("background-blend-mode", this.isJSX, blendModes),
          );
        }
      }
    }

    return this;
  }

  buildBackgroundBlendModes(paintArray: ReadonlyArray<Paint>): string {
    if (
      paintArray.length === 0 ||
      paintArray.every(
        (d) => d.blendMode === "NORMAL" || d.blendMode === "PASS_THROUGH",
      )
    ) {
      return "";
    }

    // Reverse the array to match the background order
    const blendModes = [...paintArray].reverse().map((paint) => {
      if (paint.blendMode === "PASS_THROUGH") {
        return "normal";
      }

      return paint.blendMode?.toLowerCase();
    });

    return blendModes.join(", ");
  }

  shadow(): this {
    const { node, isJSX } = this;
    if ("effects" in node) {
      const shadow = htmlShadow(node);
      if (shadow) {
        this.addStyles(formatWithJSX("box-shadow", isJSX, htmlShadow(node)));
      }
    }
    return this;
  }

  size(): this {
    const { node, settings } = this;
    const { width, height, constraints } = htmlSizePartial(
      node,
      settings.htmlGenerationMode === "jsx",
    );

    if (node.type === "TEXT") {
      switch (node.textAutoResize) {
        case "WIDTH_AND_HEIGHT":
          break;
        case "HEIGHT":
          this.addStyles(width);
          break;
        case "NONE":
        case "TRUNCATE":
          this.addStyles(width, height);
          break;
      }
    } else {
      this.addStyles(width, height);
    }

    // Add constraints as separate styles
    if (constraints.length > 0) {
      this.addStyles(...constraints);
    }

    return this;
  }

  autoLayoutPadding(): this {
    const { node, isJSX } = this;
    if ("paddingLeft" in node) {
      this.addStyles(...htmlPadding(node, isJSX));
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
        this.addStyles(
          formatWithJSX(
            "filter",
            this.isJSX,
            `blur(${numberToFixedString(blur.radius / 2)}px)`,
          ),
        );
      }

      const backgroundBlur = node.effects.find(
        (e) => e.type === "BACKGROUND_BLUR" && e.visible,
      );
      if (backgroundBlur) {
        this.addStyles(
          formatWithJSX(
            "backdrop-filter",
            this.isJSX,
            `blur(${numberToFixedString(backgroundBlur.radius / 2)}px)`,
          ),
        );
      }
    }
  }

  addData(label: string, value?: string): this {
    const attribute = formatDataAttribute(label, value);
    this.data.push(attribute);
    return this;
  }

  build(additionalStyle: Array<string> = []): string {
    this.addStyles(...additionalStyle);

    // Different handling based on generation mode
    const mode = this.settings.htmlGenerationMode || "html";

    // Early return for styled-components with no other attributes
    if (
      mode === "styled-components" &&
      !this.data.length &&
      this.styles.length > 0 &&
      this.cssClassName
    ) {
      this.storeStyles();
      return ""; // Return empty string as we're using the component directly
    }

    let classNames: string[] = [];
    if (this.name) {
      this.addData("layer", this.name.trim());

      if (mode !== "svelte" && mode !== "styled-components") {
        const layerNameClass = stringToClassName(this.name.trim());
        if (layerNameClass !== "") {
          classNames.push(layerNameClass);
        }
      }
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

    // For Svelte mode, we use classes
    if (mode === "svelte" && this.styles.length > 0 && this.cssClassName) {
      classNames.push(this.cssClassName);
      this.storeStyles();
      this.styles = []; // Clear inline styles for Svelte
    }
    // For styled-components, we need the class but keep styles for the component
    else if (
      mode === "styled-components" &&
      this.styles.length > 0 &&
      this.cssClassName
    ) {
      classNames.push(this.cssClassName);
      this.storeStyles();
      // Keep styles for styled-components
    }

    const dataAttributes = this.data.join("");

    // Class attributes
    const classAttribute =
      mode === "styled-components"
        ? formatClassAttribute(
            classNames.filter((c) => c !== this.cssClassName),
            this.isJSX,
          )
        : formatClassAttribute(classNames, this.isJSX);

    // Style attribute
    const styleAttribute = formatStyleAttribute(this.styles, this.isJSX);

    return `${dataAttributes}${classAttribute}${styleAttribute}`;
  }

  // Extract style storage into a method to avoid duplication
  private storeStyles(): void {
    if (!this.cssClassName || this.styles.length === 0) return;

    // Convert to CSS format if needed
    const cssStyles = stylesToCSS(this.styles, this.isJSX);

    // Both modes use the standard div/span elements, no need for semantic HTML inference
    // which causes conflicts with duplicate tag selectors
    let element = this.node.type === "TEXT" ? "p" : "div";

    // Only override for really obvious cases
    if ((this.node as any).name?.toLowerCase().includes("button")) {
      element = "button";
    } else if (
      (this.node as any).name?.toLowerCase().includes("img") ||
      (this.node as any).name?.toLowerCase().includes("image")
    ) {
      element = "img";
    }

    cssCollection[this.cssClassName] = {
      styles: cssStyles,
      nodeName:
        (this.node as any).uniqueName ||
        this.node.name?.replace(/[^a-zA-Z0-9]/g, "") ||
        undefined,
      nodeType: this.node.type,
      element: element,
    };
  }
}
