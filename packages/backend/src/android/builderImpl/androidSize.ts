import { nodeSize } from "../../common/nodeWidthHeight";
import { sliceNum } from "../../common/numToAutoFixed";

export const androidSize = (
  node: SceneNode,
  optimizeLayout: boolean
): { width: string; height: string } => {
  const size = nodeSize(node, optimizeLayout);

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (!size.width || ("layoutSizingHorizontal" in node && node.layoutSizingHorizontal === "HUG")) {
    propWidth = 'wrap_content';
  } else if (size.width === "fill" || ("layoutSizingHorizontal" in node && node.layoutSizingHorizontal === "FILL")) {
    propWidth = 'match_parent';
  } else if (typeof size.width === "number") {
    propWidth = `${size.width}dp`;
  }

  let propHeight = "";
  if (!size.height || ("layoutSizingVertical" in node && node.layoutSizingVertical === "HUG")) {
    propHeight = 'wrap_content';
  } else if (size.height === "fill" || ("layoutSizingVertical" in node && node.layoutSizingVertical === "FILL")) {
    propHeight = 'match_parent';
  } else if (typeof size.height === "number") {
    propHeight = `${size.height}dp`;
  }

  return { width: propWidth, height: propHeight };
};
