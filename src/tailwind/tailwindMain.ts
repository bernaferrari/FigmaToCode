import {
  AltFrameNode,
  AltSceneNode,
  AltRectangleNode,
  AltEllipseNode,
  AltTextNode,
  AltGroupNode,
} from "../common/altMixins";
import { pxToLayoutSize } from "./conversionTables";
import { tailwindVector } from "./vector";
import { tailwindTextNodeBuilder } from "./builderText";
import { tailwindDefaultBuilder } from "./builderDefault";

let parentId = "";

let isJsx = false;

let showLayerName = false;

export const tailwindMain = (
  parentId_src: string,
  sceneNode: Array<AltSceneNode>,
  jsx: boolean,
  layerName: boolean
): string => {
  parentId = parentId_src;
  isJsx = jsx;
  showLayerName = layerName;

  let result = tailwindWidgetGenerator(sceneNode);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.slice(0, 1) === "\n") {
    result = result.slice(1, result.length);
  }

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const tailwindWidgetGenerator = (
  sceneNode: ReadonlyArray<AltSceneNode>
): string => {
  let comp = "";

  sceneNode.forEach((node) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += tailwindContainer(node, "");
    } else if (node.type === "GROUP") {
      comp += tailwindGroup(node);
    } else if (
      node.type === "FRAME"
      //  || node.type === "INSTANCE" ||
      // node.type === "COMPONENT"
    ) {
      comp += tailwindFrame(node);
    } else if (node.type === "TEXT") {
      comp += tailwindText(node);
    }
    // todo support Line
    // else if (node.type === "LINE") {
    // comp += tailwindLine(node);
    // }
  });

  return comp;
};

// const tailwindLine = (node: LineNode): string => {
//   // todo Height is always zero on Lines
//   const builder = new tailwindAttributesBuilder("", isJsx, node.visible)
//     .visibility(node)
//     .widthHeight(node)
//     .containerPosition(node, parentId)
//     .layoutAlign(node, parentId)
//     .opacity(node)
//     .rotation(node)
//     .shadow(node)
//     .customColor(node.strokes, "border")
//     .borderWidth(node)
//     .borderRadius(node);

//   if (builder.attributes) {
//     return `\n<div ${builder.buildAttributes()}></div>`;
//   }
//   return "";
// };

const tailwindGroup = (node: AltGroupNode): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width <= 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  const vectorIfExists = tailwindVector(node, isJsx);
  if (vectorIfExists) return vectorIfExists;

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new tailwindDefaultBuilder(isJsx, node, showLayerName)
    .blend(node)
    .position(node, parentId)
    .widthHeight(node);

  // if [attributes] is "relative" and builder contains "absolute", ignore the "relative"
  // https://stackoverflow.com/a/39691113
  // if (builder.attributes.includes("absolute")) {
  //   attributes = "";
  // }

  if (builder.attributes) {
    // todo include autoAutoLayout here
    const attr = builder.build("relative ");
    return `\n<div ${attr}>${tailwindWidgetGenerator(node.children)}</div>`;
  }

  return tailwindWidgetGenerator(node.children);
};

const tailwindText = (node: AltTextNode): string => {
  // follow the website order, to make it easier

  const builderResult = new tailwindTextNodeBuilder(isJsx, node, showLayerName)
    .blend(node)
    .position(node, parentId)
    .textAutoSize(node)
    // todo fontFamily (via node.fontName !== figma.mixed ? `fontFamily: ${node.fontName.family}`)
    // todo font smoothing
    .fontSize(node)
    .fontStyle(node)
    .letterSpacing(node)
    .lineHeight(node)
    .textDecoration(node)
    // todo text lists (<li>)
    .textAlign(node)
    .customColor(node.fills, "text")
    .textTransform(node)
    .build();

  const splittedChars = node.characters.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1
      ? node.characters.split("\n").join("<br></br>")
      : node.characters;

  return `<p ${builderResult}>${charsWithLineBreak}</p>`;
};

const tailwindFrame = (node: AltFrameNode): string => {
  const vectorIfExists = tailwindVector(node, isJsx);
  if (vectorIfExists) return vectorIfExists;

  const childrenStr = tailwindWidgetGenerator(node.children);

  if (node.layoutMode !== "NONE") {
    const rowColumn = rowColumnProps(node);
    return tailwindContainer(node, childrenStr, rowColumn);
  } else if (node.layoutMode === "NONE" && node.children.length > 1) {
    // children will need to be absolute
    return tailwindContainer(node, childrenStr, "relative ");
  } else {
    // todo is this still used? I think Auto AutoLayout has deprecated it.
    // node.layoutMode === "NONE" && node.children.length === 1
    // children doesn't need to be absolute, but might need to be positioned
    // TODO maybe just add margin right/left/top/bottom can solve?
    return tailwindContainer(node, childrenStr, "");
  }
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const tailwindContainer = (
  node: AltFrameNode | AltRectangleNode | AltEllipseNode,
  // | LineNode,
  children: string,
  additionalAttr: string = ""
) => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new tailwindDefaultBuilder(isJsx, node, showLayerName)
    .blend(node)
    .autoLayoutPadding(node)
    .position(node, parentId)
    .widthHeight(node)
    .customColor(node.fills, "bg")
    // TODO image and gradient support (tailwind does not support gradients)
    .shadow(node)
    .border(node);

  if (builder.attributes || additionalAttr) {
    return `\n<div ${builder.build(additionalAttr)}>${children}</div>`;
  }
  return children;
};

export const rowColumnProps = (node: AltFrameNode): string => {
  // ROW or COLUMN

  // if children is a child that is a FRAME without AutoLayout, ignore and return here
  if (
    node.children.length === 1 &&
    "layoutMode" in node.children[0] &&
    node.children[0].layoutMode !== "NONE"
  ) {
    return "";
  }

  // if children is a child with STRETCH, ignore and return here
  if (
    node.children.length === 1 &&
    node.children[0].layoutAlign === "STRETCH"
  ) {
    return "";
  }

  // [optimization]
  // flex, by default, has flex-row. Therefore, it can be omitted.
  let rowOrColumn = node.layoutMode === "HORIZONTAL" ? "" : "flex-col ";

  // https://tailwindcss.com/docs/space/
  // space between items
  const spacing = node.itemSpacing > 0 ? pxToLayoutSize(node.itemSpacing) : 0;
  const spaceDirection = node.layoutMode === "HORIZONTAL" ? "x" : "y";

  // space is visually ignored when there is only one child or spacing is zero
  const space =
    node.children.length > 1 && spacing > 0
      ? `space-${spaceDirection}-${spacing} `
      : "";

  // align according to the most frequent way the children are aligned.
  // todo layoutAlign should go to individual fields and this should be threated as an optimization
  // const layoutAlign =
  //   mostFrequentString(node.children.map((d) => d.layoutAlign)) === "MIN"
  //     ? ""
  //     : "items-center ";

  // [optimization]
  // when all children are STRETCH and layout is Vertical, align won't matter. Otherwise, center it.
  const layoutAlign =
    node.layoutMode === "VERTICAL" &&
    node.children.every((d) => d.layoutAlign === "STRETCH")
      ? ""
      : "items-center justify-center ";

  // if parent is a Frame with AutoLayout set to Vertical, the current node should expand
  const flex =
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.layoutMode === node.layoutMode
      ? "flex "
      : "inline-flex ";

  return `${flex}${rowOrColumn}${space}${layoutAlign}`;
};
