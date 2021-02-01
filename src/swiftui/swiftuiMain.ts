import { numToAutoFixed } from "./../common/numToAutoFixed";
import { AltFrameNode, AltGroupNode, AltTextNode } from "../altNodes/altMixins";
import { AltSceneNode } from "../altNodes/altMixins";
import { SwiftuiTextBuilder } from "./swiftuiTextBuilder";
import { SwiftuiDefaultBuilder } from "./swiftuiDefaultBuilder";
import { swiftuiRoundedRectangle } from "./builderImpl/swiftuiBorder";
import { indentString } from "../common/indentString";

let parentId = "";

export const swiftuiMain = (
  sceneNode: Array<AltSceneNode>,
  parentIdSrc: string = ""
): string => {
  parentId = parentIdSrc;

  let result = swiftuiWidgetGenerator(sceneNode, 0);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.slice(0, 1) === "\n") {
    result = result.slice(1, result.length);
  }

  return result;
};

const swiftuiWidgetGenerator = (
  sceneNode: ReadonlyArray<AltSceneNode>,
  indentLevel: number
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible !== false);
  const sceneLen = visibleSceneNode.length;

  visibleSceneNode.forEach((node, index) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += swiftuiContainer(node, indentLevel);
    } else if (node.type === "GROUP") {
      comp += swiftuiGroup(node, indentLevel);
    } else if (node.type === "FRAME") {
      comp += swiftuiFrame(node, indentLevel);
    } else if (node.type === "TEXT") {
      comp += swiftuiText(node, indentLevel);
    }

    // don't add a newline at last element.
    if (index < sceneLen - 1) {
      comp += "\n";
    }
  });

  return comp;
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const swiftuiContainer = (
  node: AltSceneNode,
  indentLevel: number,
  children: string = ""
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const modifiers = new SwiftuiDefaultBuilder()
    .shapeBackground(node)
    .shapeBorder(node)
    .blend(node)
    .autoLayoutPadding(node)
    .position(node, parentId)
    .widthHeight(node)
    .layerBackground(node)
    .layerBorder(node)
    .effects(node)
    .build();

  let kind = "";
  if (node.type === "RECTANGLE" || (!children && node.type === "FRAME")) {
    // return a different kind of Rectangle when cornerRadius exists
    const roundedRect = swiftuiRoundedRectangle(node);
    if (roundedRect) {
      kind = roundedRect;
    } else {
      kind = "Rectangle()";
    }
  } else if (node.type === "ELLIPSE") {
    kind = "Ellipse()";
  } else {
    kind = children;
  }

  // only add the newline when result is not empty
  const result = (children !== kind ? "\n" : "") + kind + modifiers;
  return indentString(result, indentLevel);
};

const swiftuiGroup = (node: AltGroupNode, indentLevel: number): string => {
  return swiftuiContainer(
    node,
    indentLevel,
    `\nZStack {${widgetGeneratorWithLimits(node, indentLevel)}\n}`
  );
};

const swiftuiText = (node: AltTextNode, indentLevel: number): string => {
  const builder = new SwiftuiTextBuilder();

  let text = node.characters;
  if (node.textCase === "LOWER") {
    text = text.toLowerCase();
  } else if (node.textCase === "UPPER") {
    text = text.toUpperCase();
  }

  const splittedChars = text.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1 ? splittedChars.join("\\n") : text;

  const modifier = builder
    .textDecoration(node)
    .textStyle(node)
    .textAutoSize(node)
    .letterSpacing(node)
    .lineHeight(node)
    .blend(node)
    .layerBackground(node)
    .position(node, parentId)
    .build();

  const result = `\nText("${charsWithLineBreak}")${modifier}`;
  return indentString(result, indentLevel);
};

const swiftuiFrame = (node: AltFrameNode, indentLevel: number): string => {
  // when there is a single children, indent should be zero; [swiftuiContainer] will already assign it.
  const updatedIndentLevel = node.children.length === 1 ? 0 : indentLevel + 1;

  const children = widgetGeneratorWithLimits(node, updatedIndentLevel);

  // if there is only one child, there is no need for a HStack of VStack.
  if (node.children.length === 1) {
    return swiftuiContainer(node, indentLevel, children);
    // return swiftuiContainer(node, rowColumn);
  } else if (node.layoutMode !== "NONE") {
    const rowColumn = wrapInDirectionalStack(node, children);
    return swiftuiContainer(node, indentLevel, rowColumn);
  } else {
    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return swiftuiContainer(node, indentLevel, `\nZStack {${children}\n}`);
  }
};

const wrapInDirectionalStack = (
  node: AltFrameNode,
  children: string
): string => {
  const rowOrColumn = node.layoutMode === "HORIZONTAL" ? "HStack" : "VStack";

  // retrieve the align based on the most frequent position of children
  // SwiftUI doesn't allow the children to be set individually. And there are different align properties for HStack and VStack.
  let layoutAlign = "";
  const mostFreq = node.counterAxisAlignItems;
  if (node.layoutMode === "VERTICAL") {
    if (mostFreq === "MIN") {
      layoutAlign = "alignment: .leading";
    } else if (mostFreq === "MAX") {
      layoutAlign = "alignment: .trailing";
    }
  } else {
    if (mostFreq === "MIN") {
      layoutAlign = "alignment: .top";
    } else if (mostFreq === "MAX") {
      layoutAlign = "alignment: .bottom";
    }
  }

  // only add comma and a space if layoutAlign has a value
  const comma = layoutAlign ? ", " : "";
  // default spacing for SwiftUI is 16.
  const spacing =
    Math.round(node.itemSpacing) !== 16
      ? `${comma}spacing: ${numToAutoFixed(node.itemSpacing)}`
      : "";

  return `\n${rowOrColumn}(${layoutAlign}${spacing}) {${children}\n}`;
};

// https://stackoverflow.com/a/20762713
export const mostFrequent = (arr: Array<string>): string | undefined => {
  return arr
    .sort(
      (a, b) =>
        arr.filter((v) => v === a).length - arr.filter((v) => v === b).length
    )
    .pop();
};

// todo should the plugin manually Group items? Ideally, it would detect the similarities and allow a ForEach.
const widgetGeneratorWithLimits = (
  node: AltFrameNode | AltGroupNode,
  indentLevel: number
) => {
  if (node.children.length < 10) {
    // standard way
    return swiftuiWidgetGenerator(node.children, indentLevel);
  }

  const chunk = 10;
  let strBuilder = "";
  const slicedChildren = node.children.slice(0, 100);

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
    strBuilder += `\nGroup {${strChildren}\n}`;
  }

  return strBuilder;
};
