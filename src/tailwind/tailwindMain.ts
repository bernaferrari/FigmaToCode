import { indentString } from "./../common/indentString";
import {
  AltFrameNode,
  AltSceneNode,
  AltRectangleNode,
  AltEllipseNode,
  AltTextNode,
  AltGroupNode,
} from "../altNodes/altMixins";
import { pxToLayoutSize } from "./conversionTables";
import { tailwindVector } from "./vector";
import { TailwindTextBuilder } from "./tailwindTextBuilder";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";
import { retrieveTopFill } from "../common/retrieveFill";

let parentId = "";
let showLayerName = false;

const selfClosingTags = ["img"];

export const tailwindMain = (
  sceneNode: Array<AltSceneNode>,
  parentIdSrc: string = "",
  isJsx: boolean = false,
  layerName: boolean = false
): string => {
  parentId = parentIdSrc;
  showLayerName = layerName;

  let result = tailwindWidgetGenerator(sceneNode, isJsx);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.slice(0, 1) === "\n") {
    result = result.slice(1, result.length);
  }

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const tailwindWidgetGenerator = (
  sceneNode: ReadonlyArray<AltSceneNode>,
  isJsx: boolean
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible !== false);

  visibleSceneNode.forEach((node) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += tailwindContainer(
        node,
        "",
        "",
        { isRelative: false, isInput: false },
        isJsx
      );
    } else if (node.type === "GROUP") {
      comp += tailwindGroup(node, isJsx);
    } else if (node.type === "FRAME") {
      comp += tailwindFrame(node, isJsx);
    } else if (node.type === "TEXT") {
      comp += tailwindText(node, false, isJsx);
    }

    // todo support Line
  });

  return comp;
};

const tailwindGroup = (node: AltGroupNode, isJsx: boolean = false): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width <= 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  const vectorIfExists = tailwindVector(node, showLayerName, parentId, isJsx);
  if (vectorIfExists) return vectorIfExists;

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new TailwindDefaultBuilder(node, showLayerName, isJsx)
    .blend(node)
    .widthHeight(node)
    .position(node, parentId);

  if (builder.attributes || builder.style) {
    const attr = builder.build("relative ");

    const generator = tailwindWidgetGenerator(node.children, isJsx);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return tailwindWidgetGenerator(node.children, isJsx);
};

const tailwindText = (
  node: AltTextNode,
  isInput: boolean,
  isJsx: boolean
): string | [string, string] => {
  // follow the website order, to make it easier

  const builderResult = new TailwindTextBuilder(node, showLayerName, isJsx)
    .blend(node)
    .textAutoSize(node)
    .position(node, parentId)
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
    .textTransform(node);

  const splittedChars = node.characters.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1
      ? node.characters.split("\n").join("<br/>")
      : node.characters;

  if (isInput) {
    return [builderResult.attributes, charsWithLineBreak];
  } else {
    return `\n<p${builderResult.build()}>${charsWithLineBreak}</p>`;
  }
};

