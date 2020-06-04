import { vectorColor } from "./colors";
import { tailwindAttributesBuilder } from "./tailwind_builder";
import { pxToLayoutSize } from "./conversion_tables";
import { CustomNode } from "./custom_node";

let parentId = "";

const isJsx = true;

// this is a global map containg all the AutoLayout information.
export const CustomNodeMap: Record<string, CustomNode> = {};

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

const shouldOptimize = true;

export const rowColumnProps = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  // ROW or COLUMN

  // [optimization]
  // flex, by default, has flex-row. Therefore, it can be omitted.
  const flexRow = shouldOptimize ? "" : "flex-row ";

  let rowOrColumn = node.layoutMode === "HORIZONTAL" ? flexRow : "flex-col ";

  // https://tailwindcss.com/docs/space/
  // space between items
  const spacing = pxToLayoutSize(node.itemSpacing);
  const spaceDirection = node.layoutMode === "HORIZONTAL" ? "x" : "y";

  // space is visually ignored when there are less than two children
  let space =
    shouldOptimize && node.children.length < 2
      ? ""
      : `space-${spaceDirection}-${spacing} `;

  // align according to the most frequent way the children are aligned.
  // todo layoutAlign should go to individual fields and this should be threated as an optimization
  // const layoutAlign =
  //   mostFrequentString(node.children.map((d) => d.layoutAlign)) === "MIN"
  //     ? ""
  //     : "items-center ";

  // [optimization]
  // when all children are STRETCH and layout is Vertical, align won't matter. Otherwise, item-center.
  const layoutAlign =
    node.layoutMode === "VERTICAL" &&
    node.children.every((d) => d.layoutAlign === "STRETCH")
      ? ""
      : "items-center ";

  // if parent is a Frame with AutoLayout set to Vertical, the current node should expand
  const flex =
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.layoutMode === node.layoutMode
      ? "flex "
      : "inline-flex ";

  if (
    node.children.length === 1 &&
    "layoutMode" in node.children[0] &&
    node.children[0].layoutMode !== "NONE"
  ) {
    return "";
  }

  if (
    node.children.length === 1 &&
    node.children[0].layoutAlign === "STRETCH"
  ) {
    return "";
  }

  return `${flex}${rowOrColumn}${space}${layoutAlign}`;
};
