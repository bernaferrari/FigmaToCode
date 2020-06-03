import { mostFrequentString, vectorColor } from "./tailwind_helpers";
import { rowColumnProps, getContainerSizeProp } from "./tailwind_widget";
import { tailwindAttributesBuilder } from "./tailwind_builder";
import {
  convertPxToTailwindAttr,
  mapWidthHeightSize,
  retrieveAALOrderedChildren,
  isInsideAutoAutoLayout2,
} from "./tailwind_wrappers";

let parentId = "";

const isJsx = true;

// this is a global map containg all the AutoLayout information.
export const CustomNodeMap: Record<string, CustomNode> = {};

class CustomNode {
  // when auto layout is detected even when AutoLayout is not being used
  hasCustomAutoLayout: boolean = false;

  // the direction
  customAutoLayoutDirection: "false" | "sd-x" | "sd-y" = "false";

  // the spacing
  customAutoLayoutSpacing: Array<number> = [];

  // if custom layout is horizontal, they are ordered using x, else y.
  orderedChildren: ReadonlyArray<SceneNode> = [];

  attributes: string = "";

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
      this.orderedChildren = retrieveAALOrderedChildren(node);

      const onlyVisibleChildren = node.children.filter((d) => d.visible);
      const detectedAutoLayout = isInsideAutoAutoLayout2(onlyVisibleChildren);

      this.hasCustomAutoLayout = detectedAutoLayout[0] !== "false";
      this.customAutoLayoutDirection = detectedAutoLayout[0];
      this.customAutoLayoutSpacing = detectedAutoLayout[1];

      // skip when there is only one child and it takes full size
      if (
        !this.hasCustomAutoLayout &&
        this.orderedChildren.length === 1 &&
        node.height === this.orderedChildren[0].height &&
        node.width === this.orderedChildren[0].width
      ) {
        // this.attributes = "";
      } else {
        this.attributes = autoAutoLayoutAttr(
          this.orderedChildren,
          detectedAutoLayout
        );
      }
    }
  }
}

export const tailwindMain = (
  parentId_src: string,
  sceneNode: ReadonlyArray<SceneNode>
): string => {
  parentId = parentId_src;

  if (sceneNode.length > 1) {
    console.log("TODO!!");
    return "support for multiple selections coming soon";
  } else {
    return tailwindWidgetGenerator(sceneNode);
  }
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const tailwindWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>
): string => {
  let comp = "";

  sceneNode.forEach((node) => {
    if (node.visible === false) {
      // ignore when node is invisible
    } else if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += tailwindContainer(node, "");
    } else if (node.type === "VECTOR") {
      comp += tailwindVector(node);
    } else if (node.type === "GROUP") {
      comp += tailwindGroup(node);
    } else if (
      node.type === "FRAME" ||
      node.type === "INSTANCE" ||
      node.type === "COMPONENT"
    ) {
      comp += tailwindFrame(node);
    } else if (node.type === "TEXT") {
      comp += tailwindText(node);
    } else if (node.type === "LINE") {
      comp += tailwindLine(node);
    }
  });

  return comp;
};

const tailwindLine = (node: LineNode): string => {
  const builder = new tailwindAttributesBuilder("", isJsx)
    .visibility(node)
    .widthHeight(node)
    .containerPosition(node, parentId)
    .layoutAlign(node, parentId)
    .opacity(node)
    .rotation(node)
    .shadow(node)
    .customColor(node.strokes, "border")
    .borderWidth(node)
    .borderRadius(node);

  // todo Height is always zero on Lines

  if (builder.attributes) {
    return `\n<div ${builder.buildAttributes()}></div>`;
  }
  return "";
};

const tailwindGroup = (node: GroupNode): string => {
  // TODO generate Rows or Columns instead of Stack when Group is simple enough (two or three items) and they aren't on top of one another.

  // return tailwindContainer(node, retrieveAALOrderedChildren(node), "relative");

  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return "";
  }

  const builder = new tailwindAttributesBuilder("", isJsx)
    .visibility(node)
    .widthHeight(node)
    .containerPosition(node, parentId)
    .layoutAlign(node, parentId);

  const customNode = new CustomNode(node);
  const children = customNode.orderedChildren;

  // if [attributes] is "relative" and builder contains "absolute", ignore the "relative"
  // https://stackoverflow.com/a/39691113
  let attributes = customNode.attributes;
  if (builder.attributes.includes("absolute")) {
    attributes = "";
  }

  if (builder.attributes) {
    // todo include autoAutoLayout here
    return `\n<div ${builder.buildAttributes(
      attributes
    )}>${tailwindWidgetGenerator(children)}</div>`;
  }

  return tailwindWidgetGenerator(children);

  // if (node.children.length === 1) {
  //   // ignore group if possible
  //   return tailwindWidgetGenerator(node.children);
  // }

  // // don't generate size for group because its size is derived from children
  // const size = getContainerSizeProp(node);
};

