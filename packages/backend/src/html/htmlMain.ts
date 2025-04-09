import { indentString } from "../common/indentString";
import { HtmlTextBuilder } from "./htmlTextBuilder";
import { HtmlDefaultBuilder } from "./htmlDefaultBuilder";
import { htmlAutoLayoutProps } from "./builderImpl/htmlAutoLayout";
import { formatWithJSX } from "../common/parseJSX";
import {
  PluginSettings,
  HTMLPreview,
  AltNode,
  HTMLSettings,
  ExportableNode,
} from "types";
import { renderAndAttachSVG } from "../altNodes/altNodeUtils";
import { getVisibleNodes } from "../common/nodeVisibility";
import {
  exportNodeAsBase64PNG,
  getPlaceholderImage,
  nodeHasImageFill,
} from "../common/images";
import { addWarning } from "../common/commonConversionWarnings";

const selfClosingTags = ["img"];

export let isPreviewGlobal = false;

let previousExecutionCache: { style: string; text: string }[];

// Define better type for the output
export interface HtmlOutput {
  html: string;
  css?: string;
}

// Define HTML generation modes for better type safety
export type HtmlGenerationMode =
  | "html"
  | "jsx"
  | "styled-components"
  | "svelte";

// CSS Collection for external stylesheet or styled-components
interface CSSCollection {
  [className: string]: {
    styles: string[];
    nodeName?: string;
    nodeType?: string;
    element?: string; // Base HTML element to use
  };
}

export let cssCollection: CSSCollection = {};

// Instance counters for class name generation - we keep this but primarily as a fallback
const classNameCounters: Map<string, number> = new Map();

// Generate a class name - prefer direct uniqueId, but fall back to counter-based if needed
export function generateUniqueClassName(prefix = "figma"): string {
  // Sanitize the prefix to ensure valid CSS class
  const sanitizedPrefix =
    prefix.replace(/[^a-zA-Z0-9_-]/g, "").replace(/^[0-9_-]/, "f") || // Ensure it doesn't start with a number or special char
    "figma";

  // Most of the time, we'll just use the prefix directly as it's pre-generated to be unique
  // But keep the counter logic as a fallback
  const count = classNameCounters.get(sanitizedPrefix) || 0;
  classNameCounters.set(sanitizedPrefix, count + 1);

  // Only add suffix if this isn't the first instance
  return count === 0
    ? sanitizedPrefix
    : `${sanitizedPrefix}_${count.toString().padStart(2, "0")}`;
}

// Reset all class name counters - call this at the start of processing
export function resetClassNameCounters(): void {
  classNameCounters.clear();
}

// Convert styles to CSS format
export function stylesToCSS(styles: string[], isJSX: boolean): string[] {
  return styles
    .map((style) => {
      // Skip empty styles
      if (!style.trim()) return "";

      // Handle JSX format if needed
      if (isJSX) {
        return style.replace(/^([a-zA-Z0-9]+):/, (match, prop) => {
          // Convert camelCase to kebab-case for CSS
          return (
            prop
              .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
              .toLowerCase() + ":"
          );
        });
      }
      return style;
    })
    .filter(Boolean); // Remove empty entries
}

// Get proper component name from node info
export function getComponentName(
  node: any,
  className?: string,
  nodeType = "div",
): string {
  // Start with Styled prefix
  let name = "Styled";

  // Use uniqueName if available, otherwise use name
  const nodeName: string = node.uniqueName || node.name;

  // Try to use node name first
  if (nodeName && nodeName.length > 0) {
    // Clean up the node name and capitalize first letter
    const cleanName = nodeName
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/^[a-z]/, (match) => match.toUpperCase());

    name += cleanName || nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
  }
  // Fall back to className if provided
  else if (className) {
    const parts = className.split("-");
    if (parts.length > 0 && parts[0]) {
      name += parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } else {
      name += nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
    }
  }
  // Last resort
  else {
    name += nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
  }

  return name;
}

