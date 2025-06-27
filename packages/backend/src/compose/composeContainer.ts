import { retrieveTopFill } from "../common/retrieveFill";
import { getCommonRadius } from "../common/commonRadius";
import { composeSize } from "./builderImpl/composeSize";
import { composeBorder } from "./builderImpl/composeBorder";
import { composeColor } from "./builderImpl/composeColor";
import { composeShadow } from "./builderImpl/composeShadow";
import { composePadding } from "./builderImpl/composePadding";

export const composeContainer = (
  node: SceneNode & MinimalBlendMixin,
  child: string,
): string => {
  // Safety check for node dimensions
  if ("width" in node && "height" in node) {
    if ((node.width <= 0 || node.height <= 0) && !child) {
      return "// Invalid node dimensions";
    }
  }

  const modifiers: string[] = [];
  let containerType = "Box";

  // Determine if we need a specific container type
  if ("fills" in node) {
    const topFill = retrieveTopFill(node.fills);
    if (topFill) {
      // Background color or gradient
      const backgroundModifier = composeColor(topFill);
      if (backgroundModifier) {
        modifiers.push(backgroundModifier);
      }
    }
  }

  // Size modifiers
  const sizeModifier = composeSize(node);
  if (sizeModifier) {
    modifiers.push(sizeModifier);
  }

  // Border radius
  let shape = null;
  if ("cornerRadius" in node || "topLeftRadius" in node) {
    const radius = getCommonRadius(node);
    if ("all" in radius && radius.all > 0) {
      shape = `RoundedCornerShape(${radius.all}.dp)`;
      modifiers.push(`clip(${shape})`);
    } else if ("topLeft" in radius) {
      shape = `RoundedCornerShape(
        topStart = ${radius.topLeft}.dp,
        topEnd = ${radius.topRight}.dp,
        bottomEnd = ${radius.bottomRight}.dp,
        bottomStart = ${radius.bottomLeft}.dp
    )`;
      modifiers.push(`clip(${shape})`);
    }
  }

  // Border
  if ("strokes" in node && node.strokes.length > 0) {
    const borderModifier = composeBorder(node, shape);
    if (borderModifier) {
      modifiers.push(borderModifier);
    }
  }

  // Shadow/elevation
  if ("effects" in node && node.effects.length > 0) {
    const shadowModifier = composeShadow(node.effects);
    if (shadowModifier) {
      modifiers.push(shadowModifier);
    }
  }

  // Padding (if this is a container with children)
  if ("paddingLeft" in node) {
    const paddingModifier = composePadding(node);
    if (paddingModifier) {
      modifiers.push(paddingModifier);
    }
  }

  // Build modifier chain
  const modifierChain = modifiers.length > 0 
    ? `modifier = Modifier${modifiers.map(m => `.${m}`).join("")}`
    : "";

  // Generate container
  if (child) {
    if (modifierChain) {
      return `${containerType}(
    ${modifierChain}
) {
    ${child}
}`;
    } else {
      return `${containerType} {
    ${child}
}`;
    }
  } else {
    // Empty container
    if (modifierChain) {
      return `Spacer(${modifierChain})`;
    } else {
      return `Spacer(modifier = Modifier.size(0.dp))`;
    }
  }
};