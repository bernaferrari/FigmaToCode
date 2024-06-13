import { className, sliceNum } from "./../common/numToAutoFixed";
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
    tailwindColorForNodePaint,
  tailwindGradient as tailwindGradientForNodePaint,
} from "./builderImpl/tailwindColor";
import { tailwindSizePartial } from "./builderImpl/tailwindSize";
import { tailwindPadding } from "./builderImpl/tailwindPadding";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import { pxToBlur } from "./conversionTables";
import { SupportedNodeForPaintStyle, nodePaintStyle } from "../common/commonStyles.js";
import { retrieveTopFill } from "../common/retrieveFill.js";
import { variableNameFromAliasIfAny } from "../common/commonVariables.js";
import { gradientAngle } from "../common/color.js";


export interface NodePaintAgg {
  name?: string // either a tailwind compliant paint style name or from a variable name
  opacity?: number // unavailable for gradient
  solid?: RGB | RGBA
  gradient?: GradientDef
}

export interface GenSolidPaint extends NodePaintAgg {
  gradient?: never
  solid: RGB
}

export interface GradientDef {
  gradientAngle: number
  stops: GenGradientStop[]
}
export interface GenGradientStop extends GenSolidPaint {
  opacity?: never
  solid: RGBA
}

type RequiredKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export interface GenGradientPaint extends RequiredKey<NodePaintAgg, "gradient"> {
  solid?: never
}
type NodePaint = GenSolidPaint | GenGradientPaint

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

  blend(
    node: SceneNode & SceneNodeMixin & MinimalBlendMixin & LayoutMixin
  ): this {
    this.addAttributes(
      tailwindVisibility(node),
      tailwindRotation(node),
      tailwindOpacity(node),
      tailwindBlendMode(node)
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
    this.size(node, optimizeLayout);
    this.autoLayoutPadding(node, optimizeLayout);
    this.position(node, optimizeLayout);
    this.blend(node);
    return this;
  }

  async commonShapeStyles(node: GeometryMixin & BlendMixin & SceneNode): Promise<this> {
    
    await this.customColor(node, "bg");
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

  async border(node: GeometryMixin & BlendMixin & SceneNode): Promise<this> {
    if ("strokes" in node) {
      this.addAttributes(tailwindBorderWidth(node));
      await this.customColor(node, "border");
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
  async customColor(
    node: GeometryMixin & BlendMixin & SceneNode,
    kind: string
  ): Promise<this> {
    // visible is true or undefined (tests)
    if (this.visible) {
      const paint = await nodePaintStyleForFigNode(node)
      if (paint?.gradient) {
        this.addAttributes(tailwindGradientForNodePaint(paint));
      } else if (paint?.solid) {
        this.addAttributes(tailwindColorForNodePaint(paint, kind));
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
          (optimizeLayout ? node.inferredAutoLayout : null) ?? node
        )
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
          this.addAttributes(`blur${blurValue ? `-${blurValue}` : ""}`);
        }
      }

      const backgroundBlur = node.effects.find(
        (e) => e.type === "BACKGROUND_BLUR"
      );
      if (backgroundBlur) {
        const backgroundBlurValue = pxToBlur(backgroundBlur.radius);
        if (backgroundBlurValue) {
          this.addAttributes(
            `backdrop-blur${
              backgroundBlurValue ? `-${backgroundBlurValue}` : ""
            }`
          );
        }
      }
    }
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


function normalizeTwColorName(name: string | undefined): string | undefined {
  return name?.match(/\p{L}+/gu)?.join("-")
}

async function normalizedFigColorVarName(color: SolidPaint | ColorStop): Promise<string | undefined> {
  const name = await variableNameFromAliasIfAny(color.boundVariables?.color)
  return normalizeTwColorName(name)
}

export async function nodePaintFromStyles(paintStyle: PaintStyle | undefined): Promise<NodePaint | undefined> {
  let paintSetup 
  paintSetup = paintStyle?.paints
  paintSetup &&= retrieveTopFill(paintSetup)

  switch (paintSetup?.type) {
    case "SOLID":
      let name = await normalizedFigColorVarName(paintSetup)
      name ||= normalizeTwColorName(paintStyle?.name)
      const solid = paintSetup.color
      return { name, solid }
    case "GRADIENT_LINEAR":
      const stops = await gradientStopsFromColorStops(paintSetup.gradientStops)
      return { gradient: { gradientAngle: gradientAngle(paintSetup), stops } }
  }
}

async function gradientStopsFromColorStops(stops: readonly ColorStop[]) {
    return await Promise.all(stops.map(async (s) => ({ name: await normalizedFigColorVarName(s), solid: s.color })));
}

export async function nodePaintFromFills(fills: readonly Paint[] | typeof figma.mixed): Promise<NodePaint | undefined> {
  if (fills != figma.mixed) {
    const topPaint = retrieveTopFill(fills)
    if (topPaint) {
      switch (topPaint?.type) {
        case "SOLID": 
          return {
            name:  await normalizedFigColorVarName(topPaint),
            solid: topPaint.color,
          }
        case "GRADIENT_LINEAR": {
          return {
            gradient: {
              gradientAngle: gradientAngle(topPaint),
              stops: await gradientStopsFromColorStops(topPaint.gradientStops)
            }
          }
        }
      }
    }
  }
}

export async function nodePaintStyleForFigNode(node: SupportedNodeForPaintStyle): Promise<NodePaint | undefined> {
  const paintStyle = await nodePaintStyle(node)
  return await nodePaintFromStyles(paintStyle) ?? await nodePaintFromFills(node.fills) 
}
