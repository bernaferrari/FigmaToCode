import { StyledTextSegmentSubset, ParentNode } from "types";
import {
  overrideReadonlyProperty,
  assignParent,
  isNotEmpty,
  assignRectangleType,
  assignChildren,
} from "./altNodeUtils";
import { addWarning } from "../common/commonConversionWarnings";

export let globalTextStyleSegments: Record<string, StyledTextSegmentSubset[]> =
  {};

export const convertNodeToAltNode =
  (parent: ParentNode | null) => (node: SceneNode) => {
    switch (node.type) {
      // Standard nodes
      case "RECTANGLE":
      case "ELLIPSE":
      case "LINE":
      case "STAR":
      case "POLYGON":
        return cloneNode(node, parent);

      // Group nodes
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        //TODO: I think this is almost identical to the group thing below

        // TODO: Fix asset export. Use the new API.
        return frameNodeTo(node, parent);

      case "SECTION":
        const sectionClone = cloneNode(node, parent);
        const sectionChildren = convertNodesToAltNodes(
          node.children,
          sectionClone,
        );
        return assignChildren(sectionChildren, sectionClone);

      case "GROUP":
        if (node.children.length === 1 && node.visible) {
          // if Group is visible and has only one child, Group should disappear.
          // there will be a single value anyway.
          return convertNodesToAltNodes(node.children, parent)[0];
        }

        const groupClone = cloneNode(node, parent);
        const groupChildren = convertNodesToAltNodes(node.children, groupClone);
        const groupWithChildren = assignChildren(groupChildren, groupClone);

        return groupWithChildren;

      // Text Nodes
      case "TEXT":
        globalTextStyleSegments[node.id] = extractStyledTextSegments(node);
        return cloneNode(node, parent);

      // Unsupported
      case "BOOLEAN_OPERATION":
        addWarning(
          "Boolean Groups are not supported and will be converted to rectangles.",
        );
        return cloneAsRectangleNode(node, parent);

      case "SLICE":
        throw new Error(
          `Sorry, Slices are not supported. Type:${node.type} id:${node.id}`,
        );
      default:
        throw new Error(
          `Sorry, an unsupported node type was selected. Type:${node.type} id:${node.id}`,
        );
    }
  };

export const convertNodesToAltNodes = (
  sceneNode: ReadonlyArray<SceneNode>,
  parent: ParentNode | null,
): Array<SceneNode> =>
  sceneNode.map(convertNodeToAltNode(parent)).filter(isNotEmpty);

export const cloneNode = <T extends BaseNode>(
  node: T,
  parent: ParentNode | null,
): T => {
  // Create the cloned object with the correct prototype
  const cloned = {} as T;
  // Create a new object with only the desired descriptors (excluding 'parent' and 'children')
  const droppedProps = [
    "parent",
    "children",
    "horizontalPadding",
    "verticalPadding",
    "mainComponent",
    "masterComponent",
    "variantProperties",
    "get_annotations",
    "componentPropertyDefinitions",
    "exposedInstances",
    "componentProperties",
    "componenPropertyReferences",
  ];
  for (const prop in node) {
    if (prop in droppedProps === false) {
      cloned[prop as keyof T] = node[prop as keyof T];
    }
  }
  assignParent(parent, cloned);

  return cloned;
};

export const frameNodeTo = (
  node: FrameNode | InstanceNode | ComponentNode | ComponentSetNode,
  parent: ParentNode | null,
):
  | RectangleNode
  | FrameNode
  | InstanceNode
  | ComponentNode
  | GroupNode
  | ComponentSetNode => {
  if (node.children.length === 0) {
    // if it has no children, convert frame to rectangle
    return cloneAsRectangleNode(node, parent);
  }
  const clone = cloneNode(node, parent);

  overrideReadonlyProperty(
    "children",
    convertNodesToAltNodes(node.children, clone),
    clone,
  );
  return clone;
};

// auto convert Frame to Rectangle when Frame has no Children
const cloneAsRectangleNode = <T extends BaseNode>(
  node: T,
  parent: ParentNode | null,
): RectangleNode => {
  const clonedNode = cloneNode(node, parent);

  assignRectangleType(clonedNode);

  return clonedNode as unknown as RectangleNode;
};

const extractStyledTextSegments = (node: TextNode) =>
  node.getStyledTextSegments([
    "fontName",
    "fills",
    "fontSize",
    "fontWeight",
    "hyperlink",
    "indentation",
    "letterSpacing",
    "lineHeight",
    "listOptions",
    "textCase",
    "textDecoration",
    "textStyleId",
    "fillStyleId",
    "openTypeFeatures",
  ]);
