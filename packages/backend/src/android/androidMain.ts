import { compactProp, indentString } from "../common/indentString";
import { className, sliceNum } from "../common/numToAutoFixed";
import { androidBackground, androidCornerRadius, androidStrokes } from "./builderImpl/androidColor";
import { androidTextBuilder } from "./androidTextBuilder";
import { androidDefaultBuilder } from "./androidDefaultBuilder";
import { PluginSettings } from "../code";
import { commonSortChildrenWhenInferredAutoLayout } from "../common/commonChildrenOrder";
import { androidShadow } from "./builderImpl/androidEffects";
import { TextNode } from "../altNodes/altMixins2";
import { androidSize } from "./builderImpl/androidSize";
import { AndroidType, androidNameParser } from "./builderImpl/androidNameParser";
import { ButtonType, androidButtonType } from "./builderImpl/androidButtonType";

let localSettings: PluginSettings;
let previousExecutionCache: string[];

const getPreviewTemplate = (name: string, injectCode: string): string =>
`<?xml version="1.0" encoding="utf-8"?>
<FrameLayout
  xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:app="http://schemas.android.com/apk/res-auto"
  android:layout_width="match_parent"
  android:layout_height="match_parent">
    ${indentString(injectCode, 4).trimStart()}
</FrameLayout>
`;

const enum outputStyle {
  encoded,
  selectable,
  shrink
}

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
  indentLevel: number,
  hasParentOfComponentSet: boolean = false
): string => {
  const visibleSceneNode = sceneNode.filter((d) => d.visible);
  // filter non visible nodes. This is necessary at this step because conversion already happened.
  let comp: string[] = [];
  let compXml: string[] = [];

  visibleSceneNode.forEach((node, index) => {
    const type = androidNameParser(node.name).type
    const parentType = androidNameParser(node.parent?.name).type
    const isLinearLayout = parentType === AndroidType.linearLayout
    const hasStackParent = node.parent?.type === "COMPONENT" || node.parent?.type === "INSTANCE" || node.parent?.type === "FRAME"
    const isFirstItem = node.parent?.children[0] === node

    if (isLinearLayout && !isFirstItem && hasStackParent && node.parent.itemSpacing !== 0) {
      comp.push(androidLinearSpace(node));
    }

    if (hasParentOfComponentSet) {
      if (parentType == AndroidType.button && node.parent?.children?.findIndex((d) => d.id === node.id) === 0) {
        comp.push(`\n<!-- Component_Set_Item ${node.parent?.name} start -->`);
      }
      else if (parentType == AndroidType.listItem || parentType == AndroidType.button) {
        const cols = node.name.split('=');
        comp.push(`\n<!-- Component_Set_Item ${node.parent?.name}_${cols[1]} start -->`);
      }
      else {
        comp.push(`\n<!-- Component_Set_Item ${node.parent?.name}_${node.name} start -->`);
      }
    }

    switch (node.type) {
      case "COMPONENT":
      case "INSTANCE":
        switch (hasParentOfComponentSet ? parentType : type ) {
          case AndroidType.list:
            comp.push(androidComponent(node, indentLevel));
            if (node.type === "COMPONENT") {
              compXml.push(`\n<!-- ${node.name}_item.xml start -->`)
              compXml.push(androidWidgetGenerator(node.children, indentLevel));
              compXml.push(`<!-- ${node.name}_item.xml end -->\n`)
            }
            break;
          case AndroidType.listItem:
            comp.push(androidComponent(node, indentLevel));
            break;
          case AndroidType.button:
            if (node.type !== "COMPONENT") {
              comp.push(androidComponent(node, indentLevel, outputStyle.selectable));
            }
            else if (node.parent?.children?.findIndex((d) => d.id === node.id) === 0) {
              comp.push(androidComponent(node, indentLevel, outputStyle.selectable));
              comp.push(`<!-- Component_Set_Item ${node.parent?.name} end -->\n`);
              const cols = node.name.split('=');
              comp.push(`\n<!-- Component_Set_Item ${node.parent?.name}_${cols[1]} start -->`);
              comp.push(androidComponent(node, indentLevel, outputStyle.shrink));
              comp.push(`<!-- Component_Set_Item ${node.parent?.name}_${cols[1]} end -->\n`)
            }
            else {
              comp.push(androidComponent(node, indentLevel, outputStyle.shrink));
            }
            break;
          default:
            comp.push(androidComponent(node, indentLevel));
            break;
        }
        break;
      case "ELLIPSE":
      case "LINE":
        comp.push(androidContainer(node));
        break;
      case "FRAME":
        if (hasParentOfComponentSet ? parentType : type === AndroidType.linearLayout) {
          comp.push(androidComponent(node, indentLevel));
        }
        if (node.name === "UIkit_Color") {
          comp.push(androidColorTable(node))
        }
        else {
          comp.push(androidFrame(node, indentLevel));
        }
        break;
      case "COMPONENT_SET":
        comp.push(androidLinear(node, indentLevel));
        break;
      case "TEXT":
        comp.push(androidText(node));
        break;
      default:
      break;
    }

    if (hasParentOfComponentSet) {
      if (parentType == AndroidType.button && node.parent?.children?.findIndex((d) => d.id === node.id) === 0) {
        // already output
      }
      else if (parentType == AndroidType.listItem || parentType == AndroidType.button) {
        const cols = node.name.split('=');
        comp.push(`<!-- Component_Set_Item ${node.parent?.name}_${cols[1]} end -->\n`);
      }
      else {
        comp.push(`<!-- Component_Set_Item ${node.parent?.name}_${node.name} end -->\n`);
      }
    }
  });

  return comp.join("\n") + compXml.join("\n");
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
  } else if (node.type === "RECTANGLE" || node.type === "LINE" || node.type === "ELLIPSE") {
    kind = "View";
  }

  const result = new androidDefaultBuilder(kind,stack)
    .autoLayoutPadding(node, localSettings.optimizeLayout)
    .size(node, localSettings.optimizeLayout)
    .shapeBackground(node)
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .effects(node)
    .setId(node)
    .build(kind === stack ? -2 : 0);

  return result;
};


