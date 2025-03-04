import { ParentNode } from "types";
import {
  isNotEmpty,
  assignRectangleType,
  assignChildren,
  isTypeOrGroupOfTypes,
} from "./altNodeUtils";

// List of types that can be flattened into SVG
const canBeFlattened = isTypeOrGroupOfTypes([
  "VECTOR",
  "STAR",
  "POLYGON",
  "BOOLEAN_OPERATION",
]);

export const convertNodeToAltNode =
  (parent: ParentNode | null) =>
  async (node: SceneNode): Promise<SceneNode | null> => {
    console.log("node is", node);
    (node as any).canBeFlattened = canBeFlattened(node);
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
        return node;

      // Group nodes
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        // if the frame, instance etc. has no children, convert the frame to rectangle
        if (node.children.length === 0) return cloneAsRectangleNode(node);
      case "GROUP":
        // if a Group is visible and has only one child, the Group should be ungrouped.
        if (type === "GROUP" && node.children.length === 1 && node.visible)
          return convertNodeToAltNode(parent)(node.children[0]);
      case "SECTION":
        const groupChildren = await convertNodesToAltNodes(node.children, node);
        return assignChildren(groupChildren, node);
      // Text Nodes
      case "TEXT":
        return node;
      // Unsupported Nodes
      case "SLICE":
        return null;
      default:
        throw new Error(
          `Sorry, an unsupported node type was selected. Type:${node.type} id:${node.id}`,
        );
    }
  };

export const convertNodesToAltNodes = async (
  sceneNode: ReadonlyArray<SceneNode>,
  parent: ParentNode | null,
): Promise<Array<SceneNode>> =>
  (await Promise.all(sceneNode.map(convertNodeToAltNode(parent)))).filter(
    isNotEmpty,
  );

// auto convert Frame to Rectangle when Frame has no Children
const cloneAsRectangleNode = <T extends BaseNode>(node: T): RectangleNode => {
  assignRectangleType(node);

  return node as unknown as RectangleNode;
};