// Get the collected CSS as a string with improved formatting
export function getCollectedCSS(): string {
  if (Object.keys(cssCollection).length === 0) {
    return "";
  }

  return Object.entries(cssCollection)
    .map(([className, { styles }]) => {
      if (!styles.length) return "";
      return `.${className} {\n  ${styles.join(";\n  ")}${styles.length ? ";" : ""}\n}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

// Generate styled-components with improved naming and formatting
export function generateStyledComponents(): string {
  const components: string[] = [];

  Object.entries(cssCollection).forEach(
    ([className, { styles, nodeName, nodeType, element }]) => {
      // Skip if no styles
      if (!styles.length) return;

      // Determine base HTML element - defaults to div
      const baseElement = element || (nodeType === "TEXT" ? "p" : "div");
      const componentName = getComponentName(
        { name: nodeName },
        className,
        baseElement,
      );

      const styledComponent = `const ${componentName} = styled.${baseElement}\`
  ${styles.join(";\n  ")}${styles.length ? ";" : ""}
\`;`;

      components.push(styledComponent);
    },
  );

  if (components.length === 0) {
    return "";
  }

  return `${components.join("\n\n")}`;
}

// Get a valid React component name from a layer name
export function getReactComponentName(node: any): string {
  // Use uniqueName if available, otherwise use name
  const name: string = node?.uniqueName || node?.name;

  // Default name if nothing valid is provided
  if (!name || name.trim() === "") {
    return "App";
  }

  // Convert to PascalCase
  let componentName = name
    .replace(/[^a-zA-Z0-9_]/g, " ") // Replace non-alphanumeric chars with spaces
    .split(/\s+/) // Split by spaces
    .map((part) =>
      part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : "",
    )
    .join("");

  // Ensure it starts with uppercase letter (React component convention)
  componentName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  // Ensure it's a valid identifier - if it starts with a number, prefix with 'Component'
  if (/^[0-9]/.test(componentName)) {
    componentName = "Component" + componentName;
  }

  // If we ended up with nothing valid, use the default
  return componentName || "App";
}

// Get a Svelte-friendly component name
export function getSvelteElementName(
  elementType: string,
  nodeName?: string,
): string {
  // For Svelte, use semantic element names where possible
  if (elementType === "TEXT" || elementType === "p") {
    return "p";
  } else if (elementType === "img" || elementType === "IMAGE") {
    return "img";
  } else if (
    nodeName &&
    (nodeName.toLowerCase().includes("button") ||
      nodeName.toLowerCase().includes("btn"))
  ) {
    return "button";
  } else if (nodeName && nodeName.toLowerCase().includes("link")) {
    return "a";
  } else {
    return "div"; // Default element
  }
}

// Generate semantic class names for Svelte
export function getSvelteClassName(prefix?: string, nodeType?: string): string {
  if (!prefix) {
    return nodeType?.toLowerCase() || "element";
  }

  // Clean and format the prefix
  return prefix
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-{2,}/g, "-") // Replace multiple hyphens with a single one
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .toLowerCase();
}

// Generate component code based on the specified mode
function generateComponentCode(
  html: string,
  sceneNode: Array<SceneNode>,
  mode: HtmlGenerationMode,
): string {
  switch (mode) {
    case "styled-components":
      return generateReactComponent(html, sceneNode);
    case "svelte":
      return generateSvelteComponent(html);
    case "html":
    case "jsx":
    default:
      return html;
  }
}

// Generate React component from HTML, with optional styled-components
function generateReactComponent(
  html: string,
  sceneNode: Array<SceneNode>,
): string {
  const styledComponentsCode = generateStyledComponents();

  const componentName = getReactComponentName(sceneNode[0]);

  const imports = [
    'import React from "react";',
    'import styled from "styled-components";',
  ];

  return `${imports.join("\n")}
${styledComponentsCode ? `\n${styledComponentsCode}` : ""}

export const ${componentName} = () => {
  return (
${indentString(html, 4)}
  );
};`;
}

// Generate Svelte component from the collected styles and HTML
function generateSvelteComponent(html: string): string {
  // Build CSS classes similar to styled-components but for Svelte
  const cssRules: string[] = [];

  Object.entries(cssCollection).forEach(([className, { styles }]) => {
    if (!styles.length) return;

    // Always use class selector to avoid conflicts
    cssRules.push(
      `.${className} {\n  ${styles.join(";\n  ")}${styles.length ? ";" : ""}\n}`,
    );
  });

  return `${html}

<style>
${cssRules.join("\n\n")}
</style>`;
}

