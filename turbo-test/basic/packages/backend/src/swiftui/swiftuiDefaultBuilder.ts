import { swiftuiBlur, swiftuiShadow } from "./builderImpl/swiftuiEffects";
import {
  swiftuiBorder,
  swiftuiCornerRadius,
  swiftuiShapeStroke,
} from "./builderImpl/swiftuiBorder";
import { swiftuiColorFromFills } from "./builderImpl/swiftuiColor";
import { swiftuiPadding } from "./builderImpl/swiftuiPadding";
import { swiftuiSize } from "./builderImpl/swiftuiSize";

import { swiftuiPosition } from "./builderImpl/swiftuiPosition";
import {
  swiftuiVisibility,
  swiftuiOpacity,
  swiftuiRotation,
  swiftuiBlendMode,
} from "./builderImpl/swiftuiBlend";

export class SwiftuiDefaultBuilder {
  modifiers: string[] = [];

  blend(node: SceneNode & LayoutMixin & MinimalBlendMixin): this {
    this.modifiers.push(
      swiftuiVisibility(node),
      swiftuiRotation(node),
      swiftuiOpacity(node),
      swiftuiBlendMode(node)
    );

    return this;
  }
  position(node: SceneNode, parentId: string): this {
    // TODO Fix this.
    // if (commonIsAbsolutePosition(node)) {
    //   this.addStyles(
    //     formatWithJSX("left", this.isJSX, node.x),
    //     formatWithJSX("top", this.isJSX, node.y)
    //   );
    // }
    this.modifiers.push(swiftuiPosition(node, parentId));
    return this;
  }

  shapeBorder(node: SceneNode): this {
    this.modifiers.push(swiftuiShapeStroke(node));
    return this;
  }

  layerBorder(node: SceneNode): this {
    this.modifiers.push(swiftuiBorder(node));
    return this;
  }

  shapeBackground(node: SceneNode): this {
    if (node.type !== "ELLIPSE" && node.type !== "RECTANGLE") {
      return this;
    }

    const fillColor = swiftuiColorFromFills(node.fills);
    if (fillColor) {
      this.modifiers.push(`.fill(${fillColor})`);
    }

    return this;
  }

  layerBackground(node: SceneNode): this {
    if (node.type !== "FRAME") {
      return this;
    }

    const fillColor = swiftuiColorFromFills(node.fills);
    if (fillColor) {
      this.modifiers.push(`.background(${fillColor})`);
    }

    // add corner to the background. It needs to come after the Background, and since we already in the if, let's add it here.
    const corner = swiftuiCornerRadius(node);

    // it seems this is necessary even in RoundedRectangle
    if (corner) {
      this.modifiers.push(`.cornerRadius(${corner})`);
    }

    return this;
  }

  effects(node: SceneNode): this {
    if (node.type === "GROUP") {
      return this;
    }

    this.modifiers.push(swiftuiBlur(node));
    this.modifiers.push(swiftuiShadow(node));

    return this;
  }

  widthHeight(node: SceneNode): this {
    const [propWidth, propHeight] = swiftuiSize(node);

    if (propWidth || propHeight) {
      // add comma if propWidth and propHeight both exists
      const comma = propWidth && propHeight ? ", " : "";

      this.modifiers.push(`.frame(${propWidth}${comma}${propHeight})`);
    }

    return this;
  }

  autoLayoutPadding(node: SceneNode): this {
    this.modifiers.push(swiftuiPadding(node));
    return this;
  }

  build(): string {
    return this.modifiers.join("");
  }
}
