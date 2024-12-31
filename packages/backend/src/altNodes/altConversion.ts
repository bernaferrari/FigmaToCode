import { StyledTextSegmentSubset, ParentNode } from "types";
import {
  overrideReadonlyProperty,
  assignParent,
  isNotEmpty,
} from "./altNodeUtils";

export let globalTextStyleSegments: Record<string, StyledTextSegmentSubset[]> =
  {};

export const convertNodeToAltNode =
  (parent: ParentNode | null = null) =>
  (node: SceneNode) => {
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
      case "LINE":
        return standardClone(node, parent);
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        // TODO Fix asset export. Use the new API.
        return frameNodeTo(node, parent);
      case "GROUP":
        if (node.children.length === 1 && node.visible) {
          // if Group is visible and has only one child, Group should disappear.
          // there will be a single value anyway.
          return convertNodesToAltNodes(node.children, parent)[0];
        }

        const clone = standardClone(node, parent);

        overrideReadonlyProperty(
          "children",
          convertNodesToAltNodes(node.children, clone),
          clone,
        );

        // try to find big rect and regardless of that result, also try to convert to autolayout.
        // There is a big chance this will be returned as a Frame
        // also, Group will always have at least 2 children.
        return convertNodesOnRectangle(clone);
      case "TEXT":
        globalTextStyleSegments[node.id] = node.getStyledTextSegments([
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
        return standardClone(node, parent);
      case "STAR":
      case "POLYGON":
      case "VECTOR":
        return standardClone(node, parent);
      case "SECTION":
        const sectionClone = standardClone(node, parent);
        overrideReadonlyProperty(
          "children",
          convertNodesToAltNodes(node.children, sectionClone),
          sectionClone,
        );
        return sectionClone;
      case "BOOLEAN_OPERATION":
        const clonedOperation = standardClone(node, parent);
        overrideReadonlyProperty("type", "RECTANGLE", clonedOperation);
        clonedOperation.fills = [
          {
            type: "IMAGE",
            scaleMode: "FILL",
            imageHash: "0",
            opacity: 1,
            visible: true,
            blendMode: "NORMAL",
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
          },
        ];
        return clonedOperation;
      default:
        return null;
    }
  };

export const convertNodesToAltNodes = (
  sceneNode: ReadonlyArray<SceneNode>,
  parent: ParentNode | null = null,
): Array<SceneNode> =>
  sceneNode.map(convertNodeToAltNode(parent)).filter(isNotEmpty);

export const cloneNode = <T extends BaseNode>(node: T): T => {
  // Create the cloned object with the correct prototype
  const cloned = {} as T;
  // Create a new object with only the desired descriptors (excluding 'parent' and 'children')
  for (const prop in node) {
    if (
      prop !== "parent" &&
      prop !== "children" &&
      prop !== "horizontalPadding" &&
      prop !== "verticalPadding" &&
      prop !== "mainComponent" &&
      prop !== "masterComponent" &&
      prop !== "variantProperties" &&
      prop !== "get_annotations" &&
      prop !== "componentPropertyDefinitions" &&
      prop !== "exposedInstances" &&
      prop !== "componentProperties" &&
      prop !== "componenPropertyReferences"
    ) {
      cloned[prop as keyof T] = node[prop as keyof T];
    }
  }

  return cloned;
};

/**
 * Identify all nodes that are inside Rectangles and transform those Rectangles into Frames containing those nodes.
 */
export const convertNodesOnRectangle = (
  node: FrameNode | GroupNode | InstanceNode | ComponentNode | ComponentSetNode,
): FrameNode | GroupNode | InstanceNode | ComponentNode | ComponentSetNode => {
  if (node.children.length < 2) {
    return node;
  }
  if (!node.id) {
    throw new Error(
      "Node is missing an id! This error should only happen in tests.",
    );
  }

  return node;
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
    return frameToRectangleNode(node, parent);
  }
  const clone = standardClone(node, parent);

  overrideReadonlyProperty(
    "children",
    convertNodesToAltNodes(node.children, clone),
    clone,
  );
  return convertNodesOnRectangle(clone);
};

// auto convert Frame to Rectangle when Frame has no Children
const frameToRectangleNode = (
  node: FrameNode | InstanceNode | ComponentNode | ComponentSetNode,
  parent: ParentNode | null,
): RectangleNode => {
  const clonedNode = cloneNode(node);
  if (parent) {
    assignParent(parent, clonedNode);
  }
  overrideReadonlyProperty("type", "RECTANGLE", clonedNode);

  return clonedNode as unknown as RectangleNode;
};

const standardClone = <T extends SceneNode>(
  node: T,
  parent: ParentNode | null,
): T => {
  const clonedNode = cloneNode(node);
  if (parent !== null) {
    assignParent(parent, clonedNode);
  }
  return clonedNode;
};
