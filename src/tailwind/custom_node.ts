import { pxToLayoutSize } from "./conversion_tables";
import { mostFrequentString } from "./colors";
// this is a global map containg all the AutoLayout information.
export const CustomNodeMap: Record<string, CustomNode> = {};

export const AffectedByCustomAutoLayout: Record<
  string,
  "parent" | "child" | "changed"
> = {};

export class CustomNode {
  // when auto layout is detected even when AutoLayout is not being used
  isCustomAutoLayout: boolean = false;

  // the direction
  customAutoLayoutDirection: "false" | "sd-x" | "sd-y" = "false";

  // the spacing
  customAutoLayoutSpacing: Array<number> = [];

  // if custom layout is horizontal, they are ordered using x, else y.
  orderedChildren: ReadonlyArray<SceneNode> = [];

  attributes: string = "";

  // this is a magic number
  autoLayoutTolerance = 4;

  largestNode:
    | FrameNode
    | RectangleNode
    | InstanceNode
    | ComponentNode
    | undefined;

  constructor(node: SceneNode) {
    this.setCustomAutoLayout(node);
    CustomNodeMap[node.id] = this;
    if (this.largestNode) {
      if (node.parent) {
        AffectedByCustomAutoLayout[node.parent?.id] = "parent";
      }
      AffectedByCustomAutoLayout[this.largestNode.id] = "changed";
      this.orderedChildren.forEach(
        (d) => (AffectedByCustomAutoLayout[d.id] = "child")
      );
    }
  }

  isChildInsideNodeArea(node: SceneNode, children: ReadonlyArray<SceneNode>) {
    return children.every((child) => {
      if (child === node) {
        return true;
      }

      return (
        child.x >= node.x &&
        child.y >= node.y &&
        child.x + child.width - node.x <= node.width
      );
    });
  }

  private rectAsBg(
    node: ChildrenMixin
  ): [
    boolean,
    FrameNode | RectangleNode | InstanceNode | ComponentNode | undefined
  ] {
    // needs at least two items (rect in bg and something else in fg)
    if (node.children.length < 2) {
      return [false, undefined];
    }

    const maxH = Math.max(...node.children.map((d) => d.height));
    const maxW = Math.max(...node.children.map((d) => d.width));
    const largestChild = node.children.find(
      (d) => d.width === maxW && d.height === maxH
    );

    if (!largestChild) {
      return [false, undefined];
    }

    const childrenInside = this.isChildInsideNodeArea(
      largestChild,
      node.children
    );

    if (
      childrenInside &&
      (largestChild.type === "COMPONENT" ||
        largestChild.type === "INSTANCE" ||
        largestChild.type === "FRAME" ||
        largestChild.type === "RECTANGLE")
    ) {
      return [true, largestChild];
    } else {
      return [false, undefined];
    }
  }

  private setCustomAutoLayout(node: SceneNode) {
    // if node is GROUP or FRAME without AutoLayout, try to detect it.

    if (
      node.type === "GROUP" ||
      ("layoutMode" in node && node.layoutMode === "NONE")
    ) {
      console.log("children are ", node.children);

      const rect = this.rectAsBg(node);

      let children = node.children.filter((d) => d.visible !== false);

      // if a Rect with elements inside were identified, extract this Rect
      // outer methods are going to use it.
      if (rect[0] === true) {
        this.largestNode = rect[1];
        children = children.filter((d) => d !== this.largestNode);
        // if that special scenario is found, this is the end of this CustomNode.
        // It will run again to pass the attributes
        // return;
      }

      this.orderedChildren = this.retrieveCustomAutoLayoutChildren(children);
      console.log("orderedChildren are ", children);

      const detectedAutoLayout = this.retrieveCustomAutoLayout();
      console.log("detectedLayout ", detectedAutoLayout);
      this.isCustomAutoLayout = detectedAutoLayout[0] !== "false";
      this.customAutoLayoutDirection = detectedAutoLayout[0];
      this.customAutoLayoutSpacing = detectedAutoLayout[1];

      // skip when there is only one child and it takes full size
      if (
        !this.retrieveCustomAutoLayout &&
        this.orderedChildren.length === 1 &&
        node.height === this.orderedChildren[0].height &&
        node.width === this.orderedChildren[0].width
      ) {
        // this.attributes = "";
      } else {
        this.attributes = this.tailwindCustomAutoLayoutAttr();
      }
    }
  }

