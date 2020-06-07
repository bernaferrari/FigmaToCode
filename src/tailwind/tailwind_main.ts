import { vectorColor, vectorOpacity } from "./colors";
import { tailwindAttributesBuilder } from "./tailwind_builder";
import { pxToLayoutSize } from "./conversion_tables";
import { CustomNode } from "./custom_node";

let parentId = "";

const isJsx = true;

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
  const builder = new tailwindAttributesBuilder("", isJsx, node.visible)
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
  // also ignore if there are no children inside, which makes no sense
  if (node.width <= 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  const vectorIfExists = tailwindVector(node);
  if (vectorIfExists) {
    return vectorIfExists;
  }

  const customNode = new CustomNode(node);
  let childrenStr = tailwindWidgetGenerator(customNode.orderedChildren);
  let attr = customNode.attributes;

  if (customNode.largestNode) {
    // override it with a parent
    childrenStr = tailwindContainer(customNode.largestNode, childrenStr, attr);

    // if there was a largestNode, no attributes
    attr = "";
  }

  // return tailwindContainer(node, childrenStr, attr);
  const children = customNode.orderedChildren;

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new tailwindAttributesBuilder("", isJsx, node.visible)
    .visibility(node)
    .containerPosition(node, parentId)
    .widthHeight(node)
    .layoutAlign(node, parentId);

  // if [attributes] is "relative" and builder contains "absolute", ignore the "relative"
  // https://stackoverflow.com/a/39691113
  if (builder.attributes.includes("absolute")) {
    attr = "";
  }

  if (!builder.attributes) {
    return childrenStr;
  }

  if (builder.attributes) {
    // todo include autoAutoLayout here
    return `\n<div ${builder.buildAttributes(attr)}>${tailwindWidgetGenerator(
      children
    )}</div>`;
  }

  return tailwindWidgetGenerator(children);
};

const tailwindText = (node: TextNode): string => {
  // follow the website order, to make it easier
  const builderResult = new tailwindAttributesBuilder("", isJsx, node.visible)
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
  const vectorIfExists = tailwindVector(node);
  if (vectorIfExists) {
    return vectorIfExists;
  }

  if (node.layoutMode === "NONE" && node.children.length > 1) {
    // sort, so that layers don't get weird (i.e. bottom layer on top or vice-versa)
    const customNode = new CustomNode(node);
    let childrenStr = tailwindWidgetGenerator(customNode.orderedChildren);
    let attr = customNode.attributes;

    if (customNode.largestNode) {
      // override it with a parent
      childrenStr = tailwindContainer(
        customNode.largestNode,
        childrenStr,
        attr
      );

      // if there was a largestNode, no attributes
      attr = "";
    }

    return tailwindContainer(node, childrenStr, attr);
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

const tailwindVector = (group: ChildrenMixin) => {
  // todo improve this, positioning is wrong
  // todo support for ungroup vectors. This was reused because 80% of people are going
  // to use Vectors in groups (like icons)

  // if every children is a VECTOR, no children have a child
  if (
    group.children.length === 0 ||
    !group.children.every((d) => d.type === "VECTOR")
  ) {
    return "";
  }

  const node = group.children[0] as VectorNode;

  const strokeOpacity = vectorOpacity(node.strokes);
  const strokeOpacityAttr =
    strokeOpacity < 1
      ? `${isJsx ? "strokeOpacity" : "stroke-opacity"}=${
          isJsx ? `{${strokeOpacity}}` : `"${strokeOpacity}"`
        }\n`
      : "";

  const strokeWidthAttr = `${isJsx ? "strokeWidth" : "stroke-width"}=${
    isJsx ? `{${node.strokeWeight}}` : `"${node.strokeWeight}"`
  }\n`;

  const strokeLineCapAttr =
    node.strokeCap === "ROUND"
      ? `${isJsx ? "strokeLinecap" : "stroke-linecap"}="round"\n`
      : "";

  const strokeLineJoinAttr =
    node.strokeJoin !== "MITER"
      ? `${
          isJsx ? "strokeLinejoin" : "stroke-linejoin"
        }="${node.strokeJoin.toString().toLowerCase()}"\n`
      : "";

  const strokeAttr =
    node.strokes.length > 0 ? `stroke="#${vectorColor(node.strokes)}"\n` : "";

  const sizeAttr = isJsx
    ? `height={${node.height}} width={${node.width}}`
    : `height="${node.height}" width="${node.width}"`;

  // reduce everything into a single string
  const paths = group.children.reduce(
    (acc, n) =>
      acc +
      (n as VectorNode).vectorPaths.reduce((acc, d) => {
        const fillRuleAttr =
          d.windingRule !== "NONE"
            ? `${isJsx ? "fillRule" : "fill-rule"}="${d.windingRule}"\n`
            : "";

        return (
          acc +
          `<path\n${fillRuleAttr}${strokeAttr}${strokeOpacityAttr}${strokeWidthAttr}${strokeLineCapAttr}${strokeLineJoinAttr}d="${d.data}"/>\n`
        );
      }, ""),
    ""
  );

  return `<svg ${sizeAttr} fill="none">
    ${paths}
    </svg>`;

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

  const builder = new tailwindAttributesBuilder("", isJsx, node.visible)
    .visibility(node)
    .autoLayoutPadding(node)
    .containerPosition(node, parentId)
    .widthHeight(node)
    .layoutAlign(node, parentId)
    .customColor(node.fills, "bg")
    // TODO image and gradient support (tailwind does not support gradients)
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
