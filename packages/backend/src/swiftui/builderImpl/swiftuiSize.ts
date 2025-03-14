import { nodeSize } from "../../common/nodeWidthHeight";
import { numberToFixedString } from "../../common/numToAutoFixed";

export const swiftuiSize = (
  node: SceneNode,
): { width: string; height: string; constraints: string[] } => {
  const size = nodeSize(node);

  const constraintProps: string[] = [];
  let width = "";
  let height = "";

  // Handle width and height
  if (typeof size.width === "number") {
    width = `width: ${numberToFixedString(size.width)}`;
  }
  if (typeof size.height === "number") {
    height = `height: ${numberToFixedString(size.height)}`;
  }

  // Handle min/max constraints
  if (node.minWidth !== undefined && node.minWidth !== null) {
    constraintProps.push(`minWidth: ${numberToFixedString(node.minWidth)}`);
  }
  if (node.maxWidth !== undefined && node.maxWidth !== null) {
    constraintProps.push(`maxWidth: ${numberToFixedString(node.maxWidth)}`);
  }
  if (node.minHeight !== undefined && node.minHeight !== null) {
    constraintProps.push(`minHeight: ${numberToFixedString(node.minHeight)}`);
  }
  if (node.maxHeight !== undefined && node.maxHeight !== null) {
    constraintProps.push(`maxHeight: ${numberToFixedString(node.maxHeight)}`);
  }

  return {
    width,
    height,
    constraints: constraintProps,
  };
};
