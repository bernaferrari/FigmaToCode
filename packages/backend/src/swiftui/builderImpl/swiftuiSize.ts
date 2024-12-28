import { nodeSize } from "../../common/nodeWidthHeight";
import { sliceNum } from "../../common/numToAutoFixed";

export const swiftuiSize = (
  node: SceneNode,
  optimizeLayout: boolean = false,
): { width: string; height: string } => {
  const size = nodeSize(node, optimizeLayout);

  // if width is set as maxWidth, height must also be set as maxHeight (not height)
  const shouldExtend = size.height === "fill" || size.width === "fill";

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    const w = sliceNum(size.width);

    if (shouldExtend) {
      propWidth = `minWidth: ${w}, maxWidth: ${w}`;
    } else {
      propWidth = `width: ${w}`;
    }
  } else if (size.width === "fill") {
    propWidth = `maxWidth: .infinity`;
  }

  let propHeight = "";
  if (typeof size.height === "number") {
    const h = sliceNum(size.height);

    if (shouldExtend) {
      propHeight = `minHeight: ${h}, maxHeight: ${h}`;
    } else {
      propHeight = `height: ${h}`;
    }
  } else if (size.height === "fill") {
    propHeight = `maxHeight: .infinity`;
  }

  return { width: propWidth, height: propHeight };
};
