import { indentString } from "../common/indentString";
import { retrieveTopFill } from "../common/retrieveFill";
import { HtmlTextBuilder } from "./htmlTextBuilder";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { htmlAutoLayoutProps } from "./builderImpl/htmlAutoLayout";
import { formatWithJSX } from "../common/parseJSX";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";
import { addWarning } from "../common/commonConversionWarnings";
import { PluginSettings, HTMLPreview, AltNode } from "types";
import { isVisible } from "../common/isVisible";
import { renderAndAttachSVG } from "../altNodes/altNodeUtils";

let showLayerNames = false;

const selfClosingTags = ["img"];

export let isPreviewGlobal = false;

let localSettings: PluginSettings;
let previousExecutionCache: { style: string; text: string }[];

export const htmlMain = async (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
  isPreview: boolean = false,
): Promise<string> => {
  showLayerNames = settings.showLayerNames;
  isPreviewGlobal = isPreview;
  previousExecutionCache = [];
  localSettings = settings;

  let result = await htmlWidgetGenerator(sceneNode, settings.jsx);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

export const generateHTMLPreview = async (
  nodes: SceneNode[],
  settings: PluginSettings,
  code?: string,
): Promise<HTMLPreview> => {
  const htmlCodeAlreadyGenerated =
    settings.framework === "HTML" && settings.jsx === false && code;
  const htmlCode = htmlCodeAlreadyGenerated
    ? code
    : await htmlMain(
        nodes,
        {
          ...settings,
          jsx: false,
        },
        true,
      );

  return {
    size: {
      width: nodes[0].width,
      height: nodes[0].height,
    },
    content: htmlCode,
  };
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const htmlWidgetGenerator = async (
  sceneNode: ReadonlyArray<SceneNode>,
  isJsx: boolean,
): Promise<string> => {
  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const promiseOfConvertedCode = sceneNode
    .filter(isVisible)
    .map(convertNode(isJsx));
  const code = (await Promise.all(promiseOfConvertedCode)).join("");
  return code;
};

const convertNode = (isJsx: boolean) => async (node: SceneNode) => {
  const altNode = await renderAndAttachSVG(node);
  if (altNode.svg) return htmlWrapSVG(altNode, isJsx);

  switch (node.type) {
    case "RECTANGLE":
    case "ELLIPSE":
      return htmlContainer(node, "", [], isJsx);
    case "GROUP":
      return htmlGroup(node, isJsx);
    case "FRAME":
    case "COMPONENT":
    case "INSTANCE":
    case "COMPONENT_SET":
      return htmlFrame(node, isJsx);
    case "SECTION":
      return htmlSection(node, isJsx);
    case "TEXT":
      return htmlText(node, isJsx);
    case "LINE":
      return htmlLine(node, isJsx);
    case "VECTOR":
      addWarning("VectorNodes are not fully supported in HTML");
      return htmlAsset(node, isJsx);
    default:
  }
  return "";
};

const htmlWrapSVG = (node: AltNode<SceneNode>, isJsx: boolean): string => {
  if (node.svg === "") return "";
  const builder = new HtmlDefaultBuilder(node, showLayerNames, isJsx).addData(
    "svg-wrapper",
  );
  return `\n<div${builder.build()}>\n${node.svg ?? ""}</div>`;
};

const htmlGroup = async (
  node: GroupNode,
  isJsx: boolean = false,
): Promise<string> => {
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
    showLayerNames,
    isJsx,
  ).commonPositionStyles(node, localSettings.optimizeLayout);

  if (builder.styles) {
    const attr = builder.build();

    const generator = await htmlWidgetGenerator(node.children, isJsx);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return await htmlWidgetGenerator(node.children, isJsx);
};

// this was split from htmlText to help the UI part, where the style is needed (without <p></p>).
const htmlText = (node: TextNode, isJsx: boolean): string => {
  let layoutBuilder = new HtmlTextBuilder(node, showLayerNames, isJsx)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .textAlign(node);

  const styledHtml = layoutBuilder.getTextSegments(node.id);
  previousExecutionCache.push(...styledHtml);

  let content = "";
  if (styledHtml.length === 1) {
    layoutBuilder.addStyles(styledHtml[0].style);
    content = styledHtml[0].text;

    const additionalTag =
      styledHtml[0].openTypeFeatures.SUBS === true
        ? "sub"
        : styledHtml[0].openTypeFeatures.SUPS === true
          ? "sup"
          : "";

    if (additionalTag) {
      content = `<${additionalTag}>${content}</${additionalTag}>`;
    }
  } else {
    content = styledHtml
      .map((style) => {
        const tag =
          style.openTypeFeatures.SUBS === true
            ? "sub"
            : style.openTypeFeatures.SUPS === true
              ? "sup"
              : "span";

        return `<${tag} style="${style.style}">${style.text}</${tag}>`;
      })
      .join("");
  }

  return `\n<div${layoutBuilder.build()}>${content}</div>`;
};

const htmlFrame = async (
  node: SceneNode & BaseFrameMixin,
  isJsx: boolean = false,
): Promise<string> => {
  const childrenStr = await htmlWidgetGenerator(
    commonSortChildrenWhenInferredAutoLayout(
      node,
      localSettings.optimizeLayout,
    ),
    isJsx,
  );

  if (node.layoutMode !== "NONE") {
    const rowColumn = htmlAutoLayoutProps(node, node, isJsx);
    return htmlContainer(node, childrenStr, rowColumn, isJsx);
  } else {
    if (localSettings.optimizeLayout && node.inferredAutoLayout !== null) {
      const rowColumn = htmlAutoLayoutProps(
        node,
        node.inferredAutoLayout,
        isJsx,
      );
      return htmlContainer(node, childrenStr, rowColumn, isJsx);
    }

    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return htmlContainer(node, childrenStr, [], isJsx);
  }
};

const htmlAsset = (node: SceneNode, isJsx: boolean = false): string => {
  if (!("opacity" in node) || !("layoutAlign" in node) || !("fills" in node)) {
    return "";
  }

  const builder = new HtmlDefaultBuilder(node, showLayerNames, isJsx)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .commonShapeStyles(node);

  let tag = "div";
  let src = "";
  if (retrieveTopFill(node.fills)?.type === "IMAGE") {
    addWarning("Image fills are replaced with placeholders");
    tag = "img";
    src = ` src="https://via.placeholder.com/${node.width.toFixed(
      0,
    )}x${node.height.toFixed(0)}"`;
  }

  if (tag === "div") {
    return `\n<div${builder.build()}${src}></div>`;
  }

  return `\n<${tag}${builder.build()}${src} />`;
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
const htmlContainer = (
  node: SceneNode &
    SceneNodeMixin &
    BlendMixin &
    LayoutMixin &
    GeometryMixin &
    MinimalBlendMixin,
  children: string,
  additionalStyles: string[] = [],
  isJsx: boolean,
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height <= 0) {
    return children;
  }

  const builder = new HtmlDefaultBuilder(node, showLayerNames, isJsx)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .commonShapeStyles(node);

  if (builder.styles || additionalStyles) {
    let tag = "div";
    let src = "";
    if (retrieveTopFill(node.fills)?.type === "IMAGE") {
      addWarning("Image fills are replaced with placeholders");
      if (!("children" in node) || node.children.length === 0) {
        tag = "img";
        src = ` src="https://via.placeholder.com/${node.width.toFixed(
          0,
        )}x${node.height.toFixed(0)}"`;
      } else {
        builder.addStyles(
          formatWithJSX(
            "background-image",
            isJsx,
            `url(https://via.placeholder.com/${node.width.toFixed(
              0,
            )}x${node.height.toFixed(0)})`,
          ),
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

const htmlSection = async (
  node: SectionNode,
  isJsx: boolean = false,
): Promise<string> => {
  const childrenStr = await htmlWidgetGenerator(node.children, isJsx);
  const builder = new HtmlDefaultBuilder(node, showLayerNames, isJsx)
    .size(node, localSettings.optimizeLayout)
    .position(node, localSettings.optimizeLayout)
    .applyFillsToStyle(node.fills, "background");

  if (childrenStr) {
    return `\n<div${builder.build()}>${indentString(childrenStr)}\n</div>`;
  } else {
    return `\n<div${builder.build()}></div>`;
  }
};

const htmlLine = (node: LineNode, isJsx: boolean): string => {
  const builder = new HtmlDefaultBuilder(node, showLayerNames, isJsx)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .commonShapeStyles(node);

  return `\n<div${builder.build()}></div>`;
};

export const htmlCodeGenTextStyles = (isJsx: boolean) => {
  const result = previousExecutionCache
    .map(
      (style) =>
        `// ${style.text}\n${style.style.split(isJsx ? "," : ";").join(";\n")}`,
    )
    .join("\n---\n");

  if (!result) {
    return "// No text styles in this selection";
  }
  return result;
};
