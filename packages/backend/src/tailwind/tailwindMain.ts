import { retrieveTopFill } from "../common/retrieveFill";
import { indentString } from "../common/indentString";
import { TailwindTextBuilder } from "./tailwindTextBuilder";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";
import { tailwindAutoLayoutProps } from "./builderImpl/tailwindAutoLayout";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";
import { AltNode, PluginSettings, TailwindSettings } from "types";
import { addWarning } from "../common/commonConversionWarnings";
import { renderAndAttachSVG } from "../altNodes/altNodeUtils";
import { getVisibleNodes } from "../common/nodeVisibility";

export let localTailwindSettings: PluginSettings;

let previousExecutionCache: { style: string; text: string }[];

const selfClosingTags = ["img"];

export const tailwindMain = async (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
) => {
  localTailwindSettings = settings;
  previousExecutionCache = [];

  let result = await tailwindWidgetGenerator(sceneNode, settings);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

// TODO: lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const tailwindWidgetGenerator = async (
  sceneNode: ReadonlyArray<SceneNode>,
  settings: TailwindSettings,
): Promise<string> => {
  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const promiseOfConvertedCode = getVisibleNodes(sceneNode).map(
    convertNode(settings),
  );
  const code = (await Promise.all(promiseOfConvertedCode)).join("");
  return code;
};

const convertNode = (settings: TailwindSettings) => async (node: SceneNode) => {
  const altNode = await renderAndAttachSVG(node);
  if (altNode.svg) return tailwindWrapSVG(altNode, settings);

  switch (node.type) {
    case "RECTANGLE":
    case "ELLIPSE":
      return tailwindContainer(node, "", "", settings);
    case "GROUP":
      return tailwindGroup(node, settings);
    case "FRAME":
    case "COMPONENT":
    case "INSTANCE":
    case "COMPONENT_SET":
      return tailwindFrame(node, settings);
    case "TEXT":
      return tailwindText(node, settings);
    case "LINE":
      return tailwindLine(node, settings);
    case "SECTION":
      return tailwindSection(node, settings);
    case "VECTOR":
      addWarning("VectorNodes are not supported in Tailwind");
      break;
    default:
      addWarning(`${node.type} nodes are not supported in Tailwind`);
  }
  return "";
};

const tailwindWrapSVG = (
  node: AltNode<SceneNode>,
  settings: TailwindSettings,
): string => {
  if (node.svg === "") return "";
  const builder = new TailwindDefaultBuilder(node, settings)
    .addData("svg-wrapper")
    .position();

  return `\n<div${builder.build()}>\n${node.svg ?? ""}</div>`;
};

const tailwindGroup = async (node: GroupNode, settings: TailwindSettings) => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new TailwindDefaultBuilder(node, settings)
    .blend()
    .size()
    .position();

  if (builder.attributes || builder.style) {
    const attr = builder.build("");

    const generator = await tailwindWidgetGenerator(node.children, settings);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return await tailwindWidgetGenerator(node.children, settings);
};

export const tailwindText = (
  node: TextNode,
  settings: TailwindSettings,
): string => {
  let layoutBuilder = new TailwindTextBuilder(node, settings)
    .commonPositionStyles()
    .textAlign();

  const styledHtml = layoutBuilder.getTextSegments(node.id);
  previousExecutionCache.push(...styledHtml);

  let content = "";
  if (styledHtml.length === 1) {
    layoutBuilder.addAttributes(styledHtml[0].style);
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

        return `<${tag} class="${style.style}">${style.text}</${tag}>`;
      })
      .join("");
  }

  return `\n<div${layoutBuilder.build()}>${content}</div>`;
};

const tailwindFrame = async (
  node: FrameNode | InstanceNode | ComponentNode | ComponentSetNode,
  settings: TailwindSettings,
): Promise<string> => {
  const childrenStr = await tailwindWidgetGenerator(
    commonSortChildrenWhenInferredAutoLayout(
      node,
      localTailwindSettings.optimizeLayout,
    ),
    settings,
  );

  // Add overflow-hidden class if clipsContent is true
  const clipsContentClass = node.clipsContent ? " overflow-hidden" : "";

  if (node.layoutMode !== "NONE") {
    const rowColumn = tailwindAutoLayoutProps(node, node);
    return tailwindContainer(
      node,
      childrenStr,
      rowColumn + clipsContentClass,
      settings,
    );
  } else {
    if (
      localTailwindSettings.optimizeLayout &&
      node.inferredAutoLayout !== null
    ) {
      const rowColumn = tailwindAutoLayoutProps(node, node.inferredAutoLayout);
      return tailwindContainer(
        node,
        childrenStr,
        rowColumn + clipsContentClass,
        settings,
      );
    }

    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return tailwindContainer(node, childrenStr, clipsContentClass, settings);
  }
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const tailwindContainer = (
  node: SceneNode &
    SceneNodeMixin &
    BlendMixin &
    LayoutMixin &
    GeometryMixin &
    MinimalBlendMixin,
  children: string,
  additionalAttr: string,
  settings: TailwindSettings,
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height < 0) {
    return children;
  }

  let builder = new TailwindDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

  if (builder.attributes || additionalAttr) {
    const build = builder.build(additionalAttr);

    // image fill and no children -- let's emit an <img />
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
        builder.addAttributes(
          `bg-[url(https://via.placeholder.com/${node.width.toFixed(
            0,
          )}x${node.height.toFixed(0)})]`,
        );
      }
    }

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

export const tailwindLine = (
  node: LineNode,
  settings: TailwindSettings,
): string => {
  const builder = new TailwindDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

  return `\n<div${builder.build()}></div>`;
};

export const tailwindSection = async (
  node: SectionNode,
  settings: TailwindSettings,
): Promise<string> => {
  const childrenStr = await tailwindWidgetGenerator(node.children, settings);
  const builder = new TailwindDefaultBuilder(node, settings)
    .size()
    .position()
    .customColor(node.fills, "bg");

  if (childrenStr) {
    return `\n<div${builder.build()}>${indentString(childrenStr)}\n</div>`;
  } else {
    return `\n<div${builder.build()}></div>`;
  }
};

export const tailwindCodeGenTextStyles = () => {
  const result = previousExecutionCache
    .map((style) => `// ${style.text}\n${style.style.split(" ").join("\n")}`)
    .join("\n---\n");

  if (!result) {
    return "// No text styles in this selection";
  }

  return result;
};
