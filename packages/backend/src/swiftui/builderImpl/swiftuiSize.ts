import { nodeSize } from "../../common/nodeWidthHeight";
import { sliceNum } from "../../common/numToAutoFixed";

export const swiftuiSize = (node: SceneNode): [string, string] => {
  const size = nodeSize(node);

  // if width is set as maxWidth, height must also be set as maxHeight (not height)
  const shouldExtend = size.height === "fill" || size.width === "fill";

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    const w = sliceNum(size.width);

    if (shouldExtend) {
      propWidth = `maxWidth: ${w}`;
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
      propHeight = `maxHeight: ${h}`;
    } else {
      propHeight = `height: ${h}`;
    }
  } else if (size.height === "fill") {
    propHeight = `maxHeight: .infinity`;
  }

  return [propWidth, propHeight];
};
