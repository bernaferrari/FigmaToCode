import { retrieveTopFill } from "../common/retrieveFill";
import { indentString } from "../common/indentString";
import { TailwindTextBuilder } from "./tailwindTextBuilder";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";
import { tailwindAutoLayoutProps } from "./builderImpl/tailwindAutoLayout";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";
import { PluginSettings } from "types";
import { addWarning } from "../common/commonConversionWarnings";

export let localTailwindSettings: PluginSettings;

let previousExecutionCache: { style: string; text: string }[];

const selfClosingTags = ["img"];

export const tailwindMain = (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
): string => {
  localTailwindSettings = settings;
  previousExecutionCache = [];

  let result = tailwindWidgetGenerator(sceneNode, localTailwindSettings.jsx);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const tailwindWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>,
  isJsx: boolean,
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible);
  visibleSceneNode.forEach((node) => {
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
        comp += tailwindContainer(node, "", "", isJsx);
        break;
      case "GROUP":
        comp += tailwindGroup(node, isJsx);
        break;
      case "FRAME":
      case "COMPONENT":
      case "INSTANCE":
      case "COMPONENT_SET":
        comp += tailwindFrame(node, isJsx);
        break;
      case "TEXT":
        comp += tailwindText(node, isJsx);
        break;
      case "LINE":
        comp += tailwindLine(node, isJsx);
        break;
      case "SECTION":
        comp += tailwindSection(node, isJsx);
        break;
      case "VECTOR":
        addWarning("VectorNodes are not supported in Tailwind");
        break;
    }
  });

  return comp;
};

const tailwindGroup = (node: GroupNode, isJsx: boolean = false): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new TailwindDefaultBuilder(
    node,
    localTailwindSettings.showLayerNames,
    isJsx,
  )
    .blend(node)
    .size(node, localTailwindSettings.optimizeLayout)
    .position(node, localTailwindSettings.optimizeLayout);

  if (builder.attributes || builder.style) {
    const attr = builder.build("");

    const generator = tailwindWidgetGenerator(node.children, isJsx);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return tailwindWidgetGenerator(node.children, isJsx);
};

export const tailwindText = (node: TextNode, isJsx: boolean): string => {
  let layoutBuilder = new TailwindTextBuilder(
    node,
    localTailwindSettings.showLayerNames,
    isJsx,
  )
    .commonPositionStyles(node, localTailwindSettings.optimizeLayout)
    .textAlign(node);

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

const tailwindFrame = (
  node: FrameNode | InstanceNode | ComponentNode | ComponentSetNode,
  isJsx: boolean,
): string => {
  const childrenStr = tailwindWidgetGenerator(
    commonSortChildrenWhenInferredAutoLayout(
      node,
      localTailwindSettings.optimizeLayout,
    ),
    isJsx,
  );

  // Add overflow-hidden class if clipsContent is true
  const clipsContentClass = node.clipsContent ? " overflow-hidden" : "";

  if (node.layoutMode !== "NONE") {
    const rowColumn = tailwindAutoLayoutProps(node, node);
    return tailwindContainer(
      node,
      childrenStr,
      rowColumn + clipsContentClass,
      isJsx,
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
        isJsx,
      );
    }

    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return tailwindContainer(node, childrenStr, clipsContentClass, isJsx);
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
  isJsx: boolean,
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height < 0) {
    return children;
  }

  let builder = new TailwindDefaultBuilder(
    node,
    localTailwindSettings.showLayerNames,
    isJsx,
  )
    .commonPositionStyles(node, localTailwindSettings.optimizeLayout)
    .commonShapeStyles(node);

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
    } else if (selfClosingTags.includes(tag) || isJsx) {
      return `\n<${tag}${build}${src} />`;
    } else {
      return `\n<${tag}${build}${src}></${tag}>`;
    }
  }

  return children;
};

export const tailwindLine = (node: LineNode, isJsx: boolean): string => {
  const builder = new TailwindDefaultBuilder(
    node,
    localTailwindSettings.showLayerNames,
    isJsx,
  )
    .commonPositionStyles(node, localTailwindSettings.optimizeLayout)
    .commonShapeStyles(node);

  return `\n<div${builder.build()}></div>`;
};

export const tailwindSection = (node: SectionNode, isJsx: boolean): string => {
  const childrenStr = tailwindWidgetGenerator(node.children, isJsx);
  const builder = new TailwindDefaultBuilder(
    node,
    localTailwindSettings.showLayerNames,
    isJsx,
  )
    .size(node, localTailwindSettings.optimizeLayout)
    .position(node, localTailwindSettings.optimizeLayout)
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