const androidView = (node: SceneNode & BaseFrameMixin): string => {
  const childImage = node.children.filter(child =>
    child.type == "RECTANGLE" 
    || child.type == "GROUP" 
    || (androidNameParser(child.name).type !== AndroidType.text 
    && (child.type === "COMPONENT" 
    || child.type === "INSTANCE")))[0]

  const isAsset = ("isAsset" in childImage 
    && childImage.isAsset) 
    || childImage.type === "GROUP" 
    || (androidNameParser(childImage.name).type !== AndroidType.text
    && (childImage.type === "COMPONENT" 
    || childImage.type === "INSTANCE"))

  const result = new androidDefaultBuilder(isAsset ? "ImageView":"View")
    .setId(node)
    .position(node,localSettings.optimizeLayout)
    .size(node,localSettings.optimizeLayout);

  if (isAsset) {
    result.element.addModifier(["android:src",`@drawable/${childImage.name}`]);
    result.element.addModifier(["android:contentDescription",`@string/STR_MSG_IMAGEVIEW_CONTENT_DESCRIPTION`]);
  }
  result.pushModifier(androidShadow(childImage));
  result.element.addModifier(androidBackground(childImage));
  result.element.addModifier(["android:scaleType",'fitXY']);

  return result.build(0);
};

const androidLinearSpace = (node: SceneNode): string => {
  const result = new androidDefaultBuilder("Space")
    .spaceSize(node)
    
  previousExecutionCache.push(result.build());

  return result
    .commonPositionStyles(node, localSettings.optimizeLayout)
    .build();
};

const androidText = (textNode: SceneNode & TextNode, node: SceneNode | null = null): string => {
  const result = new androidTextBuilder()
    .createText(textNode)
    .textAutoSize(textNode)
    .setId(node ? node : textNode)
    .position(node ? node : textNode, localSettings.optimizeLayout)
    .size(node ? node : textNode, localSettings.optimizeLayout);

  result.pushModifier(androidShadow(textNode));
  previousExecutionCache.push(result.build());

  return result
    .build();
};

const androidImage = (node: RectangleNode | VectorNode): string => {
  const result = new androidDefaultBuilder("ImageView","")
    .setId(node)
    .position(node,localSettings.optimizeLayout)
    .size(node,localSettings.optimizeLayout);

  result.element.addModifier(["android:contentDescription",`@string/STR_MSG_IMAGEVIEW_CONTENT_DESCRIPTION`]);
  if ("name" in node && node.name) {
    result.element.addModifier(["app:srcCompat",`@drawable/${node.name}`]);
  }
  result.pushModifier(androidShadow(node));
  result.element
    .addModifier(["android:scaleType",'fitXY']);

  return result.build(0);
};

