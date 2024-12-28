import { indentString } from "../common/indentString";
import { stringToClassName, sliceNum } from "../common/numToAutoFixed";
import { SwiftuiTextBuilder } from "./swiftuiTextBuilder";
import { SwiftuiDefaultBuilder } from "./swiftuiDefaultBuilder";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";
import { PluginSettings } from "types";
import { addWarning } from "../common/commonConversionWarnings";

let localSettings: PluginSettings;
let previousExecutionCache: string[];

const getStructTemplate = (name: string, injectCode: string): string =>
  `struct ${name}: View {
  var body: some View {
    ${indentString(injectCode, 4).trimStart()};
  }
}`;

const getPreviewTemplate = (name: string, injectCode: string): string =>
  `import SwiftUI

struct ContentView: View {
  var body: some View {
    ${indentString(injectCode, 4).trimStart()};
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    ContentView()
  }
}`;

export const swiftuiMain = (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings,
): string => {
  localSettings = settings;
  previousExecutionCache = [];
  let result = swiftuiWidgetGenerator(sceneNode, 0);

  switch (localSettings.swiftUIGenerationMode) {
    case "snippet":
      return result;
    case "struct":
      // result = generateWidgetCode("Column", { children: [result] });
      return getStructTemplate(stringToClassName(sceneNode[0].name), result);
    case "preview":
      // result = generateWidgetCode("Column", { children: [result] });
      return getPreviewTemplate(stringToClassName(sceneNode[0].name), result);
  }

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

const swiftuiWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>,
  indentLevel: number,
): string => {
  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible);
  let comp: string[] = [];

  visibleSceneNode.forEach((node, index) => {
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
      case "LINE":
        comp.push(swiftuiContainer(node));
        break;
      case "GROUP":
      case "SECTION":
        comp.push(swiftuiGroup(node, indentLevel));
        break;
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        comp.push(swiftuiFrame(node, indentLevel));
        break;
      case "TEXT":
        comp.push(swiftuiText(node));
        break;
      case "VECTOR":
        addWarning("VectorNodes are not supported in SwiftUI");
        break;
      default:
        break;
    }
  });

  return comp.join("\n");
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const swiftuiContainer = (
  node: SceneNode,
  stack: string = "",
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height < 0) {
    return stack;
  }

  let kind = "";
  if (node.type === "RECTANGLE" || node.type === "LINE") {
    kind = "Rectangle()";
  } else if (node.type === "ELLIPSE") {
    kind = "Ellipse()";
  } else {
    kind = stack;
  }

  const result = new SwiftuiDefaultBuilder(kind)
    .shapeForeground(node)
    .autoLayoutPadding(node, localSettings.optimizeLayout)
    .size(node, localSettings.optimizeLayout)
    .shapeBackground(node)
    .cornerRadius(node)
    .shapeBorder(node)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .effects(node)
    .build(kind === stack ? -2 : 0);

  return result;
};

const swiftuiGroup = (
  node: GroupNode | SectionNode,
  indentLevel: number,
): string => {
  const children = widgetGeneratorWithLimits(node, indentLevel);
  return swiftuiContainer(
    node,
    children ? generateSwiftViewCode("ZStack", {}, children) : `ZStack() { }`,
  );
};

const swiftuiText = (node: TextNode): string => {
  const result = new SwiftuiTextBuilder().createText(node);
  previousExecutionCache.push(result.build());

  return result
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .build();
};

const swiftuiFrame = (
  node: SceneNode & BaseFrameMixin,
  indentLevel: number,
): string => {
  const children = widgetGeneratorWithLimits(
    node,
    node.children.length > 1 ? indentLevel + 1 : indentLevel,
  );

  const anyStack = createDirectionalStack(
    children,
    localSettings.optimizeLayout && node.inferredAutoLayout !== null
      ? node.inferredAutoLayout
      : node,
  );
  return swiftuiContainer(node, anyStack);
};

