import { formatWithJSX } from "../common/parseJSX";
import { indentString } from "../common/indentString";
import { retrieveTopFill } from "../common/retrieveFill";
import { HtmlTextBuilder } from "./htmlTextBuilder";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";

let parentId = "";

let showLayerName = false;

const selfClosingTags = ["img"];

export let isPreviewGlobal = false;

export const htmlMain = (
  sceneNode: Array<SceneNode>,
  parentIdSrc: string = "",
  isJsx: boolean = false,
  layerName: boolean = false,
  isPreview: boolean = false
): string => {
  parentId = parentIdSrc;
  showLayerName = layerName;
  isPreviewGlobal = isPreview;

  let result = htmlWidgetGenerator(sceneNode, isJsx);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const htmlWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>,
  isJsx: boolean
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible);

  const sceneLen = visibleSceneNode.length;

  visibleSceneNode.forEach((node, index) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += htmlContainer(node, "", [], isJsx);
    } else if (node.type === "GROUP") {
      comp += htmlGroup(node, isJsx);
    } else if (node.type === "FRAME") {
      comp += htmlFrame(node, isJsx);
    } else if (node.type === "TEXT") {
      comp += htmlText(node, isJsx);
    } else if (node.type === "LINE") {
      comp += htmlLine(node, isJsx);
    }

    // comp += addSpacingIfNeeded(node, index, sceneLen, isJsx);
  });

  return comp;
};

const htmlGroup = (node: GroupNode, isJsx: boolean = false): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width <= 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  // const vectorIfExists = tailwindVector(node, isJsx);
  // if (vectorIfExists) return vectorIfExists;

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new HtmlDefaultBuilder(
    node,
    showLayerName,
    isJsx
  ).commonPositionStyles(node);

  if (builder.styles) {
    const attr = builder.build([formatWithJSX("position", isJsx, "relative")]);

    const generator = htmlWidgetGenerator(node.children, isJsx);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return htmlWidgetGenerator(node.children, isJsx);
};

// this was split from htmlText to help the UI part, where the style is needed (without <p></p>).
export const htmlText = (node: TextNode, isJsx: boolean): string => {
  let layoutBuilder = new HtmlTextBuilder(node, showLayerName, isJsx)
    .commonPositionStyles(node)
    .textAlign(node)
    .textTransform(node);

  const styledHtml = layoutBuilder.getTextSegments(node.id);

  let content = "";
  if (styledHtml.length === 1) {
    layoutBuilder.addStyles(styledHtml[0].style);
    content = styledHtml[0].text;
  } else {
    content = styledHtml
      .map((style) => `<span style="${style.style}">${style.text}</span>`)
      .join("");
  }

  return `\n<div${layoutBuilder.build()}>${content}</div>`;
};

const htmlFrame = (node: FrameNode, isJsx: boolean = false): string => {
  // const vectorIfExists = tailwindVector(node, isJsx);
  // if (vectorIfExists) return vectorIfExists;

  // if (
  //   node.children.length === 1 &&
  //   node.children[0].type === "TEXT" &&
  //   node?.name?.toLowerCase().match("input")
  // ) {
  //   const isInput = true;
  //   const [attr, char] = htmlText(node.children[0], isInput, isJsx);
  //   return htmlContainer(
  //     node,
  //     ` placeholder="${char}"`,
  //     [attr],
  //     isJsx,
  //     isInput
  //   );
  // }

  const childrenStr = htmlWidgetGenerator(node.children, isJsx);

  if (node.layoutMode !== "NONE") {
    const rowColumn = rowColumnProps(node, isJsx);
    return htmlContainer(node, childrenStr, rowColumn, isJsx);
  } else {
    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return htmlContainer(
      node,
      childrenStr,
      [formatWithJSX("position", isJsx, "relative")],
      isJsx,
      false,
      false
    );
  }
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const htmlContainer = (
  node: FrameNode | RectangleNode | EllipseNode,
  children: string,
  additionalStyles: string[] = [],
  isJsx: boolean,
  isInput: boolean = false,
  isRelative: boolean = false
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new HtmlDefaultBuilder(node, showLayerName, isJsx)
    .commonPositionStyles(node)
    .commonShapeStyles(node);

  // if (isInput) {
  //   return `\n<input${builder.build(additionalStyle)}${children}></input>`;
  // }

  if (builder.styles || additionalStyles) {
    const build = builder.build(additionalStyles);

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

export const htmlLine = (node: LineNode, isJsx: boolean): string => {
  const builder = new HtmlDefaultBuilder(node, showLayerName, isJsx)
    .commonPositionStyles(node)
    .commonShapeStyles(node);

  return `\n<div${builder.build()}></div>`;
};

export const rowColumnProps = (node: FrameNode, isJsx: boolean): string[] => {
  // ROW or COLUMN

  // [optimization]
  // flex, by default, has flex-row. Therefore, it can be omitted.
  let rowOrColumn = "";
  if (node.layoutMode === "VERTICAL") {
    rowOrColumn = formatWithJSX("flex-direction", isJsx, "column");
  }

  let primaryAlign: string;
  switch (node.primaryAxisAlignItems) {
    case "MIN":
      primaryAlign = "flex-start";
      break;
    case "CENTER":
      primaryAlign = "center";
      break;
    case "MAX":
      primaryAlign = "flex-end";
      break;
    case "SPACE_BETWEEN":
      primaryAlign = "space-between";
      break;
  }
  primaryAlign = formatWithJSX("justify-content", isJsx, primaryAlign);

  let counterAlign: string = "";
  switch (node.counterAxisAlignItems) {
    case "MIN":
      counterAlign = "flex-start";
      break;
    case "CENTER":
      counterAlign = "center";
      break;
    case "MAX":
      counterAlign = "flex-end";
      break;
    case "BASELINE":
      break;
  }
  counterAlign = formatWithJSX("align-items", isJsx, counterAlign);

  // if parent is a Frame with AutoLayout set to Vertical, the current node should expand
  let display =
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.layoutMode === node.layoutMode
      ? "flex"
      : "inline-flex";
  display = formatWithJSX("display", isJsx, display);

  return [
    display,
    rowOrColumn,
    counterAlign,
    primaryAlign,
    formatWithJSX("gap", isJsx, node.itemSpacing),
  ];
};