const tailwindText = (node: TextNode): string => {
  // follow the website order, to make it easier
  const builderResult = new tailwindAttributesBuilder("", isJsx)
    .visibility(node)
    .containerPosition(node, parentId)
    .rotation(node)
    .opacity(node)
    .textAutoSize(node)
    // todo fontFamily (via node.fontName !== figma.mixed ? `fontFamily: ${node.fontName.family}`)
    // todo font smoothing
    .fontSize(node)
    .fontStyle(node)
    .letterSpacing(node)
    .lineHeight(node)
    // todo text lists (<li>)
    .textAlign(node)
    .layoutAlign(node, parentId)
    .customColor(node.fills, "text")
    .textTransform(node)
    .buildAttributes();

  const splittedChars = node.characters.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1
      ? `${node.characters.split("\n").join("<br></br>")}`
      : node.characters;

  return `<p ${builderResult}> ${charsWithLineBreak} </p>`;
};

const autoAutoLayoutAttr = (
  children: ReadonlyArray<SceneNode>,
  autoAutoLayout: ["sd-x" | "sd-y" | "false", Array<number>]
): string => {
  if (children.length === 0) {
    return "";
  }

  // children.forEach((d) => {
  //   children.forEach((dd) => {
  //     if (
  //       (d !== dd && d.x > dd.x && d.x < dd.x + dd.width) ||
  //       (d.y > dd.y && d.y < dd.y + dd.height)
  //     ) {
  //       // detect colision
  //       // parent is relative. The children shall be absolute
  //       console.log("autoAutoLayoutAttr collision detected");
  //       return "relative";
  //     }
  //   });
  // });

  // const autoAutoLayout = isInsideAutoAutoLayout2(children);

  if (autoAutoLayout[0] === "false") {
    return "relative";
  }

  // https://tailwindcss.com/docs/space/
  // space between items, if necessary
  const spacing = autoAutoLayout[1].every((d) => d === 0)
    ? 0
    : convertPxToTailwindAttr(
        mostFrequentString(autoAutoLayout[1]),
        mapWidthHeightSize
      );

  const rowOrColumn = autoAutoLayout[0] === "sd-x" ? "flex-row " : "flex-col ";
  const spaceDirection: "x" | "y" = autoAutoLayout[0] === "sd-x" ? "x" : "y";
  const space = spacing > 0 ? `space-${spaceDirection}-${spacing} ` : "";

  const orderedChildren: Array<SceneNode> = [...children].sort(
    (a, b) => a[spaceDirection] - b[spaceDirection]
  );

  const width_or_height = spaceDirection === "x" ? "width" : "height";
  const lastElement = orderedChildren[orderedChildren.length - 1];
  const firstElement = orderedChildren[0];

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

  const parent = children[0].parent;

  const flex = "flex ";

  // const flex =
  //   parent && "layoutMode" in parent && parent.layoutMode !== "NONE"
  //     ? "flex "
  //     : "inline-flex ";

  return `${flex}${rowOrColumn}${space}${contentAlign}items-center`;
};

const tailwindFrame = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  if (node.layoutMode === "NONE" && node.children.length > 1) {
    // sort, so that layers don't get weird (i.e. bottom layer on top or vice-versa)
    const customNode = new CustomNode(node);
    const childrenStr = tailwindWidgetGenerator(customNode.orderedChildren);

    return tailwindContainer(node, childrenStr, customNode.attributes);
  } else if (node.layoutMode !== "NONE") {
    const children = tailwindWidgetGenerator(node.children);
    const rowColumn = rowColumnProps(node);
    return tailwindContainer(node, children, rowColumn);
  } else {
    const customNode = new CustomNode(node);
    const childrenStr = tailwindWidgetGenerator(customNode.orderedChildren);

    // node.children.length === any && layoutMode === "NONE"
    return tailwindContainer(node, childrenStr, customNode.attributes);
  }
};

const tailwindVector = (node: VectorNode) => {
  // ignore when invisible
  if (node.visible === false) {
    return "";
  }

  const builder = new tailwindAttributesBuilder("", isJsx)
    .widthHeight(node)
    .autoLayoutPadding(node)
    .containerPosition(node, parentId)
    .opacity(node)
    .rotation(node)
    .shadow(node)
    .layoutAlign(node, parentId)
    .customColor(node.strokes, "border")
    .borderWidth(node)
    .buildAttributes();

  return `<div ${builder}><svg viewBox="0 0 ${node.width} ${
    node.height
  }" xmlns="http://www.w3.org/2000/svg">
    ${node.vectorPaths.map(
      (d) => `<path
            fill-rule="${d.windingRule}"
            stroke="${vectorColor(node.fills)}"
            d="${d.data}"
          />`
    )}
    </svg></div>`;

  // return `<div height=\"${node.height}\" width=\"${node.width}\"></div>`;
  // return `<svg height="${node.height}" width="${node.width}">
  // <path d="${node.vectorPaths[0].data}" />
  // </svg>`;
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const tailwindContainer = (
  node:
    | FrameNode
    | RectangleNode
    | InstanceNode
    | ComponentNode
    | EllipseNode
    | LineNode,
  children: string,
  additionalAttr: string = ""
) => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new tailwindAttributesBuilder("", isJsx)
    .visibility(node)
    .widthHeight(node)
    .autoLayoutPadding(node)
    .containerPosition(node, parentId)
    .layoutAlign(node, parentId)
    .customColor(node.fills, "bg")
    // TODO image and gradient support
    .opacity(node)
    .rotation(node)
    .shadow(node)
    .customColor(node.strokes, "border")
    .borderWidth(node)
    .borderRadius(node);

  if (builder.attributes || additionalAttr) {
    return `\n<div ${builder.buildAttributes(
      additionalAttr
    )}>${children}</div>`;
  }
  return children;
};