const createDirectionalStack = (
  children: string,
  inferredAutoLayout: InferredAutoLayoutResult,
): string => {
  if (inferredAutoLayout.layoutMode !== "NONE") {
    return generateSwiftViewCode(
      inferredAutoLayout.layoutMode === "HORIZONTAL" ? "HStack" : "VStack",
      {
        alignment: getLayoutAlignment(inferredAutoLayout),
        spacing: getSpacing(inferredAutoLayout),
      },
      children,
    );
  } else {
    return generateSwiftViewCode("ZStack", {}, children);
  }
};

const getLayoutAlignment = (
  inferredAutoLayout: InferredAutoLayoutResult,
): string => {
  switch (inferredAutoLayout.counterAxisAlignItems) {
    case "MIN":
      return inferredAutoLayout.layoutMode === "VERTICAL" ? ".leading" : ".top";
    case "MAX":
      return inferredAutoLayout.layoutMode === "VERTICAL"
        ? ".trailing"
        : ".bottom";
    case "BASELINE":
      return ".firstTextBaseline";
    case "CENTER":
      return "";
  }
};

const getSpacing = (inferredAutoLayout: InferredAutoLayoutResult): number => {
  const defaultSpacing = 10;
  return Math.round(inferredAutoLayout.itemSpacing) !== defaultSpacing
    ? inferredAutoLayout.itemSpacing
    : defaultSpacing;
};

export const generateSwiftViewCode = (
  className: string,
  properties: Record<string, string | number>,
  children: string,
): string => {
  const propertiesArray = Object.entries(properties)
    .filter(([, value]) => value !== "")
    .map(
      ([key, value]) =>
        `${key}: ${typeof value === "number" ? sliceNum(value) : value}`,
    );

  const compactPropertiesArray = propertiesArray.join(", ");
  if (compactPropertiesArray.length > 60) {
    const formattedProperties = propertiesArray.join(",\n");
    return `${className}(\n${formattedProperties}\n) {${indentString(
      children,
    )}\n}`;
  }

  return `${className}(${compactPropertiesArray}) {\n${indentString(
    children,
  )}\n}`;
};

// todo should the plugin manually Group items? Ideally, it would detect the similarities and allow a ForEach.
const widgetGeneratorWithLimits = (
  node: SceneNode & ChildrenMixin,
  indentLevel: number,
) => {
  if (node.children.length < 10) {
    // standard way
    return swiftuiWidgetGenerator(
      commonSortChildrenWhenInferredAutoLayout(
        node,
        localSettings.optimizeLayout,
      ),
      indentLevel,
    );
  }

  const chunk = 10;
  let strBuilder = "";
  const slicedChildren = commonSortChildrenWhenInferredAutoLayout(
    node,
    localSettings.optimizeLayout,
  ).slice(0, 100);

  // I believe no one should have more than 100 items in a single nesting level. If you do, please email me.
  if (node.children.length > 100) {
    strBuilder += `\n// SwiftUI has a 10 item limit in Stacks. By grouping them, it can grow even more. 
// It seems, however, that you have more than 100 items at the same level. Wow!
// This is not yet supported; Limiting to the first 100 items...`;
  }

  // split node.children in arrays of 10, so that it can be Grouped. I feel so guilty of allowing this.
  for (let i = 0, j = slicedChildren.length; i < j; i += chunk) {
    const chunkChildren = slicedChildren.slice(i, i + chunk);
    const strChildren = swiftuiWidgetGenerator(chunkChildren, indentLevel);
    strBuilder += `Group {\n${indentString(strChildren)}\n}`;
  }

  return strBuilder;
};

export const swiftUICodeGenTextStyles = () => {
  const result = previousExecutionCache
    .map((style) => `${style}`)
    .join("\n// ---\n");
  if (!result) {
    return "// No text styles in this selection";
  }
  return result;
};
