import { AltNode } from "types";
import { curry } from "../common/curry";

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

export const renderNodeAsSVG = async (node: SceneNode) =>
  await node.exportAsync({ format: "SVG_STRING" });

export const renderAndAttachSVG = async (node: SceneNode) => {
  const altNode = node as AltNode<typeof node>;
  // const nodeName = `${node.type}:${node.id}`;
  // console.log(altNode);
  if (altNode.canBeFlattened) {
    if (altNode.svg) {
      // console.log(`SVG already rendered for ${nodeName}`);
      return altNode;
    }
    // console.log(`${nodeName} can be flattened!`);
    const svg = await renderNodeAsSVG(altNode.originalNode);
    // console.log(`${svg}`);
    altNode.svg = svg;
  }
  return altNode;
};
