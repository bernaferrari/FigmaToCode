import { StyledTextSegmentSubset, ParentNode, AltNode } from "types";
import {
  assignParent,
  isNotEmpty,
  assignRectangleType,
  assignChildren,
} from "./altNodeUtils";
import { curry } from "../common/curry";

export const isTypeOrGroupOfTypes = curry(
  (matchTypes: NodeType[], node: SceneNode): boolean => {
    if (node.visible === false || matchTypes.includes(node.type)) return true;

    if ("children" in node) {
      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i];
        const result = isTypeOrGroupOfTypes(matchTypes, childNode);
        if (result) continue;
        // child is false
        return false;
      }
      // all children are true
      return true;
    }

    // not group or vector
    return false;
  },
);

export let globalTextStyleSegments: Record<string, StyledTextSegmentSubset[]> =
  {};

// List of types that can be flattened into SVG
const canBeFlattened = isTypeOrGroupOfTypes([
  "VECTOR",
  "STAR",
  "POLYGON",
  "BOOLEAN_OPERATION",
]);

export const convertNodeToAltNode =
  (parent: ParentNode | null) =>
  (node: SceneNode): SceneNode => {
    const type = node.type;
    switch (type) {
      // Standard nodes
      case "RECTANGLE":
      case "ELLIPSE":
      case "LINE":
      case "STAR":
      case "POLYGON":
      case "VECTOR":
      case "BOOLEAN_OPERATION":
        return cloneNode(node, parent);

      // Group nodes
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        // if the frame, instance etc. has no children, convert the frame to rectangle
        if (node.children.length === 0)
          return cloneAsRectangleNode(node, parent);
      // goto SECTION

      case "GROUP":
        // if a Group is visible and has only one child, the Group should be ungrouped.
        if (type === "GROUP" && node.children.length === 1 && node.visible)
          return convertNodeToAltNode(parent)(node.children[0]);
      // goto SECTION

      case "SECTION":
        const group = cloneNode(node, parent);
        const groupChildren = oldConvertNodesToAltNodes(node.children, group);
        return assignChildren(groupChildren, group);

      // Text Nodes
      case "TEXT":
        globalTextStyleSegments[node.id] = extractStyledTextSegments(node);
        return cloneNode(node, parent);

      // Unsupported Nodes
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

export const oldConvertNodesToAltNodes = (
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
      prop !== "instances" &&
      prop !== "componentProperties" &&
      prop !== "componenPropertyReferences" &&
      prop !== "constrainProportions"
    ) {
      cloned[prop as keyof T] = node[prop as keyof T];
    }
  }

  // Set parent explicitly in addition to using assignParent
  assignParent(parent, cloned);
  //   if (parent) {
  //     (cloned as any).parent = parent;
  //   }

  const altNode = {
    ...cloned,
    parent: cloned.parent,
    originalNode: node,
    canBeFlattened: canBeFlattened(node),
  } as AltNode<T>;

  if (globalTextStyleSegments[node.id]) {
    altNode.styledTextSegments = globalTextStyleSegments[node.id];
  }

  console.log("altnode:", altNode.parent, cloned.parent);

  return altNode;
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
