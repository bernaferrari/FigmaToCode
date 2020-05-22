import { FlutterChildBuilder } from "./flutter_builder";
import { makeRowColumn } from "./flutter_widget";

let parentId = "";

export const flutterMain = (
  parentId_src: string,
  sceneNode: ReadonlyArray<SceneNode>
): string => {
  parentId = parentId_src;
  return flutterWidgetGenerator(sceneNode);
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const flutterWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>
): string => {
  let comp = "";
  const sceneLen = sceneNode.length;

  sceneNode.forEach((node, index) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp = flutterContainer(node, "");
    } else if (node.type === "VECTOR") {
      comp = flutterVector(node);
    } else if (node.type === "GROUP") {
      comp = flutterGroup(node);
    } else if (
      node.type === "FRAME" ||
      node.type === "INSTANCE" ||
      node.type === "COMPONENT"
    ) {
      comp = flutterFrame(node);
    } else if (node.type === "TEXT") {
      comp = flutterText(node);
    }

    // if the parent is an AutoLayout, and itemSpacing is set, add a SizedBox between items.
    // on else, comp = comp (return it to itself);
    comp = addSpacingIfNeeded(node, comp, index, sceneLen);
  });

  return comp;
};

const flutterGroup = (node: GroupNode): string => {
  // TODO generate Rows or Columns instead of Stack when Group is simple enough (two or three items) and they aren't on top of one another.
  return `Stack(children:[${flutterWidgetGenerator(node.children)}],),`;
};

const flutterContainer = (
  node: FrameNode | ComponentNode | InstanceNode | RectangleNode | EllipseNode,
  child: string
): string => {
  const builder = new FlutterChildBuilder();

  builder
    .createContainer(node, child)
    .rotation(node)
    .visibility(node)
    .opacity(node)
    .containerPosition(node, parentId);

  return builder.child;
};

const flutterText = (node: TextNode): string => {
  const builder = new FlutterChildBuilder();

  builder
    .createText(node)
    .opacity(node)
    .textInAlign(node)
    .containerPosition(node, parentId);

  return builder.child;
};

const flutterFrame = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  const children = flutterWidgetGenerator(node.children);

  if (node.layoutMode === "NONE" && node.children.length > 1) {
    return flutterContainer(node, `Stack(children:[${children}],),`);
  } else if (node.children.length > 1) {
    const rowColumn = makeRowColumn(node, children);
    return flutterContainer(node, rowColumn);
  } else {
    return flutterContainer(node, children);
  }
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
  node: SceneNode,
  comp: string,
  index: number,
  len: number
): string => {
  if (
    node.parent?.type === "FRAME" ||
    node.parent?.type === "INSTANCE" ||
    node.parent?.type === "COMPONENT"
  ) {
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