const androidButton = (node: SceneNode & BaseFrameMixin, ostyle:outputStyle = outputStyle.encoded): string => {
  const buttonNode = androidButtonType(node)

  if (buttonNode.type === ButtonType.IconTextButton) {
    return androidIconTextButton(node, buttonNode.foreground, buttonNode.text, ostyle)
  }
  
  let result = new androidDefaultBuilder(buttonNode.value);
  if (ostyle != outputStyle.shrink) {
    result = result.setText(buttonNode.text)
              .position(node, localSettings.optimizeLayout)
              .size(node, localSettings.optimizeLayout);
  }

  if (ostyle === outputStyle.selectable) {
    const resname = node.parent?.name;
    switch (buttonNode.type) {
      case ButtonType.BackgroundImageButton:
        result.element.addModifier(["android:src", `@drawable/${resname}`]);
        result.element.addModifier(["android:background", `@drawable/${resname}_background`]);
        break;
      case ButtonType.ImageButton:
        result.element.addModifier(["android:src", `@drawable/${resname}`]);
        break;
      case ButtonType.ImageTextButton:
        result.element.addModifier(["android:background", `@drawable/${resname}`]);
        break;
      default:
        if (buttonNode.foreground) {
          const background = androidBackground(buttonNode.foreground);
          if (background[0]) {
            result.element.addModifier(["android:background", `@drawable/${resname}`]);
          }
        }
        break;
    }
  }
  else {
    switch (buttonNode.type) {
      case ButtonType.BackgroundImageButton:
        result.element.addModifier(["android:src", `@drawable/${buttonNode.foreground?.name}`]);
        result.element.addModifier(["android:background", `@drawable/${buttonNode.background?.name}`]);
        break;
      case ButtonType.ImageButton:
        result.element.addModifier(["android:src", `@drawable/${buttonNode.foreground?.name}`]);
        result.element.addModifier(["android:background", "@color/clearColor"]);
        break;
      case ButtonType.ImageTextButton:
        result.element.addModifier(["android:background", `@drawable/${buttonNode.foreground?.name}`]);
        break;
      default:
        if (buttonNode.foreground) {
          result.element.addModifier(androidBackground(buttonNode.foreground));
        }
        break;
    }
  }

  if (buttonNode.foreground) {
    result.pushModifier(androidShadow(buttonNode.foreground));
  }

  return result.build(0);
};

const androidIconTextButton = (node: SceneNode & BaseFrameMixin, layout: SceneNode | undefined, text: TextNode | undefined, ostyle:outputStyle = outputStyle.encoded): string => {
  const linear = node.children.filter(child => androidNameParser(child.name).type === AndroidType.linearLayout)[0]
  const isForwardText = "children" in linear && androidNameParser(linear.children[0].name).type === AndroidType.text

  let result = new androidDefaultBuilder("androidx.appcompat.widget.AppCompatButton");
  if (ostyle != outputStyle.shrink) {
    result = result.setText(text)
                .position(node, localSettings.optimizeLayout)
                .size(node, localSettings.optimizeLayout);
  }
  const resname = ostyle===outputStyle.selectable ? node.parent?.name : layout?.name;
  if ("layoutMode" in linear && linear.layoutMode === "HORIZONTAL") {
    result.pushModifier([`android:drawable${isForwardText ? "Right" : "Left"}`, `@drawable/${resname}`])
  } else {
    result.pushModifier([`android:drawable${isForwardText ? "Bottom" : "Top"}`, `@drawable/${resname}`])
  }

  result.element.addModifier(["android:background", "@color/clearColor"]);
  
  return result.build(0);
};

const androidRadioButton = (node: SceneNode & BaseFrameMixin): string => {
  const result = new androidDefaultBuilder("RadioButton")
    .setId(node)
    .size(node, localSettings.optimizeLayout)
    .position(node,localSettings.optimizeLayout);

  if (node.name.split("_")[2] === "checked") {
    result.pushModifier(["android:checked", "true"])
  }

  result.pushModifier(["android:onClick", "onRadioButtonClicked"])
  result.element.addModifier(androidBackground(node))
  result.pushModifier(androidShadow(node));
  
  return result.build(0);
};

const androidList = (node: SceneNode & BaseFrameMixin): string => {

  const result = new androidDefaultBuilder("androidx.recyclerview.widget.RecyclerView", "")
    .setId(node)
    .position(node,localSettings.optimizeLayout)
    .size(node,localSettings.optimizeLayout);

  result.element.addModifier(androidBackground(node))
  result.pushModifier(androidShadow(node));
  result.element.addModifier(["tools:listitem", `@layout/${node.name}_item`])
  return result.build(0);
};

