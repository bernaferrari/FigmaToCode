import { AltNode } from "types";
import { curry } from "../common/curry";
import { exportAsyncProxy } from "../common/exportAsyncProxy";
import { addWarning } from "../common/commonConversionWarnings";

export const overrideReadonlyProperty = curry(
  <T, K extends keyof T>(prop: K, value: any, obj: T): T =>
    Object.defineProperty(obj, prop, {
      value: value,
      writable: true,
      configurable: true,
    }),
);

export const assignParent = overrideReadonlyProperty("parent");
export const assignChildren = overrideReadonlyProperty("children");
export const assignType = overrideReadonlyProperty("type");
export const assignRectangleType = assignType("RECTANGLE");

export function isNotEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export const isTypeOrGroupOfTypes = curry(
  (matchTypes: NodeType[], node: SceneNode): boolean => {
    // Check if the current node's type is in the matchTypes array
    if (matchTypes.includes(node.type)) return true;

    // Only check children if this is a container type node that can have children
    if ("children" in node) {
      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i];
        const result = isTypeOrGroupOfTypes(matchTypes, childNode);
        if (!result) {
          // If any child is not of the specified types, return false
          return false;
        }
      }
      // All children are valid types
      return node.children.length > 0; // Only return true if there are children
    }

    // Not a container node and not a matching type
    return false;
  },
);

export const isSVGNode = (node: SceneNode) => {
  const altNode = node as AltNode<typeof node>;
  return altNode.canBeFlattened;
};

export const renderAndAttachSVG = async (node: any) => {
  // const nodeName = `${node.type}:${node.id}`;
  // console.log(altNode);
  if (node.canBeFlattened) {
    console.log("altNode is", node);

    if (node.svg) {
      // console.log(`SVG already rendered for ${nodeName}`);
      return node;
    }

    try {
      // console.log(`${nodeName} can be flattened!`);
      const svg = (await exportAsyncProxy<string>(node, {
        format: "SVG_STRING",
      })) as string;
      node.svg = svg;
    } catch (error) {
      addWarning(`Failed rendering SVG for ${node.name}`);
      console.error(`Error rendering SVG for ${node.type}:${node.id}`);
      console.error(error);
    }
  }
  return node;
};
