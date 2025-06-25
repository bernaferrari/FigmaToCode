import { numberToFixedString } from "../../common/numToAutoFixed";

export const composeSize = (node: SceneNode): string | null => {
  const modifiers: string[] = [];

  if ("width" in node && "height" in node) {
    const width = numberToFixedString(node.width);
    const height = numberToFixedString(node.height);

    // Check for special sizing modes
    if ("layoutSizingHorizontal" in node && node.layoutSizingHorizontal === "FILL") {
      modifiers.push("fillMaxWidth()");
    } else if (width > 0) {
      modifiers.push(`width(${width}.dp)`);
    }

    if ("layoutSizingVertical" in node && node.layoutSizingVertical === "FILL") {
      modifiers.push("fillMaxHeight()");
    } else if (height > 0) {
      modifiers.push(`height(${height}.dp)`);
    }

    // Handle special cases for size constraints
    if ("constraints" in node) {
      const constraints = node.constraints;
      
      if (constraints.horizontal === "STRETCH") {
        modifiers.push("fillMaxWidth()");
      } else if (constraints.horizontal === "SCALE") {
        modifiers.push("wrapContentWidth()");
      }

      if (constraints.vertical === "STRETCH") {
        modifiers.push("fillMaxHeight()");
      } else if (constraints.vertical === "SCALE") {
        modifiers.push("wrapContentHeight()");
      }
    }
  }

  return modifiers.length > 0 ? modifiers.join(".") : null;
};