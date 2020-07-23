import { swiftuiBlur, swiftuiShadow } from "./builderImpl/swiftuiEffects";
import {
  swiftuiBorder,
  swiftuiCornerRadius,
  swiftuiShapeStroke,
} from "./builderImpl/swiftuiBorder";
import { swiftuiColor } from "./builderImpl/swiftuiColor";
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

  soonerBorder(node: AltSceneNode): this {
    this.modifiers += swiftuiShapeStroke(node);
    return this;
  }

  laterBorder(node: AltSceneNode): this {
    this.modifiers += swiftuiBorder(node);
    return this;
  }

  background(node: AltSceneNode): this {
    if (node.type === "GROUP") {
      return this;
    }

    const fillColor = swiftuiColor(node.fills);
    const isFgColor = fillColor[0] === "C";

    if (fillColor) {
      if (node.type === "FRAME") {
        this.modifiers += `\n.background(${fillColor})`;
      } else if (isFgColor) {
        // foregroundColor can't be a gradient
        this.modifiers += `\n.foregroundColor(${fillColor})`;
      } else {
        this.modifiers += `\n.foregroundColor(.clear)`;
        this.modifiers += `\n.background(${fillColor})`;
      }

      // add corner to the background. It needs to come after the Background, and since we already in the if, let's add it here.
      const corner = swiftuiCornerRadius(node);

      // it seems this is necessary even in RoundedRectangle
      if (corner && (!isFgColor || node.type === "FRAME")) {
        this.modifiers += `\n.cornerRadius(${corner})`;
      }
    }

    // todo gradient support
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
    this.modifiers += swiftuiSize(node);
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
