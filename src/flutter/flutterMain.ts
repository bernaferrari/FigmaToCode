import { indentString } from "./../common/indentString";
import {
  AltEllipseNode,
  AltFrameNode,
  AltRectangleNode,
  AltGroupNode,
  AltTextNode,
} from "../altNodes/altMixins";
import { FlutterDefaultBuilder } from "./flutterDefaultBuilder";
import { AltSceneNode } from "../altNodes/altMixins";
import { FlutterTextBuilder } from "./flutterTextBuilder";
import { numToAutoFixed } from "../common/numToAutoFixed";

let parentId = "";
let material = true;

export const flutterMain = (
  sceneNode: ReadonlyArray<AltSceneNode>,
  parentIdSrc: string = "",
  isMaterial: boolean = false
): string => {
  parentId = parentIdSrc;
  material = isMaterial;

  let result = flutterWidgetGenerator(sceneNode);

  // remove the last ','
  result = result.slice(0, -1);

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const flutterWidgetGenerator = (
  sceneNode: ReadonlyArray<AltSceneNode>
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible !== false);
  const sceneLen = visibleSceneNode.length;

  visibleSceneNode.forEach((node, index) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += flutterContainer(node, "");
    }
    //  else if (node.type === "VECTOR") {
    // comp = flutterVector(node);
    // }
    else if (node.type === "GROUP") {
      comp += flutterGroup(node);
    } else if (node.type === "FRAME") {
      comp += flutterFrame(node);
    } else if (node.type === "TEXT") {
      comp += flutterText(node);
    }

    if (index < sceneLen - 1) {
      // if the parent is an AutoLayout, and itemSpacing is set, add a SizedBox between items.
      // on else, comp += ""
      const spacing = addSpacingIfNeeded(node);
      if (spacing) {
        // comp += "\n";
        comp += spacing;
      }

      // don't add a newline at last element.
      comp += "\n";
    }
  });

  return comp;
};

const flutterGroup = (node: AltGroupNode): string => {
  const properties = `\nchildren:[${flutterWidgetGenerator(node.children)}],`;

  return flutterContainer(node, `Stack(${indentString(properties)}\n),`);
};

const flutterContainer = (
  node: AltFrameNode | AltGroupNode | AltRectangleNode | AltEllipseNode,
  child: string
): string => {
  const builder = new FlutterDefaultBuilder(child);

  builder
    .createContainer(node, material)
    .blendAttr(node)
    .position(node, parentId);

  return builder.child;
};

const flutterText = (node: AltTextNode): string => {
  const builder = new FlutterTextBuilder();

  builder
    .createText(node)
    .blendAttr(node)
    .textAutoSize(node)
    .position(node, parentId);

  return builder.child;
};

const flutterFrame = (node: AltFrameNode): string => {
  const children = flutterWidgetGenerator(node.children);

  if (node.children.length === 1) {
    // if there is only one child, there is no need for Container or Row. Padding works indepdently of them.
    return flutterContainer(node, children);
  } else if (node.layoutMode !== "NONE") {
    const rowColumn = makeRowColumn(node, children);
    return flutterContainer(node, rowColumn);
  } else {
    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute

    const properties = `\nchildren:[\n${indentString(children, 1)}\n],`;

    return flutterContainer(node, `Stack(${indentString(properties)}\n),`);
  }
};

const makeRowColumn = (node: AltFrameNode, children: string): string => {
  // ROW or COLUMN
  const rowOrColumn = node.layoutMode === "HORIZONTAL" ? "Row" : "Column";

  let crossAlignType;
  switch (node.counterAxisAlignItems) {
    case "MIN":
      crossAlignType = "start";
      break;
    case "CENTER":
      crossAlignType = "center";
      break;
    case "MAX":
      crossAlignType = "end";
      break;
  }
  const crossAxisAlignment = `\ncrossAxisAlignment: CrossAxisAlignment.${crossAlignType},`;

  let mainAlignType;
  switch (node.primaryAxisAlignItems) {
    case "MIN":
      mainAlignType = "start";
      break;
    case "CENTER":
      mainAlignType = "center";
      break;
    case "MAX":
      mainAlignType = "end";
      break;
    case "SPACE_BETWEEN":
      mainAlignType = "spaceBetween";
      break;
  }
  const mainAxisAlignment = `\nmainAxisAlignment: MainAxisAlignment.${mainAlignType},`;

  let mainAxisSize;
  if (node.layoutGrow === 1) {
    mainAxisSize = "\nmainAxisSize: MainAxisSize.max,";
  } else {
    mainAxisSize = "\nmainAxisSize: MainAxisSize.min,";
  }

  const properties =
    mainAxisSize +
    mainAxisAlignment +
    crossAxisAlignment +
    `\nchildren:[\n${indentString(children, 1)}\n],`;

  return `${rowOrColumn}(${indentString(properties, 1)}\n),`;
};

// TODO Vector support in Flutter is complicated. Currently, AltConversion converts it in a Rectangle.

const addSpacingIfNeeded = (node: AltSceneNode): string => {
  if (node.parent?.type === "FRAME" && node.parent.layoutMode !== "NONE") {
    // check if itemSpacing is set and if it isn't the last value.
    // Don't add the SizedBox at last value. In Figma, itemSpacing CAN be negative; here it can't.
    if (node.parent.itemSpacing > 0) {
      if (node.parent.layoutMode === "HORIZONTAL") {
        return `\nSizedBox(width: ${numToAutoFixed(node.parent.itemSpacing)}),`;
      } else {
        // node.parent.layoutMode === "VERTICAL"
        return `\nSizedBox(height: ${numToAutoFixed(
          node.parent.itemSpacing
        )}),`;
      }
    }
  }
  return "";
};
