import { indentString } from "../common/indentString";
import { className, sliceNum } from "../common/numToAutoFixed";
import { androidTextBuilder } from "./androidTextBuilder";
import { androidDefaultBuilder } from "./androidDefaultBuilder";
import { PluginSettings } from "../code";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";
import { androidElement } from "./builderImpl/androidParser";

let localSettings: PluginSettings;
let previousExecutionCache: string[];

const getPreviewTemplate = (name: string, injectCode: string): string =>
`<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
  xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:app="http://schemas.android.com/apk/res-auto"
  android:layout_width="match_parent"
  android:layout_height="match_parent">
    ${indentString(injectCode, 4).trimStart()}
</androidx.constraintlayout.widget.ConstraintLayout>
`;

export const androidMain = (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings
): string => {
  localSettings = settings;
  previousExecutionCache = [];
  let result = androidWidgetGenerator(sceneNode, 0);

  switch (localSettings.androidGenerationMode) {
    case "snippet":
      return result;
    case "preview":
      // result = generateWidgetCode("Column", { children: [result] });
      return getPreviewTemplate(className(sceneNode[0].name), result);
  }

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

const androidWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>,
  indentLevel: number
): string => {
  const visibleSceneNode = sceneNode.filter((d) => d.visible);
  // filter non visible nodes. This is necessary at this step because conversion already happened.
  let comp: string[] = [];

  visibleSceneNode.forEach((node, index) => {
    switch (node.type) {
      case "ELLIPSE":
      case "LINE":
        comp.push(androidContainer(node));
        break;
      case "GROUP":
      case "SECTION":
        comp.push(androidGroup(node, indentLevel));
        break;
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        comp.push(androidFrame(node, indentLevel));
        break;
      case "TEXT":
        comp.push(androidText(node));
        break;
      case "RECTANGLE":
        if (node.isAsset) {
          comp.push(androidImage(node))
        }
        else {
          comp.push(androidContainer(node));
        }
        break;
      default:
      break;
    }
  });

  return comp.join("\n");
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const androidContainer = (
  node: SceneNode,
  stack: string = ""
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height < 0) {
    return stack;
  }

  let kind = "";
  if (node.type === "RECTANGLE" && node.isAsset) {
    kind = "ImageView";
  } else if (node.type === "RECTANGLE" || node.type === "LINE") {
    kind = "Rectangle()";
  } else if (node.type === "ELLIPSE") {
    kind = "Ellipse()";
  } else {
//    kind = stack;
  }

  const result = new androidDefaultBuilder(kind,stack)
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

const androidGroup = (
  node: GroupNode | SectionNode,
  indentLevel: number
): string => {
  const children = widgetGeneratorWithLimits(node, indentLevel);
  return androidContainer(
    node,
    children ? generateAndroidViewCode("ZStack", {}, children) : `ZStack() { }`
  );
};

const androidText = (node: TextNode): string => {
  const result = new androidTextBuilder().createText(node);
  previousExecutionCache.push(result.build());

  return result
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .build();
};

const androidImage = (node: RectangleNode): string => {
  const result = new androidDefaultBuilder();
  result.element = new androidElement("ImageView")
    .addModifier(["android:layout_width",node.layoutSizingHorizontal == "FILL" ? "match_parent" : node.layoutSizingHorizontal == "HUG" ? "wrap_content" : `${node.width}dp`])
    .addModifier(["android:layout_height",node.layoutSizingVertical == "FILL" ? "match_parent" : node.layoutSizingVertical == "HUG" ? "wrap_content" : `${node.height}dp`]);

  return androidContainer(node);
};

const androidFrame = (
  node: SceneNode & BaseFrameMixin,
  indentLevel: number
): string => {
  const children = widgetGeneratorWithLimits(
    node,
    node.children.length > 1 ? indentLevel + 1 : indentLevel
  );

  const anyStack = createDirectionalStack(
    children,
    localSettings.optimizeLayout && node.inferredAutoLayout !== null
      ? node.inferredAutoLayout
      : node
  );
  return androidContainer(node, anyStack);
};

const getLayoutParam = (
  align: string,
  width:string
):string => {
  return (align == "STRETCH") ? "match_parent" : "wrap_content";
};

const getGravity = (
  layoutMode:string,
  isPrimary:boolean,
  align:string,
  gravity:string
):string => {
  if ((layoutMode=="HORIZONTAL" && isPrimary) || (layoutMode=="VERTICAL" && !isPrimary)) {
    if (align == "MIN") {
      return gravity=="" ? "start" : `${gravity}|start`;
    }
    else if (align == "MAX") {
      return gravity=="" ? "end" : `${gravity}|end`;
    }
    else if (align == "CENTER") {
      return gravity=="" ? "center_horizontal" : `${gravity}|center_horizontal`;
    }
  }
  else if ((layoutMode=="VERTICAL" && isPrimary) || (layoutMode=="HORIZONTAL" && !isPrimary)) {
    if (align == "MIN") {
      return gravity=="" ? "top" : `${gravity}|top`;
    }
    else if (align == "MAX") {
      return gravity=="" ? "bottom" : `${gravity}|bottom`;
    }
    else if (align == "CENTER") {
      return gravity=="" ? "center_vertical" : `${gravity}|center_vertical`;
    }
  }
  return gravity;
};

const getGravityParam = (
  inferredAutoLayout: InferredAutoLayoutResult
):string => {
  const primaty = getGravity(inferredAutoLayout.layoutMode, true, inferredAutoLayout.primaryAxisAlignItems, "");
  return getGravity(inferredAutoLayout.layoutMode, false, inferredAutoLayout.counterAxisAlignItems, primaty);
}

const createDirectionalStack = (
  children: string,
  inferredAutoLayout: InferredAutoLayoutResult
): string => {


  if (inferredAutoLayout.layoutMode !== "NONE") {
    return generateAndroidViewCode("LinearLayout",
      {
        "android:orientation":inferredAutoLayout.layoutMode=="VERTICAL" ? "vertical" : "horizontal",
        "android:layout_width": getLayoutParam(inferredAutoLayout.layoutAlign,"10dp"),
        "android:layout_height":"wrap_content",
        "android:layout_margin": getSpacing(inferredAutoLayout),
        "android:gravity": getGravityParam(inferredAutoLayout)
      },
      children
    );
  } else {
    return generateAndroidViewCode("androidx.constraintlayout.widget.ConstraintLayout",
      {
        "android:layout_width":"match_parent",
        "android:layout_height":"match_parent"
      },
      children
    );
  }
};


const getSpacing = (inferredAutoLayout: InferredAutoLayoutResult): string => {
  const defaultSpacing = 10;
  return Math.round(inferredAutoLayout.itemSpacing) !== defaultSpacing
    ? `${inferredAutoLayout.itemSpacing}dp`
    : `${defaultSpacing}dp`;
};

export const generateAndroidViewCode = (
  className: string,
  properties: Record<string, string | number>,
  children: string
): string => {
  const propertiesArray = Object.entries(properties)
    .filter(([, value]) => value !== "")
    .map(
      ([key, value]) =>
        `${key}=${typeof value === "number" ? sliceNum(value) : '"'+value+'"'}`
    );

  const compactPropertiesArray = propertiesArray.join(" \n");
  if (!className) {
    return `${indentString(
      children
    )}`;
  }
  else if (!children) {
    return `<${className} ${compactPropertiesArray}/>\n`;
  }
  else {
    return `<${className} ${compactPropertiesArray}>\n\n${indentString(
      children
    )}\n</${className}>\n`;
  }
};

// todo should the plugin manually Group items? Ideally, it would detect the similarities and allow a ForEach.
const widgetGeneratorWithLimits = (
  node: SceneNode & ChildrenMixin,
  indentLevel: number
) => {
  if (node.children.length < 10) {
    // standard way
    return androidWidgetGenerator(
      commonSortChildrenWhenInferredAutoLayout(
        node,
        localSettings.optimizeLayout
      ),
      indentLevel
    );
  }

  const chunk = 10;
  let strBuilder = "";
  const slicedChildren = commonSortChildrenWhenInferredAutoLayout(
    node,
    localSettings.optimizeLayout
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
    const strChildren = androidWidgetGenerator(chunkChildren, indentLevel);
    strBuilder += `Group {\n${indentString(strChildren)}\n}`;
  }

  return strBuilder;
};

export const androidCodeGenTextStyles = () => {
  const result = previousExecutionCache
    .map((style) => `${style}`)
    .join("\n// ---\n");
  if (!result) {
    return "// No text styles in this selection";
  }
  return result;
};
