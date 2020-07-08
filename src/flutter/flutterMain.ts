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

let parentId = "";
let material = true;

export const flutterMain = (
  sceneNode: Array<AltSceneNode>,
  parentIdSrc: string = "",
  isMaterial: boolean = false
): string => {
  parentId = parentIdSrc;
  material = isMaterial;

  let result = flutterWidgetGenerator(sceneNode);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.slice(0, 1) === "\n") {
    result = result.slice(1, result.length);
  }

  result = result.slice(0, -1);

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const flutterWidgetGenerator = (
  sceneNode: ReadonlyArray<AltSceneNode>
): string => {
  let comp = "";
  const sceneLen = sceneNode.length;

  sceneNode.forEach((node, index) => {
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

    // if the parent is an AutoLayout, and itemSpacing is set, add a SizedBox between items.
    // on else, comp = comp (return it to itself);
    comp = addSpacingIfNeeded(node, comp, index, sceneLen);
  });

  return comp;
};

const flutterGroup = (node: AltGroupNode): string => {
  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new FlutterDefaultBuilder(
    `Stack(children:[${flutterWidgetGenerator(node.children)}],),`
  )
    .blendAttr(node)
    .containerPosition(node, parentId);
  // .widthHeight(node);

  return builder.child;
};

const flutterContainer = (
  node: AltFrameNode | AltRectangleNode | AltEllipseNode,
  child: string
): string => {
  const builder = new FlutterDefaultBuilder(child);

  builder
    .createContainer(node, material)
    .blendAttr(node)
    .containerPosition(node, parentId);

  return builder.child;
};

const flutterText = (node: AltTextNode): string => {
  const builder = new FlutterTextBuilder();

  builder
    .createText(node)
    .blendAttr(node)
    .textInAlign(node)
    .textAutoSize(node)
    .containerPosition(node, parentId);

  return builder.child;
};

const flutterFrame = (node: AltFrameNode): string => {
  const children = flutterWidgetGenerator(node.children);

  if (node.layoutMode !== "NONE") {
    const rowColumn = makeRowColumn(node, children);
    return flutterContainer(node, rowColumn);
  } else {
    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return flutterContainer(node, `Stack(children:[${children}],),`);
  }
};

const makeRowColumn = (node: AltFrameNode, children: string): string => {
  // ROW or COLUMN

  // if there is only one child, there is no need for Container or Row. Padding works indepdently of them.
  if (node.children.length === 1) {
    return children;
  }

  const rowOrColumn = node.layoutMode === "HORIZONTAL" ? "Row" : "Column";

  const mostFreq = mostFrequent(node.children.map((d) => d.layoutAlign));

  const layoutAlign = mostFreq === "MIN" ? "start" : "center";

  const crossAxisColumn =
    rowOrColumn === "Column"
      ? `crossAxisAlignment: CrossAxisAlignment.${layoutAlign}, `
      : "";

  const mainAxisSize = "mainAxisSize: MainAxisSize.min, ";

  return `${rowOrColumn}(${mainAxisSize}${crossAxisColumn}children:[${children}], ), `;
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

// TODO Vector support in Flutter is complicated.
// const flutterVector = (node: VectorNode) => {
//   return `\nCenter(
//           child: Container(
//           width: ${node.width},
//           height: ${node.height},
//           color: Color(0xffff0000),
//         ),
//       ),`;
// };

const addSpacingIfNeeded = (
  node: AltSceneNode,
  comp: string,
  index: number,
  len: number
): string => {
  if (node.parent?.type === "FRAME" && node.parent.layoutMode !== "NONE") {
    // check if itemSpacing is set and if it isn't the last value.
    // Don't add the SizedBox at last value. In Figma, itemSpacing CAN be negative; here it can't.
    if (node.parent.itemSpacing > 0 && index < len - 1) {
      if (node.parent.layoutMode === "HORIZONTAL") {
        return `${comp} SizedBox(width: ${node.parent.itemSpacing}),`;
      } else {
        // node.parent.layoutMode === "VERTICAL"
        return `${comp} SizedBox(height: ${node.parent.itemSpacing}),`;
      }
    }
  }
  return comp;
};
