import {
  generateWidgetCode,
  skipDefaultProperty,
  sliceNum,
} from "../common/numToAutoFixed";
import { retrieveTopFill } from "../common/retrieveFill";
import { FlutterDefaultBuilder } from "./flutterDefaultBuilder";
import { FlutterTextBuilder } from "./flutterTextBuilder";
import { indentString } from "../common/indentString";

let parentId = "";

export const flutterMain = (
  sceneNode: ReadonlyArray<SceneNode>,
  parentIdSrc: string = "",
  isMaterial: boolean = false
): string => {
  parentId = parentIdSrc;

  let result = flutterWidgetGenerator(sceneNode);

  // remove the last ','
  result = result.slice(0, -1);

  return result;
};

const flutterWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>
): string => {
  let comp: string[] = [];

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible);
  const sceneLen = visibleSceneNode.length;

  visibleSceneNode.forEach((node, index) => {
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
      case "STAR":
      case "POLYGON":
        comp.push(flutterContainer(node, ""));
        break;
      case "GROUP":
        comp.push(flutterGroup(node));
        break;
      case "FRAME":
        comp.push(flutterFrame(node));
        break;
      case "TEXT":
        comp.push(flutterText(node));
        break;
      default:
      // do nothing
    }

    const spacing = addSpacingIfNeeded(node);
    if (spacing) {
      comp.push(spacing);
    }
  });

  return comp.join(",\n") + ",";
};

const flutterGroup = (node: GroupNode): string => {
  return flutterContainer(
    node,
    generateWidgetCode("Stack", {
      children: `[\n${indentString(
        flutterWidgetGenerator(node.children),
        2
      )}\n]`,
    })
  );
};

const flutterContainer = (
  node: SceneNode & BlendMixin & LayoutMixin,
  child: string
): string => {
  let propChild = "";

  let image = "";
  if ("fills" in node && retrieveTopFill(node.fills)?.type === "IMAGE") {
    image = `FlutterLogo(size: ${Math.min(node.width, node.height)}),`;
  }

  if (child.length > 0 && image.length > 0) {
    const prop1 = generateWidgetCode("Positioned.fill", {
      child: child,
    });
    const prop2 = generateWidgetCode("Positioned.fill", {
      child: image,
    });

    propChild = generateWidgetCode("Stack", {
      children: `[\n${indentString(prop1 + prop2, 2)}\n]`,
    });
  } else if (child.length > 0) {
    propChild = child;
  } else if (image.length > 0) {
    propChild = image;
  }

  const builder = new FlutterDefaultBuilder(propChild)
    .createContainer(node)
    .blendAttr(node)
    .position(node, parentId);

  return builder.child;
};

const flutterText = (node: TextNode): string => {
  const builder = new FlutterTextBuilder();

  builder
    .createText(node)
    .blendAttr(node)
    .textAutoSize(node)
    .position(node, parentId);

  return builder.child;
};

const flutterFrame = (node: FrameNode): string => {
  const children = flutterWidgetGenerator(node.children);

  if (node.layoutMode !== "NONE") {
    const rowColumn = makeRowColumn(node, children);
    return flutterContainer(node, rowColumn);
  } else {
    return flutterContainer(
      node,
      generateWidgetCode("Stack", {
        children: `[\n${indentString(children, 2)}\n]`,
      })
    );
  }
};

const makeRowColumn = (node: FrameNode, children: string): string => {
  const rowOrColumn = node.layoutMode === "HORIZONTAL" ? "Row" : "Column";

  return generateWidgetCode(rowOrColumn, {
    mainAxisSize:
      node.layoutGrow === 1 ? "MainAxisSize.max" : "MainAxisSize.min",
    mainAxisAlignment: skipDefaultProperty(
      getMainAxisAlignment(node),
      "MainAxisAlignment.start"
    ),
    crossAxisAlignment: getCrossAxisAlignment(node),
    children: `[\n${indentString(children, 2)}\n]`,
  });
};

const getMainAxisAlignment = (node: FrameNode): string => {
  switch (node.primaryAxisAlignItems) {
    case "MIN":
      return "MainAxisAlignment.start";
    case "CENTER":
      return "MainAxisAlignment.center";
    case "MAX":
      return "MainAxisAlignment.end";
    case "SPACE_BETWEEN":
      return "MainAxisAlignment.spaceBetween";
  }
};

const getCrossAxisAlignment = (node: FrameNode): string => {
  switch (node.counterAxisAlignItems) {
    case "MIN":
      return "CrossAxisAlignment.start";
    case "CENTER":
      return "CrossAxisAlignment.center";
    case "MAX":
      return "CrossAxisAlignment.end";
    case "BASELINE":
      return "";
  }
  return "";
};

const addSpacingIfNeeded = (node: SceneNode): string => {
  if (node.parent?.type === "FRAME" && node.parent.layoutMode !== "NONE") {
    if (node.parent.itemSpacing > 0) {
      if (node.parent.layoutMode === "HORIZONTAL") {
        return generateWidgetCode("SizedBox", {
          width: node.parent.itemSpacing,
        });
      } else {
        return generateWidgetCode("SizedBox", {
          height: node.parent.itemSpacing,
        });
      }
    }
  }
  return "";
};
