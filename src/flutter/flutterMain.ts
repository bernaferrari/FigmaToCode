import {
  AltEllipseNode,
  AltFrameNode,
  AltRectangleNode,
  AltGroupNode,
  AltTextNode,
} from "../altNodes/altMixins";
import { FlutterDefaultBuilder } from "./flutterDefaultBuilder";
import { AltSceneNode } from "../altNodes/altMixins";
import { mostFrequent } from "./flutter_helpers";
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

  if (result.length > 0) {
    result = result.slice(0, -1);
  }

  console.log(result);

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
    } else if (
      node.type === "FRAME"
      // || node.type === "INSTANCE" ||
      // node.type === "COMPONENT"
    ) {
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
  } else if (node.layoutMode === "NONE" && node.children.length > 1) {
    // children will need to be absolute
    return flutterContainer(node, `Stack(children:[${children}],),`);
  } else {
    // node.layoutMode === "NONE" && node.children.length === 1
    // children doesn't need to be absolute, but might need to be positioned
    // TODO add a flex here?!
    // TODO 2 maybe just add margin right/left/top/bottom can solve?
    return flutterContainer(node, children);
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
      ? `crossAxisAlignment: CrossAxisAlignment.${layoutAlign},`
      : "";

  const mainAxisSize = "mainAxisSize: MainAxisSize.min,";

  return `${rowOrColumn}(${mainAxisSize}${crossAxisColumn}children:[${children}],),`;
};

const flutterVector = (node: VectorNode) => {
  // TODO Vector support in Flutter is complicated.
  return `\nCenter(
          child: Container(
          //todo this is a vector. 
          width: ${node.width},
          height: ${node.height},
          color: Color(0xffff0000),
        ),
      ),`;
};

const addSpacingIfNeeded = (
  node: AltSceneNode,
  comp: string,
  index: number,
  len: number
): string => {
  if (node.parent?.type === "FRAME") {
    // check if itemSpacing is set and if it isn't the last value.
    // Don't add the SizedBox at last value. In Figma, itemSpacing CAN be negative; here it can't.
    if (node.parent.itemSpacing > 0 && index < len - 1) {
      if (node.parent.layoutMode === "HORIZONTAL") {
        return `${comp} SizedBox(width: ${node.parent.itemSpacing}),`;
      } else if (node.parent.layoutMode === "VERTICAL") {
        return `${comp} SizedBox(height: ${node.parent.itemSpacing}),`;
      }
    }
  }
  return comp;
};
