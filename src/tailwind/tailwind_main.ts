import { tailwindAttributesBuilder } from "./tailwind_builder";
import { pxToLayoutSize } from "./conversion_tables";
import { CustomNode } from "./custom_node";
import { tailwindVector } from "./vector";
import { convertIntoAltNodes } from "../common/AltConversion";

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
    console.log("ALTERNATIVEEEE ISSS ");
    console.log(convertIntoAltNodes(sceneNode, undefined));
    return "";
    // return tailwindWidgetGenerator(sceneNode);
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
  // todo Height is always zero on Lines
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

  if (builder.attributes) {
    return `\n<div ${builder.buildAttributes()}></div>`;
  }
  return "";
};

const tailwindGroup = (node: GroupNode): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width <= 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  const vectorIfExists = tailwindVector(node, isJsx);
  if (vectorIfExists) return vectorIfExists;

  const customNode = new CustomNode(node);
  let childrenStr = tailwindWidgetGenerator(customNode.orderedChildren);
  let attr = customNode.attributes;

  console.log(
    "entering in node: ",
    node.name,
    "attr: ",
    attr,
    customNode.largestNode
  );
  if (customNode.largestNode) {
    console.log(
      "has largest node ",
      customNode.largestNode.name,
      "attr:",
      attr,
      "childrenStr",
      childrenStr
    );
    // override it with a parent
    childrenStr = tailwindContainer(customNode.largestNode, childrenStr, attr);

    if (childrenStr) {
      return childrenStr;
    }
    // console.log("result after merger ", childrenStr);

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

  console.log("builder attributes ", builder.attributes);

  if (builder.attributes || attr) {
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
  const vectorIfExists = tailwindVector(node, isJsx);
  if (vectorIfExists) return vectorIfExists;

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

export const rowColumnProps = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  // ROW or COLUMN

  // [optimization]
  // flex, by default, has flex-row. Therefore, it can be omitted.
  let rowOrColumn = node.layoutMode === "HORIZONTAL" ? "" : "flex-col ";

  // https://tailwindcss.com/docs/space/
  // space between items
  const spacing = node.itemSpacing > 0 ? pxToLayoutSize(node.itemSpacing) : 0;
  const spaceDirection = node.layoutMode === "HORIZONTAL" ? "x" : "y";

  // space is visually ignored when there is only one child
  const space =
    node.children.length === 1 || spacing > 0
      ? `space-${spaceDirection}-${spacing} `
      : "";

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
