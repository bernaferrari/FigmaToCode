import {
  makeContainer,
  makeTextComponent,
  rowColumnProps,
} from "./tailwind_widget";
import { tailwindAttributesBuilder } from "./tailwind_builder";
import { retrieveContainerPosition } from "./tailwind_wrappers";

let parentId = "";

export const tailwindMain = (
  parentId_src: string,
  sceneNode: ReadonlyArray<SceneNode>
): string => {
  parentId = parentId_src;
  return tailwindWidgetGenerator(sceneNode);
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const tailwindWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>
): string => {
  let comp = "";

  sceneNode.forEach((node) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
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
    }
  });

  return comp;
};

const tailwindGroup = (node: GroupNode): string => {
  // TODO generate Rows or Columns instead of Stack when Group is simple enough (two or three items) and they aren't on top of one another.
  return `<div class=\"relative\">${tailwindWidgetGenerator(
    node.children
  )}</div>`;
};

const tailwindText = (node: TextNode): string => {
  // follow the website order, to make it easier
  const builderResult = new tailwindAttributesBuilder()
    .containerPosition(node, parentId)
    // todo fontFamily (via node.fontName !== figma.mixed ? `fontFamily: ${node.fontName.family}`)
    // todo font smoothing
    .fontSize(node)
    .fontStyle(node)
    .letterSpacing(node)
    .lineHeight(node)
    // todo text lists (<li>)
    .textAlign(node)
    .customColor(node.fills, "text")
    .textTransform(node)
    .buildAttributes();

  const splittedChars = node.characters.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1
      ? `<br>${node.characters.split("\n").join("</br><br>")}<\\br>`
      : node.characters;

  return `<p ${builderResult}> ${charsWithLineBreak} </p>`;
};

const tailwindFrame = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  const children = tailwindWidgetGenerator(node.children);

  if (node.layoutMode === "NONE" && node.children.length > 1) {
    // parent is relative. The children shall be absolute
    return tailwindContainer(node, children, "relative");
  } else if (node.children.length > 1) {
    const rowColumn = rowColumnProps(node);
    return tailwindContainer(node, children, rowColumn);
  } else {
    return tailwindContainer(node, children);
  }
};

const tailwindVector = (node: VectorNode) => {
  // TODO Vector support.
  return `<div height=\"${node.height}\" width=\"${node.width}\"></div>`;
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
    | FrameNode
    | InstanceNode
    | ComponentNode
    | EllipseNode,
  children: string,
  additionalAttr: string = ""
) => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new tailwindAttributesBuilder()
    .widthHeight(node)
    .autoLayoutPadding(node)
    .containerPosition(node, parentId)
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