const androidListItem = (node: SceneNode & BaseFrameMixin, indentLevel: number): string => {

  const children = widgetGeneratorWithLimits(
    node,
    node.children.length > 1 ? indentLevel + 1 : indentLevel
  );

  const idName = `${node.name}`
  const anyStack = createDirectionalStack(children, idName, node);
  return androidContainer(node, anyStack);
};

const androidSwitch = (node: SceneNode & BaseFrameMixin): string => {

  const result = new androidDefaultBuilder("Switch")
    .setId(node)
    .position(node,localSettings.optimizeLayout)
    .size(node,localSettings.optimizeLayout);
    if (node.name, "name" in node) {
      result.element.addModifier(["android:theme", `@style/${node.name}`])
    }

  return result.build(0)
};

const androidCheckBox = (node: SceneNode & BaseFrameMixin): string => {

  const result = new androidDefaultBuilder("CheckBox")
    .setId(node)
    .position(node,localSettings.optimizeLayout)
    .size(node,localSettings.optimizeLayout);
    result.element.addModifier(["android:checked", `false`])

  return result.build(0);
};

const androidLinear = (node: SceneNode & BaseFrameMixin, indentLevel: number): string => {
  const children = widgetGeneratorWithLimits(
    node,
    node.children.length > 1 ? indentLevel + 1 : indentLevel
  );

  const anyStack = createDirectionalStack(children, node.name, node);
  return androidContainer(node, anyStack);
}

const androidScroll = (node: SceneNode & BaseFrameMixin, indentLevel: number): string => {

  const children = widgetGeneratorWithLimits(
    node,
    node.children.length > 1 ? indentLevel + 1 : indentLevel
  );

  const anyStack = createDirectionalStack(children, node.name, node);
  return androidContainer(node, anyStack);
};

const androidEditText = (node: SceneNode & BaseFrameMixin): string => {
  let childText: SceneNode & TextNode | undefined = undefined
  if (node.children.filter(child => androidNameParser(child.name).type === AndroidType.text).length !== 0) {
    childText = node.children.filter((child): child is SceneNode & BaseFrameMixin => 
      androidNameParser(child.name).type === AndroidType.text
    )[0].children.filter((child): child is SceneNode & BaseFrameMixin =>
      androidNameParser(child.name).type === AndroidType.frameLayout
    )[0].children.filter((child): child is SceneNode & TextNode => child.type === "TEXT")[0]
  }
  const result = new androidDefaultBuilder("EditText")
  .setText(childText, true)
  .setId(node)
  .position(node,localSettings.optimizeLayout)
  .size(node,localSettings.optimizeLayout);
  return result.build(0);
}

const androidFrame = (
  node: SceneNode & BaseFrameMixin,
  indentLevel: number
): string => {
  const children = widgetGeneratorWithLimits(
    node,
    node.children.length > 1 ? indentLevel + 1 : indentLevel
  );

  const anyStack = createDirectionalStack(children, node.name, node);
  return androidContainer(node, anyStack);
};

