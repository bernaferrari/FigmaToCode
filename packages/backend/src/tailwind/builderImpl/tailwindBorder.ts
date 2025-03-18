import { getCommonRadius } from "../../common/commonRadius";
import { commonStroke } from "../../common/commonStroke";
import {
  pxToBorderRadius,
  pxToBorderWidth,
  pxToOutline,
} from "../conversionTables";
import { numberToFixedString } from "../../common/numToAutoFixed";
import { addWarning } from "../../common/commonConversionWarnings";

const getBorder = (
  weight: number,
  kind: string,
  useOutline: boolean = false,
  isBoxShadow: boolean = false,
): string => {
  // For box-shadow (inside stroke on non-autolayout), return empty string as we'll handle separately
  if (isBoxShadow) {
    return "";
  }

  // Use outline utilities for outside/center strokes
  if (useOutline) {
    const outlineWidth = pxToOutline(weight);
    if (outlineWidth === null) {
      return `outline outline-[${numberToFixedString(weight)}px]`;
    } else {
      return `outline outline-${outlineWidth}`;
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
  isOutline: boolean;
  property: string;
  shadowProperty?: string; // This can be removed if not used elsewhere
} => {
  const commonBorder = commonStroke(node);
  if (!commonBorder) {
    return {
      isOutline: false,
      property: "",
    };
  }

  // Check stroke alignment and layout mode
  const strokeAlign = "strokeAlign" in node ? node.strokeAlign : "INSIDE";

  if ("all" in commonBorder) {
    if (commonBorder.all === 0) {
      return {
        isOutline: false,
        property: "",
      };
    }

    const weight = commonBorder.all;

    if (
      strokeAlign === "CENTER" ||
      strokeAlign === "OUTSIDE" ||
      node.type === "FRAME" ||
      node.type === "INSTANCE" ||
      node.type === "COMPONENT"
    ) {
      // For CENTER, OUTSIDE, or INSIDE+Frame, use outline
      const property = getBorder(weight, "", true);
      let offsetProperty = "";

      if (strokeAlign === "CENTER") {
        offsetProperty = `outline-offset-[-${numberToFixedString(weight / 2)}px]`;
      } else if (strokeAlign === "INSIDE") {
        offsetProperty = `outline-offset-[-${numberToFixedString(weight)}px]`;
      }

      return {
        isOutline: true,
        property: offsetProperty ? `${property} ${offsetProperty}` : property,
      };
    } else {
      // Default case: use normal border (for INSIDE + AUTO_LAYOUT)
      return {
        isOutline: false,
        property: getBorder(weight, "", false),
      };
    }
  } else {
    // For non-uniform borders, we only support border (not outline)
    addWarning(
      'Non-uniform borders are only supported with strokeAlign set to "inside". Will paint inside.',
    );
  }

  // Handle non-uniform borders with individual border properties
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
    isOutline: false,
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

  // todo optimize for t/r/l/b instead of tr/tl/br/bl
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
