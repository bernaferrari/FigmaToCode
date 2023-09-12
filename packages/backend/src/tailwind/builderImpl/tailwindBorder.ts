import { getCommonRadius } from "../../common/commonRadius";
import { commonStroke } from "../../common/commonStroke";
import { sliceNum } from "../../common/numToAutoFixed";
import { nearestValue, pxToBorderRadius } from "../conversionTables";

/**
 * https://tailwindcss.com/docs/border-width/
 * example: border-2
 */
export const tailwindBorderWidth = (node: SceneNode): string => {
  const commonBorder = commonStroke(node);
  if (!commonBorder) {
    return "";
  }

  const getBorder = (weight: number, kind: string) => {
    const allowedValues = [1, 2, 4, 8];
    console.log("weight", weight);
    const nearest = nearestValue(weight, allowedValues);
    console.log("nearest", nearest);

    if (nearest === 1) {
      // special case
      return `border${kind}`;
    } else {
      return `border${kind}-${nearest}`;
    }
  };

  if ("all" in commonBorder) {
    if (commonBorder.all === 0) {
      return "";
    }
    return getBorder(commonBorder.all, "");
  }

  const comp = [];
  if (commonBorder.left !== 0) {
    comp.push(getBorder(commonBorder.left, "-l"));
  }
  if (commonBorder.right !== 0) {
    comp.push(getBorder(commonBorder.right, "-r"));
  }
  if (commonBorder.top !== 0) {
    comp.push(getBorder(commonBorder.top, "-t"));
  }
  if (commonBorder.bottom !== 0) {
    comp.push(getBorder(commonBorder.bottom, "-b"));
  }
  return comp.join(" ");
};

/**
 * https://tailwindcss.com/docs/border-radius/
 * example: rounded-sm
 * example: rounded-tr-lg
 */
export const tailwindBorderRadius = (node: SceneNode): string => {
  if (node.type === "ELLIPSE") {
    return "rounded-full";
  }

  const getRadius = (radius: number) => {
    // if (radius > 24) {
    //   // special case. If height is 90 and cornerRadius is 45, it is full.
    //   return `[${sliceNum(radius)}px]`;
    // } else {
    const r = pxToBorderRadius(radius);
    if (r) {
      return `-${r}`;
    }
    return "";
    // }
  };

  const radius = getCommonRadius(node);

  if ("all" in radius) {
    if (radius.all === 0) {
      return "";
    } else if (radius.all > 999 && node.width < 1000 && node.height < 1000) {
      return "rounded-full";
    }

    return `rounded${getRadius(radius.all)}`;
  }

  // todo optimize for tr/tl/br/bl instead of t/r/l/b
  let comp: string[] = [];
  if (radius.topLeft !== 0) {
    comp.push(`rounded-tl${getRadius(radius.topLeft)}`);
  }
  if (radius.topRight !== 0) {
    comp.push(`rounded-tr${getRadius(radius.topRight)}`);
  }
  if (radius.bottomLeft !== 0) {
    comp.push(`rounded-bl${getRadius(radius.bottomLeft)}`);
  }
  if (radius.bottomRight !== 0) {
    comp.push(`rounded-br${getRadius(radius.bottomRight)}`);
  }

  return comp.join(" ");
};
