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
import { AltSceneNode } from "../altNodes/altMixins";

export class SwiftuiDefaultBuilder {
  modifiers: string = "";

  blend(node: AltSceneNode): this {
    this.modifiers += swiftuiVisibility(node);
    this.modifiers += swiftuiRotation(node);
    this.modifiers += swiftuiOpacity(node);
    this.modifiers += swiftuiBlendMode(node);

    return this;
  }

  position(node: AltSceneNode, parentId: string): this {
    this.modifiers += swiftuiPosition(node, parentId);
    return this;
  }

  shapeBorder(node: AltSceneNode): this {
    this.modifiers += swiftuiShapeStroke(node);
    return this;
  }

  layerBorder(node: AltSceneNode): this {
    this.modifiers += swiftuiBorder(node);
    return this;
  }

  shapeBackground(node: AltSceneNode): this {
    if (node.type !== "ELLIPSE" && node.type !== "RECTANGLE") {
      return this;
    }

    const fillColor = swiftuiColorFromFills(node.fills);
    if (fillColor) {
      this.modifiers += `\n.fill(${fillColor})`;
    }

    return this;
  }

  layerBackground(node: AltSceneNode): this {
    if (node.type !== "FRAME") {
      return this;
    }

    const fillColor = swiftuiColorFromFills(node.fills);
    if (fillColor) {
      this.modifiers += `\n.background(${fillColor})`;
    }

    // add corner to the background. It needs to come after the Background, and since we already in the if, let's add it here.
    const corner = swiftuiCornerRadius(node);

    // it seems this is necessary even in RoundedRectangle
    if (corner) {
      this.modifiers += `\n.cornerRadius(${corner})`;
    }

    return this;
  }

  effects(node: AltSceneNode): this {
    if (node.type === "GROUP") {
      return this;
    }

    this.modifiers += swiftuiBlur(node);
    this.modifiers += swiftuiShadow(node);

    return this;
  }

  widthHeight(node: AltSceneNode): this {
    const [propWidth, propHeight] = swiftuiSize(node);

    if (propWidth || propHeight) {
      // add comma if propWidth and propHeight both exists
      const comma = propWidth && propHeight ? ", " : "";

      this.modifiers += `\n.frame(${propWidth}${comma}${propHeight})`;
    }

    return this;
  }

  autoLayoutPadding(node: AltSceneNode): this {
    this.modifiers += swiftuiPadding(node);
    return this;
  }

  build(): string {
    return this.modifiers;
  }
}