const tailwindFrame = (node: AltFrameNode, isJsx: boolean): string => {
  // const vectorIfExists = tailwindVector(node, isJsx);
  // if (vectorIfExists) return vectorIfExists;

  if (
    node.children.length === 1 &&
    node.children[0].type === "TEXT" &&
    node?.name?.toLowerCase().match("input")
  ) {
    const [attr, char] = tailwindText(node.children[0], true, isJsx);
    return tailwindContainer(
      node,
      ` placeholder="${char}"`,
      attr,
      { isRelative: false, isInput: true },
      isJsx
    );
  }

  const childrenStr = tailwindWidgetGenerator(node.children, isJsx);

  if (node.layoutMode !== "NONE") {
    const rowColumn = rowColumnProps(node);
    return tailwindContainer(
      node,
      childrenStr,
      rowColumn,
      { isRelative: false, isInput: false },
      isJsx
    );
  } else {
    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return tailwindContainer(
      node,
      childrenStr,
      "relative ",
      { isRelative: true, isInput: false },
      isJsx
    );
  }
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const tailwindContainer = (
  node: AltFrameNode | AltRectangleNode | AltEllipseNode,
  children: string,
  additionalAttr: string,
  attr: {
    isRelative: boolean;
    isInput: boolean;
  },
  isJsx: boolean
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new TailwindDefaultBuilder(node, showLayerName, isJsx)
    .blend(node)
    .widthHeight(node)
    .autoLayoutPadding(node)
    .position(node, parentId, attr.isRelative)
    .customColor(node.fills, "bg")
    // TODO image and gradient support (tailwind does not support gradients)
    .shadow(node)
    .border(node);

  if (attr.isInput) {
    // children before the > is not a typo.
    return `\n<input${builder.build(additionalAttr)}${children}></input>`;
  }

  if (builder.attributes || additionalAttr) {
    const build = builder.build(additionalAttr);

    // image fill and no children -- let's emit an <img />
    let tag = "div";
    let src = "";
    if (retrieveTopFill(node.fills)?.type === "IMAGE") {
      tag = "img";
      src = ` src="https://via.placeholder.com/${node.width}x${node.height}"`;
    }

    if (children) {
      return `\n<${tag}${build}${src}>${indentString(children)}\n</${tag}>`;
    } else if (selfClosingTags.includes(tag) || isJsx) {
      return `\n<${tag}${build}${src} />`;
    } else {
      return `\n<${tag}${build}${src}></${tag}>`;
    }
  }

  return children;
};

export const rowColumnProps = (node: AltFrameNode): string => {
  // ROW or COLUMN

  // ignore current node when it has only one child and it has the same size
  if (
    node.children.length === 1 &&
    node.children[0].width === node.width &&
    node.children[0].height === node.height
  ) {
    return "";
  }

  // [optimization]
  // flex, by default, has flex-row. Therefore, it can be omitted.
  const rowOrColumn = node.layoutMode === "HORIZONTAL" ? "" : "flex-col ";

  // https://tailwindcss.com/docs/space/
  // space between items
  const spacing = node.itemSpacing > 0 ? pxToLayoutSize(node.itemSpacing) : 0;
  const spaceDirection = node.layoutMode === "HORIZONTAL" ? "x" : "y";

  // space is visually ignored when there is only one child or spacing is zero
  const space =
    node.children.length > 1 && spacing > 0
      ? `space-${spaceDirection}-${spacing} `
      : "";

  // special case when there is only one children; need to position correctly in Flex.
  // let justify = "justify-center";
  // if (node.children.length === 1) {
  //   const nodeCenteredPosX = node.children[0].x + node.children[0].width / 2;
  //   const parentCenteredPosX = node.width / 2;

  //   const marginX = nodeCenteredPosX - parentCenteredPosX;

  //   // allow a small threshold
  //   if (marginX < -4) {
  //     justify = "justify-start";
  //   } else if (marginX > 4) {
  //     justify = "justify-end";
  //   }
  // }
  let primaryAlign: string;

  switch (node.primaryAxisAlignItems) {
    case "MIN":
      primaryAlign = "justify-start ";
      break;
    case "CENTER":
      primaryAlign = "justify-center ";
      break;
    case "MAX":
      primaryAlign = "justify-end ";
      break;
    case "SPACE_BETWEEN":
      primaryAlign = "justify-between ";
      break;
  }

  // [optimization]
  // when all children are STRETCH and layout is Vertical, align won't matter. Otherwise, center it.
  let counterAlign: string;
  switch (node.counterAxisAlignItems) {
    case "MIN":
      counterAlign = "items-start ";
      break;
    case "CENTER":
      counterAlign = "items-center ";
      break;
    case "MAX":
      counterAlign = "items-end ";
      break;
  }

  // const layoutAlign =
  //   node.layoutMode === "VERTICAL" &&
  //   node.children.every((d) => d.layoutAlign === "STRETCH")
  //     ? ""
  //     : `items-center ${justify} `;

  // if parent is a Frame with AutoLayout set to Vertical, the current node should expand
  const flex =
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.layoutMode === node.layoutMode
      ? "flex "
      : "inline-flex ";

  return `${flex}${rowOrColumn}${space}${counterAlign}${primaryAlign}`;
};
