import { sliceNum } from "./../common/numToAutoFixed";
import { swiftuiBlur, swiftuiShadow } from "./builderImpl/swiftuiEffects";
import {
  swiftuiBorder,
  swiftuiCornerRadius,
  swiftuiShapeStroke,
} from "./builderImpl/swiftuiBorder";
import { swiftuiColorFromFills } from "./builderImpl/swiftuiColor";
import { swiftuiPadding } from "./builderImpl/swiftuiPadding";
import { swiftuiSize } from "./builderImpl/swiftuiSize";

import {
  swiftuiVisibility,
  swiftuiOpacity,
  swiftuiRotation,
  swiftuiBlendMode,
} from "./builderImpl/swiftuiBlend";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import { indentString } from "../common/indentString";

export class SwiftuiDefaultBuilder {
  modifiers: string[] = [];

  private pushModifier(...args: string[]): void {
    this.modifiers.push(...args.filter(Boolean));
  }

  commonPositionStyles(
    node: SceneNode & LayoutMixin & MinimalBlendMixin,
    optimizeLayout: boolean
  ): this {
    this.autoLayoutPadding(node, optimizeLayout);
    this.size(node);
    this.position(node, optimizeLayout);
    this.blend(node);
    return this;
  }

  blend(node: SceneNode & LayoutMixin & MinimalBlendMixin): this {
    this.pushModifier(
      swiftuiVisibility(node),
      swiftuiRotation(node),
      swiftuiOpacity(node),
      swiftuiBlendMode(node)
    );

    return this;
  }

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);
      this.pushModifier(`.offset(x: ${sliceNum(x)}, y: ${sliceNum(y)})`);
    }
    return this;
  }

  shapeBorder(node: SceneNode): this {
    this.pushModifier(swiftuiShapeStroke(node));
    return this;
  }

  layerBorder(node: SceneNode): this {
    this.pushModifier(swiftuiBorder(node));
    return this;
  }

  shapeBackground(node: SceneNode): this {
    if ("fills" in node) {
      const fillColor = swiftuiColorFromFills(node.fills);
      if (fillColor) {
        this.pushModifier(`.background(${fillColor})`);
      }
    }

    return this;
  }

  cornerRadius(node: SceneNode): this {
    const corner = swiftuiCornerRadius(node);
    if (corner) {
      this.pushModifier(`.cornerRadius(${corner})`);
    }
    return this;
  }

  fillColor(node: MinimalFillsMixin): this {
    const fillColor = swiftuiColorFromFills(node.fills);
    if (fillColor) {
      this.pushModifier(`.fill(${fillColor})`);
    }

    return this;
  }

  effects(node: SceneNode): this {
    if (node.type === "GROUP") {
      return this;
    }

    this.pushModifier(swiftuiBlur(node), swiftuiShadow(node));

    return this;
  }

  size(node: SceneNode): this {
    const widthHeight = swiftuiSize(node);
    const sizes = widthHeight.filter((d) => d);
    if (sizes.length > 0) {
      this.pushModifier(`.frame(${sizes.join(", ")})`);
    }

    return this;
  }

  autoLayoutPadding(node: SceneNode, optimizeLayout: boolean): this {
    if ("paddingLeft" in node) {
      this.pushModifier(swiftuiPadding(node, optimizeLayout));
    }
    return this;
  }

  build(kind: string): string {
    if (this.modifiers.join("").length > 20) {
      return kind + "\n" + indentString(this.modifiers.join("\n"));
    }
    return kind + this.modifiers.join("");
  }
}
