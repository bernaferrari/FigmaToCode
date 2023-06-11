import { indentString } from "../common/indentString";
import { retrieveTopFill } from "../common/retrieveFill";
import { HtmlTextBuilder } from "./htmlTextBuilder";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { PluginSettings } from "../code";
import { htmlAutoLayoutProps } from "./builderImpl/htmlAutoLayout";
import { formatWithJSX } from "../common/parseJSX";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";

let showLayerName = false;

const selfClosingTags = ["img"];

export let isPreviewGlobal = false;

let localSettings: PluginSettings;
let previousExecutionCache: { style: string; text: string }[];

export const htmlMain = (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
  isPreview: boolean = false
): string => {
  showLayerName = settings.layerName;
  isPreviewGlobal = isPreview;
  previousExecutionCache = [];
  localSettings = settings;

  let result = htmlWidgetGenerator(sceneNode, settings.jsx);

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
  visibleSceneNode.forEach((node, index) => {
    // if (node.isAsset || ("isMask" in node && node.isMask === true)) {
    //   comp += htmlAsset(node, isJsx);
    // }

    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
        comp += htmlContainer(node, "", [], isJsx);
        break;
      case "GROUP":
        comp += htmlGroup(node, isJsx);
        break;
      case "FRAME":
      case "COMPONENT":
      case "INSTANCE":
      case "COMPONENT_SET":
        comp += htmlFrame(node, isJsx);
        break;
      case "SECTION":
        comp += htmlSection(node, isJsx);
        break;
      case "TEXT":
        comp += htmlText(node, isJsx);
        break;
      case "LINE":
        comp += htmlLine(node, isJsx);
        break;
      case "VECTOR":
        comp += htmlAsset(node, isJsx);
    }
  });

  return comp;
};

const htmlGroup = (node: GroupNode, isJsx: boolean = false): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  // const vectorIfExists = tailwindVector(node, isJsx);
  // if (vectorIfExists) return vectorIfExists;

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new HtmlDefaultBuilder(
    node,
    showLayerName,
    isJsx
  ).commonPositionStyles(node, localSettings.optimizeLayout);

  if (builder.styles) {
    const attr = builder.build();

    const generator = htmlWidgetGenerator(node.children, isJsx);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return htmlWidgetGenerator(node.children, isJsx);
};

// this was split from htmlText to help the UI part, where the style is needed (without <p></p>).
export const htmlText = (node: TextNode, isJsx: boolean): string => {
  let layoutBuilder = new HtmlTextBuilder(node, showLayerName, isJsx)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .textAlign(node);

  const styledHtml = layoutBuilder.getTextSegments(node.id);
  previousExecutionCache.push(...styledHtml);

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

const htmlFrame = (
  node: SceneNode & BaseFrameMixin,
  isJsx: boolean = false
): string => {
  const childrenStr = htmlWidgetGenerator(
    commonSortChildrenWhenInferredAutoLayout(
      node,
      localSettings.optimizeLayout
    ),
    isJsx
  );

  if (node.layoutMode !== "NONE") {
    const rowColumn = htmlAutoLayoutProps(node, node, isJsx);
    return htmlContainer(node, childrenStr, rowColumn, isJsx);
  } else {
    if (localSettings.optimizeLayout && node.inferredAutoLayout !== null) {
      const rowColumn = htmlAutoLayoutProps(
        node,
        node.inferredAutoLayout,
        isJsx
      );
      return htmlContainer(node, childrenStr, rowColumn, isJsx);
    }

    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return htmlContainer(node, childrenStr, [], isJsx);
  }
};

export const htmlAsset = (node: SceneNode, isJsx: boolean = false): string => {
  if (!("opacity" in node) || !("layoutAlign" in node) || !("fills" in node)) {
    return "";
  }

  const builder = new HtmlDefaultBuilder(node, showLayerName, isJsx)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .commonShapeStyles(node);

  let tag = "div";
  let src = "";
  if (retrieveTopFill(node.fills)?.type === "IMAGE") {
    tag = "img";
    src = ` src="https://via.placeholder.com/${node.width.toFixed(
      0
    )}x${node.height.toFixed(0)}"`;
  }

  if (tag === "div") {
    return `\n<div${builder.build()}${src}></div>`;
  }

  return `\n<${tag}${builder.build()}${src} />`;
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const htmlContainer = (
  node: SceneNode &
    SceneNodeMixin &
    BlendMixin &
    LayoutMixin &
    GeometryMixin &
    MinimalBlendMixin,
  children: string,
  additionalStyles: string[] = [],
  isJsx: boolean
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height <= 0) {
    return children;
  }

  const builder = new HtmlDefaultBuilder(node, showLayerName, isJsx)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .commonShapeStyles(node);

  if (builder.styles || additionalStyles) {
    let tag = "div";
    let src = "";
    if (retrieveTopFill(node.fills)?.type === "IMAGE") {
      if (!("children" in node) || node.children.length === 0) {
        tag = "img";
        src = ` src="https://via.placeholder.com/${node.width.toFixed(
          0
        )}x${node.height.toFixed(0)}"`;
      } else {
        builder.addStyles(
          formatWithJSX(
            "background-image",
            isJsx,
            `url(https://via.placeholder.com/${node.width.toFixed(
              0
            )}x${node.height.toFixed(0)})`
          )
        );
      }
    }

    const build = builder.build(additionalStyles);

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

export const htmlSection = (
  node: SectionNode,
  isJsx: boolean = false
): string => {
  const childrenStr = htmlWidgetGenerator(node.children, isJsx);
  const builder = new HtmlDefaultBuilder(node, showLayerName, isJsx)
    .size(node, localSettings.optimizeLayout)
    .position(node, localSettings.optimizeLayout)
    .applyFillsToStyle(node.fills, "background");

  if (childrenStr) {
    return `\n<div${builder.build()}>${indentString(childrenStr)}\n</div>`;
  } else {
    return `\n<div${builder.build()}></div>`;
  }
};

export const htmlLine = (node: LineNode, isJsx: boolean): string => {
  const builder = new HtmlDefaultBuilder(node, showLayerName, isJsx)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .commonShapeStyles(node);

  return `\n<div${builder.build()}></div>`;
};

export const htmlCodeGenTextStyles = (isJsx: boolean) => {
  const result = previousExecutionCache
    .map(
      (style) =>
        `// ${style.text}\n${style.style.split(isJsx ? "," : ";").join(";\n")}`
    )
    .join("\n---\n");

  if (!result) {
    return "// No text styles in this selection";
  }
  return result;
};
