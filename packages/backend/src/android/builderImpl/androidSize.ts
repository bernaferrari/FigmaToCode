import { nodeSize } from "../../common/nodeWidthHeight";
import { sliceNum } from "../../common/numToAutoFixed";

export const androidSize = (
  node: SceneNode,
  optimizeLayout: boolean
): { width: string; height: string; weight: boolean } => {
  const size = nodeSize(node, optimizeLayout);
  let propWeight = false

  const childHasHorizontalWeight = "children" in node 
  && node.children.filter(child =>
     "layoutSizingHorizontal" in child 
     && child.layoutSizingHorizontal 
     === "FILL").length !== 0

  const childHasVerticallWeight = "children" in node 
  && node.children.filter(child =>
    "layoutSizingVertical" in child 
    && child.layoutSizingVertical 
    === "FILL").length !== 0

  let propWidth = "";
  if("layoutSizingHorizontal" in node && node.layoutSizingHorizontal === "FILL") {
    propWeight = true;
    propWidth = 'match_parent';
  } else if (childHasHorizontalWeight) {
    propWidth = `${node.width}dp`;
  } else if (!size.width || ("layoutSizingHorizontal" in node && node.layoutSizingHorizontal === "HUG")) {
    propWidth = 'wrap_content';
  } else if (size.width === "fill") {
    propWidth = 'match_parent';
  } else {
    propWidth = `${size.width}dp`;
  }

  let propHeight = "";
  if ("layoutSizingVertical" in node && node.layoutSizingVertical === "FILL") {
    propWeight = true
    propHeight = 'match_parent';
  } else if (childHasVerticallWeight) {
    propWidth = `${node.width}dp`;
  } else if (!size.height || ("layoutSizingVertical" in node && node.layoutSizingVertical === "HUG")) {
    propHeight = 'wrap_content';
  } else if (size.height === "fill") {
    propHeight = 'match_parent';
  } else {
    propHeight = `${size.height}dp`;
  }

  return { width: propWidth, height: propHeight , weight: propWeight};
};
