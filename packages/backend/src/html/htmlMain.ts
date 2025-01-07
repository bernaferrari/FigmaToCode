import { indentString } from "../common/indentString";
import { retrieveTopFill } from "../common/retrieveFill";
import { HtmlTextBuilder } from "./htmlTextBuilder";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { htmlAutoLayoutProps } from "./builderImpl/htmlAutoLayout";
import { formatWithJSX } from "../common/parseJSX";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";
import { addWarning } from "../common/commonConversionWarnings";
import { PluginSettings, HTMLPreview, AltNode, HTMLSettings } from "types";
import { renderAndAttachSVG } from "../altNodes/altNodeUtils";
import { getVisibleNodes } from "../common/nodeVisibility";

const selfClosingTags = ["img"];

export let isPreviewGlobal = false;

let previousExecutionCache: { style: string; text: string }[];

export const htmlMain = async (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
  isPreview: boolean = false,
): Promise<string> => {
  isPreviewGlobal = isPreview;
  previousExecutionCache = [];

  let result = await htmlWidgetGenerator(sceneNode, settings);

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
  settings: HTMLSettings,
): Promise<string> => {
  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const promiseOfConvertedCode = getVisibleNodes(sceneNode).map(
    convertNode(settings),
  );
  const code = (await Promise.all(promiseOfConvertedCode)).join("");
  return code;
};

const convertNode = (settings: HTMLSettings) => async (node: SceneNode) => {
  const altNode = await renderAndAttachSVG(node);
  if (altNode.svg) return htmlWrapSVG(altNode, settings);

  switch (node.type) {
    case "RECTANGLE":
    case "ELLIPSE":
      return htmlContainer(node, "", [], settings);
    case "GROUP":
      return htmlGroup(node, settings);
    case "FRAME":
    case "COMPONENT":
    case "INSTANCE":
    case "COMPONENT_SET":
      return htmlFrame(node, settings);
    case "SECTION":
      return htmlSection(node, settings);
    case "TEXT":
      return htmlText(node, settings);
    case "LINE":
      return htmlLine(node, settings);
    case "VECTOR":
      addWarning("VectorNodes are not fully supported in HTML");
      return htmlAsset(node, settings);
    default:
  }
  return "";
};

const htmlWrapSVG = (
  node: AltNode<SceneNode>,
  settings: HTMLSettings,
): string => {
  if (node.svg === "") return "";
  const builder = new HtmlDefaultBuilder(node, settings)
    .addData("svg-wrapper")
    .position();

  return `\n<div${builder.build()}>\n${node.svg ?? ""}</div>`;
};

const htmlGroup = async (
  node: GroupNode,
  settings: HTMLSettings,
): Promise<string> => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new HtmlDefaultBuilder(node, settings).commonPositionStyles();

  if (builder.styles) {
    const attr = builder.build();

    const generator = await htmlWidgetGenerator(node.children, settings);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return await htmlWidgetGenerator(node.children, settings);
};

// this was split from htmlText to help the UI part, where the style is needed (without <p></p>).
const htmlText = (node: TextNode, settings: HTMLSettings): string => {
  let layoutBuilder = new HtmlTextBuilder(node, settings)
    .commonPositionStyles()
    .textAlign();

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
  settings: HTMLSettings,
): Promise<string> => {
  const childrenStr = await htmlWidgetGenerator(
    commonSortChildrenWhenInferredAutoLayout(node, settings.optimizeLayout),
    settings,
  );

  if (node.layoutMode !== "NONE") {
    const rowColumn = htmlAutoLayoutProps(node, node, settings);
    return htmlContainer(node, childrenStr, rowColumn, settings);
  } else {
    if (settings.optimizeLayout && node.inferredAutoLayout !== null) {
      const rowColumn = htmlAutoLayoutProps(
        node,
        node.inferredAutoLayout,
        settings,
      );
      return htmlContainer(node, childrenStr, rowColumn, settings);
    }

    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return htmlContainer(node, childrenStr, [], settings);
  }
};

const htmlAsset = (node: SceneNode, settings: HTMLSettings): string => {
  if (!("opacity" in node) || !("layoutAlign" in node) || !("fills" in node)) {
    return "";
  }

  const builder = new HtmlDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

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
  settings: HTMLSettings,
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height <= 0) {
    return children;
  }

  const builder = new HtmlDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

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
            settings.jsx,
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
    } else if (selfClosingTags.includes(tag) || settings.jsx) {
      return `\n<${tag}${build}${src} />`;
    } else {
      return `\n<${tag}${build}${src}></${tag}>`;
    }
  }

  return children;
};

const htmlSection = async (
  node: SectionNode,
  settings: HTMLSettings,
): Promise<string> => {
  const childrenStr = await htmlWidgetGenerator(node.children, settings);
  const builder = new HtmlDefaultBuilder(node, settings)
    .size()
    .position()
    .applyFillsToStyle(node.fills, "background");

  if (childrenStr) {
    return `\n<div${builder.build()}>${indentString(childrenStr)}\n</div>`;
  } else {
    return `\n<div${builder.build()}></div>`;
  }
};

const htmlLine = (node: LineNode, settings: HTMLSettings): string => {
  const builder = new HtmlDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

  return `\n<div${builder.build()}></div>`;
};

export const htmlCodeGenTextStyles = (settings: HTMLSettings) => {
  const result = previousExecutionCache
    .map(
      (style) =>
        `// ${style.text}\n${style.style.split(settings.jsx ? "," : ";").join(";\n")}`,
    )
    .join("\n---\n");

  if (!result) {
    return "// No text styles in this selection";
  }
  return result;
};
