import { mostFrequentString, vectorColor } from "./tailwind_helpers";
import { rowColumnProps, getContainerSizeProp } from "./tailwind_widget";
import { tailwindAttributesBuilder } from "./tailwind_builder";
import {
  convertPxToTailwindAttr,
  mapWidthHeightSize,
  isInsideAutoAutoLayout,
  retrieveAALOrderedChildren,
} from "./tailwind_wrappers";

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
    }
  });

  return comp;
};

const tailwindGroup = (node: GroupNode): string => {
  // TODO generate Rows or Columns instead of Stack when Group is simple enough (two or three items) and they aren't on top of one another.

  // experiment: completely ignore Groups
  return tailwindWidgetGenerator(retrieveAALOrderedChildren(node));

  // if (node.children.length === 1) {
  //   // ignore group if possible
  //   return tailwindWidgetGenerator(node.children);
  // }

  // const attributes = autoAutoLayoutAttr(node);

  // // don't generate size for group because its size is derived from children
  // const size = getContainerSizeProp(node);

  // // retrieve the children ordered when AutoAutoLayout is identified
  // return `<div class=\"${size}${attributes}\">${tailwindWidgetGenerator(
  //   retrieveAALOrderedChildren(node)
  // )}</div>`;
};

const tailwindText = (node: TextNode): string => {
  // follow the website order, to make it easier
  const builderResult = new tailwindAttributesBuilder()
    .visibility(node)
    .containerPosition(node, parentId)
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
      ? `<br>${node.characters.split("\n").join("</br><br>")}<\\br>`
      : node.characters;

  return `<p ${builderResult}> ${charsWithLineBreak} </p>`;
};

const autoAutoLayoutAttr = (
  node: FrameNode | ComponentNode | InstanceNode | GroupNode
): string => {
  node.children.forEach((d) => {
    node.children.forEach((dd) => {
      if (
        (d !== dd && d.x > dd.x && d.x < dd.x + dd.width) ||
        (d.y > dd.y && d.y < dd.y + dd.height)
      ) {
        // detect colision
        // parent is relative. The children shall be absolute
        return "relative";
      }
    });
  });

  const autoAutoLayout = isInsideAutoAutoLayout(node);

  if (autoAutoLayout[0] === "false") {
    return "relative";
  }

  // https://tailwindcss.com/docs/space/
  // space between items
  const spacing = convertPxToTailwindAttr(
    mostFrequentString(autoAutoLayout[1]),
    mapWidthHeightSize
  );

  const rowOrColumn = autoAutoLayout[0] === "sd-x" ? "flex-row " : "flex-col ";
  const spaceDirection: "x" | "y" = autoAutoLayout[0] === "sd-x" ? "x" : "y";
  const space = `space-${spaceDirection}-${spacing} `;

  const orderedChildren: Array<SceneNode> = [...node.children].sort(
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
  const contentAlign = isCentered ? "content-center" : "";

  // align according to the most frequent way the children are aligned.
  // const layoutAlign =
  //   mostFrequentString(node.children.map((d) => d.layoutAlign)) === "MIN"
  //     ? ""
  //     : "justify-center ";

  const flex =
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.layoutMode !== "NONE"
      ? "flex "
      : "inline-flex ";

  return `${flex}${rowOrColumn}${space}${contentAlign}items-center`;
};

const tailwindFrame = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  const children = tailwindWidgetGenerator(node.children);

  if (node.layoutMode === "NONE" && node.children.length > 1) {
    // const rowColumn = autoAutoLayoutAttr(node);
    return tailwindContainer(node, children, "");
  } else if (node.children.length > 1) {
    const rowColumn = rowColumnProps(node);
    return tailwindContainer(node, children, rowColumn);
  } else {
    return tailwindContainer(node, children, "");
  }
};

const tailwindVector = (node: VectorNode) => {
  // ignore when invisible
  if (node.visible === false) {
    return "";
  }

  const builder = new tailwindAttributesBuilder()
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
