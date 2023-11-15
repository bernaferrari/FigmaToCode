import { sliceNum } from "../common/numToAutoFixed";
import { androidBlur, androidShadow } from "./builderImpl/androidEffects";
import {
  androidBorder,
  androidCornerRadius,
} from "./builderImpl/androidBorder";
import { androidBackground } from "./builderImpl/androidColor";
import { androidPadding } from "./builderImpl/androidPadding";
import { androidSize } from "./builderImpl/androidSize";

import {
  androidVisibility,
  androidOpacity,
  androidRotation,
  androidBlendMode,
} from "./builderImpl/androidBlend";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import { Modifier, androidElement } from "./builderImpl/androidParser";

export function resourceName(name: string): string {
  const words = name.split(/[^a-zA-Z0-9]+/);
  const snakeCaseWords = words.map((word, index) => {
    if (index === 0) {
      const cleanedWord = word.replace(/^[^a-zA-Z]+/g, "");
      return cleanedWord.charAt(0).toLowerCase() + cleanedWord.slice(1);
    }
    return word;
  });
  return snakeCaseWords.join("_");
}

export class androidDefaultBuilder {
  element: androidElement;

  constructor(kind: string = "", stack: string = "") {
    this.element = !stack ? new androidElement(kind) : new androidElement(kind, [["_CHILD",stack]]);
  }

  pushModifier(...args: (Modifier | null)[]): void {
    args.forEach((modifier) => {
      if (modifier) {
        this.element.addModifier(modifier);
      }
    });
  }

  commonPositionStyles(node: SceneNode, optimizeLayout: boolean): this {
    this.position(node, optimizeLayout);
    if ("layoutAlign" in node && "opacity" in node) {
      this.blend(node);
    }
    return this;
  }

  blend(node: SceneNode & LayoutMixin & MinimalBlendMixin): this {
    this.pushModifier(
      androidVisibility(node),
      androidRotation(node),
      androidOpacity(node),
      androidBlendMode(node)
    );

    return this;
  }

  topLeftToCenterOffset(
    x: number,
    y: number,
    node: SceneNode,
    parent: (BaseNode & ChildrenMixin) | null
  ): { centerX: number; centerY: number } {
    if (!parent || !("width" in parent)) {
      return { centerX: 0, centerY: 0 };
    }
    // Find the child's center coordinates
    const centerX = x + node.width / 2;
    const centerY = y + node.height / 2;

    // Calculate the center-based offset
    const centerBasedX = centerX - parent.width / 2;
    const centerBasedY = centerY - parent.height / 2;

    return { centerX: centerBasedX, centerY: centerBasedY };
  }

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);

      this.pushModifier(['android:layout_marginStart',`${sliceNum(x)}`]);
      this.pushModifier(['android:layout_marginTop',`${sliceNum(y)}`]);
    }
    return this;
  }

  shapeBorder(node: SceneNode): this {
    const borders = androidBorder(node);
    if (borders) {
      borders.forEach((border) => {
        this.element.addModifierMixed("overlay", border);
      });
    }
    return this;
  }

  shapeBackground(node: SceneNode): this {
    if ("fills" in node) {
      const background = androidBackground(node, node.fills);
      if (background) {
        this.pushModifier([`background`, background]);
      }
    }
    return this;
  }

  shapeForeground(node: SceneNode): this {
    if (!("children" in node) || node.children.length === 0) {
      this.pushModifier([`foregroundColor`, ".clear"]);
    }
    return this;
  }

  cornerRadius(node: SceneNode): this {
    const corner = androidCornerRadius(node);
    if (corner) {
      this.pushModifier([`cornerRadius`, corner]);
    }
    return this;
  }

  effects(node: SceneNode): this {
    if (node.type === "GROUP") {
      return this;
    }

    this.pushModifier(androidBlur(node), androidShadow(node));

    return this;
  }

  size(node: SceneNode, optimize: boolean): this {
    const { width, height } = androidSize(node, optimize);
    if (width) {
      this.pushModifier(['android:layout_width', `${width}`]);
    }
    if (height) {
      this.pushModifier(['android:layout_height', `${height}`]);
    }
    return this;
  }

  autoLayoutPadding(node: SceneNode, optimizeLayout: boolean): this {
    if ("paddingLeft" in node) {
      this.pushModifier(
        androidPadding(
          (optimizeLayout ? node.inferredAutoLayout : null) ?? node
        )
      );
    }
    return this;
  }

  setId(node: SceneNode): this {
    if ("name" in node && node.name) {
      const id = resourceName(node.name);
      if (id) {
        this.pushModifier(['android:id', `@+id/${id}`]);
      }
    }
    return this;
  }

  build(indentLevel: number = 0): string {
    // this.element.element = kind;
    return this.element.toString(indentLevel);
  }
}
