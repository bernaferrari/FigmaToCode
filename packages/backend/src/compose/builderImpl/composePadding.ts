import { numberToFixedString } from "../../common/numToAutoFixed";
import { commonPadding } from "../../common/commonPadding";

/**
 * Generates Jetpack Compose padding modifiers based on node padding properties.
 * 
 * Returns appropriate padding modifiers:
 * - padding(all = X.dp) for uniform padding
 * - padding(horizontal = X.dp, vertical = Y.dp) for symmetric padding  
 * - padding(start = X.dp, end = Y.dp, top = Z.dp, bottom = W.dp) for individual padding
 */
export const composePadding = (node: InferredAutoLayoutResult): string => {
  if (!("layoutMode" in node)) {
    return "";
  }

  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }

  if ("all" in padding) {
    if (padding.all === 0) {
      return "";
    }
    return `padding(${numberToFixedString(padding.all)}.dp)`;
  }

  if ("horizontal" in padding) {
    const modifiers: string[] = [];
    
    if (padding.horizontal !== 0) {
      modifiers.push(`horizontal = ${numberToFixedString(padding.horizontal)}.dp`);
    }
    
    if (padding.vertical !== 0) {
      modifiers.push(`vertical = ${numberToFixedString(padding.vertical)}.dp`);
    }

    if (modifiers.length === 0) {
      return "";
    }

    return `padding(${modifiers.join(", ")})`;
  }

  // Individual padding values
  const modifiers: string[] = [];
  
  if (padding.left !== 0) {
    modifiers.push(`start = ${numberToFixedString(padding.left)}.dp`);
  }
  
  if (padding.right !== 0) {
    modifiers.push(`end = ${numberToFixedString(padding.right)}.dp`);
  }
  
  if (padding.top !== 0) {
    modifiers.push(`top = ${numberToFixedString(padding.top)}.dp`);
  }
  
  if (padding.bottom !== 0) {
    modifiers.push(`bottom = ${numberToFixedString(padding.bottom)}.dp`);
  }

  if (modifiers.length === 0) {
    return "";
  }

  return `padding(${modifiers.join(", ")})`;
};