  private tailwindCustomAutoLayoutAttr(): string {
    if (this.orderedChildren.length === 0) {
      return "";
    } else if (!this.isCustomAutoLayout && !this.largestNode) {
      if (this.orderedChildren.length < 2) {
        return "";
      }
      return "relative ";
    }

    console.log("this.largestNode ", this.largestNode);

    // https://tailwindcss.com/docs/space/
    // space between items, if necessary. Use the minimum amount.
    const average = (arr: Array<number>) =>
      arr.reduce((p, c) => p + c, 0) / arr.length;

    const spacing = this.customAutoLayoutSpacing.every((d) => d === 0)
      ? 0
      : pxToLayoutSize(average(this.customAutoLayoutSpacing));

    const rowOrColumn =
      this.customAutoLayoutDirection === "sd-y" ? "flex-col " : "";

    const spaceDirection: "x" | "y" =
      this.customAutoLayoutDirection === "sd-x" ? "x" : "y";

    const space = spacing > 0 ? `space-${spaceDirection}-${spacing} ` : "";

    const width_or_height = spaceDirection === "x" ? "width" : "height";
    const lastElement = this.orderedChildren[this.orderedChildren.length - 1];
    const firstElement = this.orderedChildren[0];

    // lastY - firstY + lastHeight = total area
    const totalArea =
      lastElement[width_or_height] -
      firstElement[width_or_height] +
      lastElement[spaceDirection];

    // threshold
    const isCentered = firstElement[spaceDirection] * 2 + totalArea < 2;
    const contentAlign = isCentered ? "content-center " : "";

    const padding = this.tailwindPadding();

    // align according to the most frequent way the children are aligned.
    // const layoutAlign =
    //   mostFrequentString(node.children.map((d) => d.layoutAlign)) === "MIN"
    //     ? ""
    //     : "justify-center ";

    // const parent = this.orderedChildren[0].parent;

    const flex = "inline-flex ";

    // const flex =
    //   parent && "layoutMode" in parent && parent.layoutMode !== "NONE"
    //     ? "flex "
    //     : "inline-flex ";

    console.log("returning flex ---> ", rowOrColumn);

    return `${flex}${rowOrColumn}${space}${contentAlign}items-center justify-center ${padding}`;
  }

  tailwindPadding(): string {
    const padding = this.findPadding();
    if (padding === undefined) {
      return "";
    }

    const { top, left, right, bottom } = padding;

    if (top === bottom && top === left && top === right) {
      return `m-${pxToLayoutSize(top)} `;
    }

    // is there a less verbose way of writing this?
    let comp = "";

    if (top === bottom && right === left) {
      return `px-${pxToLayoutSize(left)} py-${pxToLayoutSize(top)} `;
    }

    // py
    if (top === bottom) {
      comp += `py-${pxToLayoutSize(top)} `;
      if (left > 0) {
        comp += `pl-${pxToLayoutSize(left)} `;
      }
      if (right > 0) {
        comp += `pr-${pxToLayoutSize(right)} `;
      }

      return comp;
    }

    // px
    if (left === right) {
      comp += `px-${pxToLayoutSize(left)} `;
      if (top > 0) {
        comp += `pt-${pxToLayoutSize(top)} `;
      }
      if (bottom > 0) {
        comp += `pb-${pxToLayoutSize(bottom)} `;
      }
      return comp;
    }

    // independent
    if (top > 0) {
      comp += `pt-${pxToLayoutSize(top)} `;
    }
    if (bottom > 0) {
      comp += `pb-${pxToLayoutSize(bottom)} `;
    }
    if (left > 0) {
      comp += `pl-${pxToLayoutSize(left)} `;
    }
    if (right > 0) {
      comp += `pr-${pxToLayoutSize(right)} `;
    }

    return comp;
  }

