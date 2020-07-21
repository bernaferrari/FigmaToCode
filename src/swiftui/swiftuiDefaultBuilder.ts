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
    if (fillColor) {
      if (node.type === "FRAME") {
        this.modifiers += `\n.background(${fillColor})`;

        // add corner to Frame. It needs to come after the Background, and since we already in the if, let's add it here.
        const corner = swiftuiCornerRadius(node);
        if (corner) {
          this.modifiers += `\n.cornerRadius(${corner})`;
        }
      } else {
        this.modifiers += `\n.foregroundColor(${fillColor})`;
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
