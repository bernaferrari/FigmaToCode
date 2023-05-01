import { AltSceneNode } from "../altNodes/altMixins";

/**
 * In Figma, Groups have absolute position while Frames have relative.
 * This is a helper to retrieve the node.parent.x without worries.
 * Usually, after this is called, node.x - parentX is done to solve that scenario.
 *
 * Input is expected to be node.parent.
 */
export const parentCoordinates = (node: AltSceneNode): [number, number] => {
  const parentX = "layoutMode" in node ? 0 : node.x;
  const parentY = "layoutMode" in node ? 0 : node.y;

  return [parentX, parentY];
};
