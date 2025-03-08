import { getCommonRadius } from "../../common/commonRadius";
import { commonStroke } from "../../common/commonStroke";
import {
  nearestValue,
  pxToBorderRadius,
  pxToBorderWidth,
  pxToRing,
} from "../conversionTables";
import { numberToFixedString } from "../../common/numToAutoFixed";
import { addWarning } from "../../common/commonConversionWarnings";

const getBorder = (weight: number, kind: string, isRing: boolean = false) => {
  // Use ring utilities for outside strokes
  if (isRing) {
    // Special case: ring (without width) is 3px in Tailwind
    if (weight === 3) {
      return "ring";
    }

    const ringWidth = pxToRing(weight);
    if (ringWidth === null) {
      return `ring-[${numberToFixedString(weight)}px]`;
    } else if (ringWidth === "3") {
      // Ring is 3px
      return `ring`;
    } else {
      return `ring-${ringWidth}`;
    }
  }

  // Special case: border (without width) is 1px in Tailwind
  if (weight === 1) {
    return `border${kind}`;
  }

  // Use border utilities for default and inside strokes
  const borderWidth = pxToBorderWidth(weight);
  if (borderWidth === null) {
    return `border${kind}-[${numberToFixedString(weight)}px]`;
  } else if (borderWidth === "DEFAULT") {
    // Border is 1px
    return `border${kind}`;
  } else {
    return `border${kind}-${borderWidth}`;
  }
};

/**
 * https://tailwindcss.com/docs/border-width/
 * example: border-2
 */
export const tailwindBorderWidth = (
  node: SceneNode,
): {
  isRing: boolean;
  property: string;
} => {
  const commonBorder = commonStroke(node);
  if (!commonBorder) {
    return {
      isRing: false,
      property: "",
    };
  }

  // Check if stroke is outside
  const isRing =
    "strokeAlign" in node &&
    (node.strokeAlign === "OUTSIDE" || node.strokeAlign === "CENTER");

  if ("all" in commonBorder) {
    if (commonBorder.all === 0) {
      return {
        isRing: false,
        property: "",
      };
    }
    return {
      isRing,
      property: getBorder(commonBorder.all, "", isRing),
    };
  } else {
    addWarning(
      'Non-uniform borders are only supported with strokeAlign set to "inside". Will paint inside.',
    );
  }

  // If borders are non-uniform, always use border utilities for better control
  // regardless of whether the stroke is outside or not
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

  return {
    isRing,
    property: comp.join(" "),
  };
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
