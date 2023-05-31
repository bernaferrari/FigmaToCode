import { nodeSize } from "../../common/nodeWidthHeight";
import { sliceNum } from "../../common/numToAutoFixed";

export const swiftuiSize = (node: SceneNode): [string, string] => {
  const size = nodeSize(node, false);

  // if width is set as maxWidth, height must also be set as maxHeight (not height)
  const shouldExtend = size.height === "full" || size.width === "full";

  // this cast will always be true, since nodeWidthHeight was called with false to relative.
  let propWidth = "";
  if (typeof size.width === "number") {
    const w = sliceNum(size.width);

    if (shouldExtend) {
      propWidth = `maxWidth: ${w}`;
    } else {
      propWidth = `width: ${w}`;
    }
  } else if (size.width === "full") {
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
  } else if (size.height === "full") {
    propHeight = `maxHeight: .infinity`;
  }

  return [propWidth, propHeight];
};
