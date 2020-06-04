import { CustomNodeMap } from "./tailwind_main";
import { pxToLayoutSize } from "./conversion_tables";
import { mostFrequentString } from "./colors";

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

  constructor(node: SceneNode) {
    this.setCustomAutoLayout(node);
    CustomNodeMap[node.id] = this;
  }

  private setCustomAutoLayout(node: SceneNode) {
    // if node is GROUP or FRAME without AutoLayout, try to detect it.
    if (
      node.type === "GROUP" ||
      ("layoutMode" in node && node.layoutMode === "NONE")
    ) {
      this.orderedChildren = this.retrieveCustomAutoLayoutChildren(node);

      const detectedAutoLayout = this.retrieveCustomAutoLayout();
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

  // private detectCollision() {
  //   this.orderedChildren.forEach((d) => {
  //     this.orderedChildren.forEach((dd) => {
  //       if (
  //         (d !== dd && d.x > dd.x && d.x < dd.x + dd.width) ||
  //         (d.y > dd.y && d.y < dd.y + dd.height)
  //       ) {
  //         // detect colision
  //         // parent is relative. The children shall be absolute
  //         return true;
  //       }
  //     });
  //   });
  //   return false;
  // }

  private tailwindCustomAutoLayoutAttr(): string {
    if (this.orderedChildren.length === 0) {
      return "";
    } else if (!this.isCustomAutoLayout) {
      return "relative";
    }

    // https://tailwindcss.com/docs/space/
    // space between items, if necessary
    const spacing = this.customAutoLayoutSpacing.every((d) => d === 0)
      ? 0
      : pxToLayoutSize(mostFrequentString(this.customAutoLayoutSpacing));

    const rowOrColumn =
      this.customAutoLayoutDirection === "sd-x" ? "flex-row " : "flex-col ";

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

    // align according to the most frequent way the children are aligned.
    // const layoutAlign =
    //   mostFrequentString(node.children.map((d) => d.layoutAlign)) === "MIN"
    //     ? ""
    //     : "justify-center ";

    // const parent = this.orderedChildren[0].parent;

    const flex = "flex ";

    // const flex =
    //   parent && "layoutMode" in parent && parent.layoutMode !== "NONE"
    //     ? "flex "
    //     : "inline-flex ";

    return `${flex}${rowOrColumn}${space}${contentAlign}items-center`;
  }

  private retrieveCustomAutoLayoutChildren(
    node: ChildrenMixin
  ): ReadonlyArray<SceneNode> {
    if (node.children.length === 1) {
      return node.children;
    }

    const intervalY = this.calculateInterval(node.children, "y");

    if (intervalY.length === 0) {
      // this should never happen if node.children > 1
      return [];
    }

    const children = node.children.filter((d) => d.visible !== false);

    if (intervalY.every((d) => d < 0)) {
      // if all elements are horizontally layered
      return children.sort((a, b) => a.x - b.x);
    } else if (intervalY.every((d) => d > 0)) {
      // if all elements are vertically layered
      return children.sort((a, b) => a.y - b.y);
    }

    return children;
  }

  private retrieveCustomAutoLayout(): [
    "false" | "sd-x" | "sd-y",
    Array<number>
  ] {
    const intervalY = this.calculateInterval(this.orderedChildren, "y");

    if (intervalY.length === 0) {
      return ["false", []];
    }

    if (intervalY.every((d) => d < 0)) {
      const intervalX = this.calculateInterval(this.orderedChildren, "x");
      const standardDeviation = this.sd(intervalX);
      if (standardDeviation < this.autoLayoutTolerance) {
        return ["sd-x", intervalX];
      }
    } else if (intervalY.every((d) => d >= 0)) {
      const standardDeviation = this.sd(intervalY);
      if (standardDeviation < this.autoLayoutTolerance) {
        return ["sd-y", intervalY];
      }
    }

    return ["false", []];
  }

  private sd(numbers: Array<number>): number {
    // [standardDeviation] needs at least two elements. If every element is 0, return 0.
    if (numbers.length > 1 || numbers.every((d) => d === 0)) {
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
