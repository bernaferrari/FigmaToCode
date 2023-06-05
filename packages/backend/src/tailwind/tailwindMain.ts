import { retrieveTopFill } from "../common/retrieveFill";
import { indentString } from "../common/indentString";
import { tailwindVector } from "./vector";
import { TailwindTextBuilder } from "./tailwindTextBuilder";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";
import { PluginSettings } from "../code";
import { tailwindAutoLayoutProps } from "./builderImpl/tailwindAutoLayout";

let globalLocalSettings: PluginSettings;

const selfClosingTags = ["img"];

export const tailwindMain = (
  sceneNode: Array<SceneNode>,
  localSettings: PluginSettings
): string => {
  globalLocalSettings = localSettings;
  let result = tailwindWidgetGenerator(sceneNode, localSettings.jsx);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const tailwindWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>,
  isJsx: boolean
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible);
  visibleSceneNode.forEach((node) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += tailwindContainer(node, "", "", isJsx);
    } else if (node.type === "GROUP") {
      comp += tailwindGroup(node, isJsx);
    } else if (node.type === "FRAME") {
      comp += tailwindFrame(node, isJsx);
    } else if (node.type === "TEXT") {
      comp += tailwindText(node, isJsx);
    }

    // todo support Line
  });

  return comp;
};

const tailwindGroup = (node: GroupNode, isJsx: boolean = false): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width <= 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  const vectorIfExists = tailwindVector(
    node,
    globalLocalSettings.layerName,
    "",
    isJsx
  );
  if (vectorIfExists) return vectorIfExists;

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new TailwindDefaultBuilder(
    node,
    globalLocalSettings.layerName,
    isJsx
  )
    .blend(node)
    .size(node)
    .position(node, globalLocalSettings.optimizeLayout);

  if (builder.attributes || builder.style) {
    const attr = builder.build("relative");

    const generator = tailwindWidgetGenerator(node.children, isJsx);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return tailwindWidgetGenerator(node.children, isJsx);
};

export const tailwindText = (node: TextNode, isJsx: boolean): string => {
  let layoutBuilder = new TailwindTextBuilder(
    node,
    globalLocalSettings.layerName,
    isJsx
  )
    .commonPositionStyles(node, globalLocalSettings.optimizeLayout)
    .textAlign(node);

  const styledHtml = layoutBuilder.getTextSegments(node.id);

  let content = "";
  if (styledHtml.length === 1) {
    layoutBuilder.addAttributes(styledHtml[0].style);
    content = styledHtml[0].text;
  } else {
    content = styledHtml
      .map((style) => `<span style="${style.style}">${style.text}</span>`)
      .join("");
  }

  return `\n<div${layoutBuilder.build()}>${content}</div>`;
};

const tailwindFrame = (node: FrameNode, isJsx: boolean): string => {
  const childrenStr = tailwindWidgetGenerator(node.children, isJsx);

  if (node.layoutMode !== "NONE") {
    const rowColumn = tailwindAutoLayoutProps(node, node);
    return tailwindContainer(node, childrenStr, rowColumn, isJsx);
  } else {
    if (
      globalLocalSettings.optimizeLayout &&
      node.inferredAutoLayout !== null
    ) {
      const rowColumn = tailwindAutoLayoutProps(node, node.inferredAutoLayout);
      return tailwindContainer(node, childrenStr, rowColumn, isJsx);
    }

    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return tailwindContainer(node, childrenStr, "relative", isJsx);
  }
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const tailwindContainer = (
  node: FrameNode | RectangleNode | EllipseNode,
  children: string,
  additionalAttr: string,
  isJsx: boolean
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  let builder = new TailwindDefaultBuilder(
    node,
    globalLocalSettings.layerName,
    isJsx
  )
    .commonPositionStyles(node, globalLocalSettings.optimizeLayout)
    .commonShapeStyles(node);

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