  findPadding():
    | undefined
    | {
        top: number;
        left: number;
        right: number;
        bottom: number;
      } {
    const spaceDirection: "x" | "y" =
      this.customAutoLayoutDirection === "sd-x" ? "x" : "y";

    const parent = this.largestNode;

    // CustomNodeMap[this.orderedChildren[0].parent?.id];

    if (!parent || !("width" in parent)) {
      return undefined;
    }

    const parentX = "layoutMode" in parent ? 0 : parent.x;
    const parentY = "layoutMode" in parent ? 0 : parent.y;

    if (spaceDirection === "y") {
      // first element Y margin
      const top = this.orderedChildren[0].y - parentY;

      // last element Y margin
      const last = this.orderedChildren[this.orderedChildren.length - 1];

      // full height - last element + last position - parent position
      const bottom = parent.height - (last.height + last.y - parentY);

      // the closest value to the left border
      const left = Math.min(...this.orderedChildren.map((d) => d.x - parentX));

      // the closets value to the right border
      const right = Math.min(
        ...this.orderedChildren.map(
          (d) => parent.width - (d.width + d.x - parentX)
        )
      );

      return { top: top, left: left, right: right, bottom: bottom };
    }

    if (spaceDirection === "x") {
      // first element Y margin
      const top = Math.min(...this.orderedChildren.map((d) => d.y - parentY));

      // last element Y margin
      const last = this.orderedChildren[this.orderedChildren.length - 1];

      // full height - last element + last position - parent position
      const bottom = Math.min(
        ...this.orderedChildren.map(
          (d) => parent.height - (d.height + d.y - parentY)
        )
      );

      // the closest value to the left border
      const left = this.orderedChildren[0].x - parentX;

      // the closets value to the right border
      const right = parent.width - (last.width + last.x - parentX);

      return { top: top, left: left, right: right, bottom: bottom };
    }

    return undefined;
  }

  private retrieveCustomAutoLayoutChildren(
    children: ReadonlyArray<SceneNode>
  ): ReadonlyArray<SceneNode> {
    if (children.length === 1) {
      return children;
    }

    const intervalY = this.calculateInterval(children, "y");

    if (intervalY.length === 0) {
      // this should never happen if node.children > 1
      return [];
    }

    const updateChildren = [...children];

    // use 1 instead of 0 to avoid rounding errors (-0.00235 should be valid)
    if (intervalY.every((d) => d < 1)) {
      // if all elements are horizontally layered
      return updateChildren.sort((a, b) => a.x - b.x);
    } else if (intervalY.every((d) => d > -1)) {
      // if all elements are vertically layered
      return updateChildren.sort((a, b) => a.y - b.y);
    }

    return updateChildren;
  }

  private retrieveCustomAutoLayout(): [
    "false" | "sd-x" | "sd-y",
    Array<number>
  ] {
    const intervalY = this.calculateInterval(this.orderedChildren, "y");

    if (intervalY.length === 0) {
      return ["false", []];
    }

    console.log("intervalY is ", intervalY);

    // use 1 instead of 0 to avoid rounding errors (-0.00235 should be valid)
    if (intervalY.every((d) => d < 1)) {
      const intervalX = this.calculateInterval(this.orderedChildren, "x");
      // const standardDeviation = this.sd(intervalX);
      // if (standardDeviation < this.autoLayoutTolerance) {
      return ["sd-x", intervalX];
      // }
    } else if (intervalY.every((d) => d >= -1)) {
      // todo re-enable the standardDeviation calculation? This was used to test if layout elements have the same spacing
      // const standardDeviation = this.sd(intervalY);
      // if (standardDeviation < this.autoLayoutTolerance) {
      return ["sd-y", intervalY];
      // }
    }

    return ["false", []];
  }

  private sd(numbers: Array<number>): number {
    // [standardDeviation] needs at least two elements. If every element is 0, return 0.
    if (numbers.length < 2 || numbers.every((d) => d === 0)) {
      return 0;
    }

    const mean = numbers.reduce((acc, n) => acc + n) / numbers.length;
    return Math.sqrt(
      numbers.reduce((_, n) => (n - mean) ** 2) / (numbers.length - 1)
    );
  }

  private calculateInterval(
    children: ReadonlyArray<SceneNode>,
    x_or_y: "x" | "y"
  ): Array<number> {
    const orderedChildren: Array<SceneNode> = [...children];
    const h_or_w: "width" | "height" = x_or_y === "x" ? "width" : "height";

    // sort children based on X or Y values
    const sorted: Array<SceneNode> = orderedChildren.sort(
      (a, b) => a[x_or_y] - b[x_or_y]
    );

    // calculate the distance between values (either vertically or horizontally)
    const interval = [];
    for (var i = 0; i < sorted.length - 1; i++) {
      interval.push(
        sorted[i + 1][x_or_y] - (sorted[i][x_or_y] + sorted[i][h_or_w])
      );
    }
    return interval;
  }
}
