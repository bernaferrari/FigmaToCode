import { sliceNum } from "../common/numToAutoFixed";
import { androidShadow } from "./builderImpl/androidEffects";
import { androidBackground } from "./builderImpl/androidColor";
import { androidPadding } from "./builderImpl/androidPadding";
import { androidSize } from "./builderImpl/androidSize";

import {
  androidVisibility,
  androidOpacity,
  androidRotation,
} from "./builderImpl/androidBlend";
import {
  getCommonPositionValue,
} from "../common/commonPosition";
import { Modifier, androidElement } from "./builderImpl/androidParser";

export const isAbsolutePosition = (
  node: SceneNode,
  optimizeLayout: boolean
) => {
  // No position when parent is inferred auto layout.
  if (
    optimizeLayout &&
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.inferredAutoLayout !== null
  ) {
    return false;
  }

  if ("layoutAlign" in node) {
    if (!node.parent || node.parent === undefined) {
      return true;
    }

    const parentLayoutIsNone =
      "layoutMode" in node.parent && node.parent.layoutMode === "NONE";
    const hasNoLayoutMode = !("layoutMode" in node.parent);

    if (
      node.layoutPositioning === "ABSOLUTE" ||
      parentLayoutIsNone ||
      hasNoLayoutMode
    ) {
      return true;
    }
  }
  return false;
};

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
      androidOpacity(node)
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
    if (isAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);
      if (!node.parent || ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE")) {
        this.pushModifier(['android:layout_marginStart',`${sliceNum(x)}dp`]);
        this.pushModifier(['android:layout_marginTop',`${sliceNum(y)}dp`]);
      }
      else {
        if ("width" in node.parent && "constraints" in node && "horizontal" in node.constraints && node.constraints.horizontal === "MAX") {
          this.pushModifier(['android:layout_marginEnd',`${node.parent.width-node.x-node.width}dp`]);
        }
        else {
          this.pushModifier(['android:layout_marginStart',`${sliceNum(x)}dp`]);
        }
        if ("height" in node.parent && "constraints" in node && "vertical" in node.constraints && node.constraints.vertical === "MAX") {
          this.pushModifier(['android:layout_marginBottom',`${node.parent.height-node.y-node.height}dp`]);
        }
        else {
          this.pushModifier(['android:layout_marginTop',`${sliceNum(y)}dp`]);
        }
      }
    }
    return this;
  }

  shapeBackground(node: SceneNode): this {
    if ("fills" in node) {
      const background = androidBackground(node, node.fills);
      if (background) {
        this.pushModifier([`android:background`, background]);
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

  effects(node: SceneNode): this {
    if (node.type === "GROUP") {
      return this;
    }

    this.pushModifier(androidShadow(node));

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

  setRaw(node: SceneNode): this {
    if (node) {
      this.pushModifier(["rawproperty",JSON.stringify(node)]);
    }
    return this;
  }

  build(indentLevel: number = 0): string {
    // this.element.element = kind;
    return this.element.toString(indentLevel);
  }
}