export const htmlMain = async (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
  isPreview: boolean = false,
): Promise<HtmlOutput> => {
  isPreviewGlobal = isPreview;
  previousExecutionCache = [];
  cssCollection = {};
  resetClassNameCounters(); // Reset counters for each new generation

  let htmlContent = await htmlWidgetGenerator(sceneNode, settings);

  // remove the initial \n that is made in Container.
  if (htmlContent.length > 0 && htmlContent.startsWith("\n")) {
    htmlContent = htmlContent.slice(1, htmlContent.length);
  }

  // Always return an object with html property
  const output: HtmlOutput = { html: htmlContent };

  // Handle different HTML generation modes
  const mode = settings.htmlGenerationMode || "html";

  if (mode !== "html") {
    // Generate component code for non-html modes
    output.html = generateComponentCode(htmlContent, sceneNode, mode);

    // For svelte mode, we don't need separate CSS as it's included in the component
    if (mode === "svelte" && Object.keys(cssCollection).length > 0) {
      // CSS is already included in the Svelte component
    }
  } else if (Object.keys(cssCollection).length > 0) {
    // For plain HTML with CSS, include CSS separately
    output.css = getCollectedCSS();
  }

  return output;
};

export const generateHTMLPreview = async (
  nodes: SceneNode[],
  settings: PluginSettings,
): Promise<HTMLPreview> => {
  let result = await htmlMain(
    nodes,
    {
      ...settings,
      htmlGenerationMode: "html",
    },
    nodes.length > 1 ? false : true,
  );

  if (nodes.length > 1) {
    result.html = `<div style="width: 100%; height: 100%">${result.html}</div>`;
  }

  return {
    size: {
      width: Math.max(...nodes.map((node) => node.width)),
      height: nodes.reduce((sum, node) => sum + node.height, 0),
    },
    content: result.html,
  };
};

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
  if (settings.embedVectors && (node as any).canBeFlattened) {
    const altNode = await renderAndAttachSVG(node);
    if (altNode.svg) {
      return htmlWrapSVG(altNode, settings);
    }
  }

  switch (node.type) {
    case "RECTANGLE":
    case "ELLIPSE":
      return await htmlContainer(node, "", [], settings);
    case "GROUP":
      return await htmlGroup(node, settings);
    case "FRAME":
    case "COMPONENT":
    case "INSTANCE":
    case "COMPONENT_SET":
      return await htmlFrame(node, settings);
    case "SECTION":
      return await htmlSection(node, settings);
    case "TEXT":
      return htmlText(node, settings);
    case "LINE":
      return htmlLine(node, settings);
    case "VECTOR":
      if (!settings.embedVectors && !isPreviewGlobal) {
        addWarning("Vector is not supported");
      }
      return await htmlContainer(
        { ...node, type: "RECTANGLE" } as any,
        "",
        [],
        settings,
      );
    default:
      addWarning(`${node.type} node is not supported`);
      return "";
  }
};