const androidComponent = (node: SceneNode & BaseFrameMixin & TextNode, indentLevel: number, ostyle: outputStyle = outputStyle.encoded): string => {
  
  switch (androidNameParser(node.parent?.type === "COMPONENT_SET" ? node.parent?.name : node.name).type) {
    case AndroidType.view:
      return androidView(node)
    case AndroidType.text:
      if (
        "children" in node &&
        node.children[0].type === "FRAME" &&
        "children" in node.children[0] &&
        node.children[0].children[0].type === "TEXT"
      ) {
        return androidText(node.children[0].children[0], node)
      }
    case AndroidType.button:
      return androidButton(node, ostyle)
    case AndroidType.list:
      return androidList(node)
    case AndroidType.listItem:
      return androidListItem(node, indentLevel)
    case AndroidType.switch:
      return androidSwitch(node)
    case AndroidType.checkBox:
      return androidCheckBox(node)
    case AndroidType.verticalScrollView:
    case AndroidType.horizontalScrollView:
      return androidScroll(node, indentLevel)
    case AndroidType.radioButton:
      return androidRadioButton(node)
    case AndroidType.editText:
      return androidEditText(node)
    case AndroidType.linearLayout:
      return androidLinear(node, indentLevel)
    default:
      return androidFrame(node, indentLevel)
  }
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
  idName: string,
  node: SceneNode & InferredAutoLayoutResult,
  isClickable: boolean = false
  ): string => {
    const {height, width, weight} = androidSize(node, localSettings.optimizeLayout);
    const {type, id}  = androidNameParser(idName)
    const parentType = androidNameParser(node.parent?.name).type
    const hasLinearLayoutParent = parentType === AndroidType.linearLayout
    const layoutPosition = `android:${hasLinearLayoutParent ? "layout_margin" : "padding"}`

    let prop:Record<string, string | number> = {
      "android:layout_width": `${width}`,
      "android:layout_height": `${height}`
    }

    if (weight) {
      prop["android:layout_weight"] = `1` 
    }

    if (id !== "") {
      prop["android:id"] = `@+id/${id}` 
    }

    const grandchildrenHaveRadioButton = 
    "children" in node 
    && node.children.filter(node => 
      "children" in node
      && androidNameParser(node.name).type === AndroidType.linearLayout
      && node.children.filter(node => 
        androidNameParser(node.name).type === AndroidType.radioButton
      ).length !== 0
    ).length !== 0

    if (!hasLinearLayoutParent && node.parent && (node.x > 0 || node.y > 0)) {
      prop['android:layout_marginStart']=`${sliceNum(node.x)}dp`;
      prop['android:layout_marginTop']=`${sliceNum(node.y)}dp`;
    } 
    
    if (!node.parent) {
      prop["xmlns:android"]="http://schemas.android.com/apk/res/android"
    }

    if (node.paddingTop > 0) {
      prop[`${layoutPosition}Top`] = `${node.paddingTop}dp`
    }
    if (node.paddingBottom > 0) {
      prop[`${layoutPosition}Bottom`] = `${node.paddingBottom}dp`
    }
    if (node.paddingRight > 0) {
      prop[`${layoutPosition}End`] = `${node.paddingRight}dp`
    }
    if (node.paddingLeft > 0) {
      prop[`${layoutPosition}Start`] = `${node.paddingLeft}dp`
    }

    if (isClickable) {
      prop["android:clickable"] = "true"
      prop["android:focusable"] = "true"
    }

    const background = androidBackground(node)
    prop[background[0]] = background[1] ?? ""

    switch(type) {
      case AndroidType.linearLayout:
        prop["android:orientation"] = node.layoutMode === "VERTICAL" ? "vertical":"horizontal"
        prop["android:gravity"] = `${getGravityParam(node)}`
        return generateAndroidViewCode(grandchildrenHaveRadioButton ? "RadioGroup" : "LinearLayout", prop, children)
      case AndroidType.verticalScrollView:
        prop["android:scrollbars"]="vertical";
        return generateAndroidViewCode("ScrollView", prop, children)
      case AndroidType.horizontalScrollView:
        prop["android:scrollbars"]="horizontal";
        return generateAndroidViewCode("HorizontalScrollView", prop, children)
      default:
        return generateAndroidViewCode("FrameLayout", prop, children);
    }
}

export const generateAndroidViewCode = (
  className: string,
  properties: Record<string, string | number>,
  children: string
): string => {

  const compactPropertiesArray = compactProp(properties)
  if (!className) {
    return `${children}`;
  }
  else if (!children) {
    return `<${className}\n ${compactPropertiesArray}/>\n`;
  }
  else {
    return `<${className}\n ${compactPropertiesArray}>\n\n${indentString(
      children
    )}\n</${className}>\n`;
  }
};

const widgetGeneratorWithLimits = (
  node: SceneNode & ChildrenMixin,
  indentLevel: number
) => {
  const hasParentOfComponentSet = node.type === "COMPONENT_SET"
  return androidWidgetGenerator(
      commonSortChildrenWhenInferredAutoLayout(
      node,
      localSettings.optimizeLayout
    ),
    indentLevel,
    hasParentOfComponentSet
  );
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

const androidColorTable = (
  node: SceneNode
) : string => {
  if (node.type === "INSTANCE" && node.name === "ColorStyle") {
    const frame = (node.children[0] as FrameNode);
    const grp = (frame.children[0] as GroupNode);
    return ` ${(grp.children[1] as TextNode).characters}:${(grp.children[0] as TextNode).characters}\n`;
  }
  else if (node.type === "FRAME") {
    let result = "";
    (node as FrameNode).children.forEach((cnode,index) => {
      result += androidColorTable(cnode);
    });
    return result;
  }
  else {
    return "";
  }
};
