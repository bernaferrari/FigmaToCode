import { pxToLayoutSize } from "../conversionTables";
import { nodeSize } from "../../common/nodeWidthHeight";
import { numberToFixedString } from "../../common/numToAutoFixed";
import { TailwindSettings } from "types";
import { localTailwindSettings } from "../tailwindMain";

/**
 * Formats a size value into a Tailwind class
 * Uses Tailwind's standard classes if there's a good match, otherwise uses arbitrary values
 */
const formatTailwindSizeValue = (
  size: number,
  prefix: string,
  settings?: TailwindSettings,
): string => {
  const tailwindSize = pxToLayoutSize(size);

  // If we found a matching Tailwind class, use it
  if (!tailwindSize.startsWith("[")) {
    return `${prefix}-${tailwindSize}`;
  }

  // No matching class or rounding disabled, use arbitrary value
  const sizeFixed = numberToFixedString(size);
  if (sizeFixed === "0") {
    return `${prefix}-0`;
  } else {
    return `${prefix}-[${sizeFixed}px]`;
  }
};

export const tailwindSizePartial = (
  node: SceneNode,
  settings?: TailwindSettings,
): { width: string; height: string; constraints: string } => {
  const size = nodeSize(node);
  const nodeParent = node.parent;

  let w = "";
  if (typeof size.width === "number") {
    w = formatTailwindSizeValue(size.width, "w", settings);
  } else if (size.width === "fill") {
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "HORIZONTAL"
    ) {
      w = "flex-1";
    } else {
      if (node.maxWidth) {
        w = "w-full";
      } else {
        w = "self-stretch";
      }
    }
  }

  let h = "";
  if (typeof size.height === "number") {
    h = formatTailwindSizeValue(size.height, "h", settings);
  } else if (size.height === "fill") {
    if (
      nodeParent &&
      "layoutMode" in nodeParent &&
      nodeParent.layoutMode === "VERTICAL"
    ) {
      h = "flex-1";
    } else {
      if (node.maxHeight) {
        h = "h-full";
      } else {
        h = "self-stretch";
      }
    }
  }

  // Handle min/max constraints in tailwind
  const constraints = [];

  if (node.maxWidth !== undefined && node.maxWidth !== null) {
    constraints.push(formatTailwindSizeValue(node.maxWidth, "max-w", settings));
  }

  if (node.minWidth !== undefined && node.minWidth !== null) {
    constraints.push(formatTailwindSizeValue(node.minWidth, "min-w", settings));
  }

  if (node.maxHeight !== undefined && node.maxHeight !== null) {
    constraints.push(
      formatTailwindSizeValue(node.maxHeight, "max-h", settings),
    );
  }

  if (node.minHeight !== undefined && node.minHeight !== null) {
    constraints.push(
      formatTailwindSizeValue(node.minHeight, "min-h", settings),
    );
  }

  // Technically size exists since Tailwind 3.4 (December 2023), but to avoid confusion, restrict to 4,
  if (localTailwindSettings.useTailwind4) {
    const wValue = w.substring(2);
    const hValue = h.substring(2);
    if (wValue === hValue) {
      w = `size-${wValue}`;
      h = "";
    }
  }

  return {
    width: w,
    height: h,
    constraints: constraints.join(" "),
  };
};