const htmlWrapSVG = (
  node: AltNode<SceneNode>,
  settings: HTMLSettings,
): string => {
  if (node.svg === "") return "";
  
  const builder = new HtmlDefaultBuilder(node, settings)
    .addData("svg-wrapper")
    .position();
  
  // The SVG content already has the var() references, so we don't need
  // to add inline CSS variables in most cases. The browser will use the fallbacks
  // if the variables aren't defined in the CSS.
  
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

// For htmlText and htmlContainer, use the htmlGenerationMode to determine styling approach
const htmlText = (node: TextNode, settings: HTMLSettings): string => {
  let layoutBuilder = new HtmlTextBuilder(node, settings)
    .commonPositionStyles()
    .textTrim()
    .textAlignHorizontal()
    .textAlignVertical();

  const styledHtml = layoutBuilder.getTextSegments(node);
  previousExecutionCache.push(...styledHtml);

  const mode = settings.htmlGenerationMode || "html";

  // For styled-components mode
  if (mode === "styled-components") {
    const componentName = layoutBuilder.cssClassName
      ? getComponentName(node, layoutBuilder.cssClassName, "p")
      : getComponentName(node, undefined, "p");

    if (styledHtml.length === 1) {
      return `\n<${componentName}>${styledHtml[0].text}</${componentName}>`;
    } else {
      const content = styledHtml
        .map((style) => {
          const tag =
            style.openTypeFeatures.SUBS === true
              ? "sub"
              : style.openTypeFeatures.SUPS === true
                ? "sup"
                : "span";

          if (style.componentName) {
            return `<${style.componentName}>${style.text}</${style.componentName}>`;
          }
          return `<${tag}>${style.text}</${tag}>`;
        })
        .join("");

      return `\n<${componentName}>${content}</${componentName}>`;
    }
  }

  // Standard HTML/CSS approach for HTML, React or Svelte
  let content = "";
  if (styledHtml.length === 1) {
    // For HTML and React modes, we use inline styles
    if (mode === "html" || mode === "jsx") {
      layoutBuilder.addStyles(styledHtml[0].style);
    }

    content = styledHtml[0].text;

    const additionalTag =
      styledHtml[0].openTypeFeatures.SUBS === true
        ? "sub"
        : styledHtml[0].openTypeFeatures.SUPS === true
          ? "sup"
          : "";

    if (additionalTag) {
      content = `<${additionalTag}>${content}</${additionalTag}>`;
    } else if (mode === "svelte" && styledHtml[0].className) {
      // Use span just like styled-components for consistency
      content = `<span class="${styledHtml[0].className}">${content}</span>`;
    }
  } else {
    content = styledHtml
      .map((style) => {
        // Always use span for multi-segment text in Svelte mode
        const tag =
          style.openTypeFeatures.SUBS === true
            ? "sub"
            : style.openTypeFeatures.SUPS === true
              ? "sup"
              : "span";

        // Use class name for Svelte with same approach as styled-components
        if (mode === "svelte" && style.className) {
          return `<span class="${style.className}">${style.text}</span>`;
        }

        return `<${tag} style="${style.style}">${style.text}</${tag}>`;
      })
      .join("");
  }

  // Always use div as container to be consistent with styled-components
  return `\n<div${layoutBuilder.build()}>${content}</div>`;
};

const htmlFrame = async (
  node: SceneNode & BaseFrameMixin,
  settings: HTMLSettings,
): Promise<string> => {
  const childrenStr = await htmlWidgetGenerator(node.children, settings);

  if (node.layoutMode !== "NONE") {
    const rowColumn = htmlAutoLayoutProps(node, settings);
    return await htmlContainer(node, childrenStr, rowColumn, settings);
  }

  // node.layoutMode === "NONE" && node.children.length > 1
  // children needs to be absolute
  return await htmlContainer(node, childrenStr, [], settings);
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
const htmlContainer = async (
  node: SceneNode &
    SceneNodeMixin &
    BlendMixin &
    LayoutMixin &
    GeometryMixin &
    MinimalBlendMixin,
  children: string,
  additionalStyles: string[] = [],
  settings: HTMLSettings,
): Promise<string> => {
  // ignore the view when size is zero or less
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new HtmlDefaultBuilder(node, settings)
    .commonPositionStyles()
    .commonShapeStyles();

  if (builder.styles || additionalStyles) {
    let tag = "div";
    let src = "";

    if (nodeHasImageFill(node)) {
      const altNode = node as AltNode<ExportableNode>;
      const hasChildren = "children" in node && node.children.length > 0;
      let imgUrl = "";

      if (
        settings.embedImages &&
        (settings as PluginSettings).framework === "HTML"
      ) {
        imgUrl = (await exportNodeAsBase64PNG(altNode, hasChildren)) ?? "";
      } else {
        imgUrl = getPlaceholderImage(node.width, node.height);
      }

      if (hasChildren) {
        builder.addStyles(
          formatWithJSX(
            "background-image",
            settings.htmlGenerationMode === "jsx",
            `url(${imgUrl})`,
          ),
        );
      } else {
        tag = "img";
        src = ` src="${imgUrl}"`;
      }
    }

    const build = builder.build(additionalStyles);
    const mode = settings.htmlGenerationMode || "html";

    // For styled-components mode
    if (mode === "styled-components" && builder.cssClassName) {
      const componentName = getComponentName(node, builder.cssClassName);

      if (children) {
        return `\n<${componentName}>${indentString(children)}\n</${componentName}>`;
      } else {
        return `\n<${componentName} ${src}/>`;
      }
    }

    // Standard HTML approach for HTML, React, or Svelte
    if (children) {
      return `\n<${tag}${build}${src}>${indentString(children)}\n</${tag}>`;
    } else if (
      selfClosingTags.includes(tag) ||
      settings.htmlGenerationMode === "jsx"
    ) {
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
        `// ${style.text}\n${style.style.split(settings.htmlGenerationMode === "jsx" ? "," : ";").join(";\n")}`,
    )
    .join("\n---\n");

  if (!result) {
    return "// No text styles in this selection";
  }
  return result;
};
