import { AltNode } from "../../alt_api_types";
import { numberToFixedString } from "../../common/numToAutoFixed";

/**
 * Handles opacity transformations for Jetpack Compose
 * Maps to Modifier.alpha() in Compose
 */
export const composeOpacity = (
  node: MinimalBlendMixin,
  child: string,
): string => {
  if (node.opacity !== undefined && node.opacity !== 1 && child !== "") {
    const opacity = numberToFixedString(node.opacity);
    return `Box(
    modifier = Modifier.alpha(${opacity}f)
) {
    ${child}
}`;
  }
  return child;
};

/**
 * Handles visibility transformations for Jetpack Compose
 * Uses conditional rendering or alpha(0f) based on visibility
 */
export const composeVisibility = (node: SceneNode, child: string): string => {
  // [when testing] node.visible can be undefined
  if (node.visible !== undefined && !node.visible && child !== "") {
    // In Compose, we can either use conditional rendering or set alpha to 0
    // Using alpha(0f) to maintain layout space (similar to visibility: hidden in CSS)
    return `Box(
    modifier = Modifier.alpha(0f)
) {
    ${child}
}`;
  }
  return child;
};

/**
 * Handles rotation transformations for Jetpack Compose
 * Maps to Modifier.rotate() in Compose
 * Converts angles from degrees to the format expected by Compose
 */
export const composeRotation = (node: AltNode, child: string): string => {
  if (
    node.rotation !== undefined &&
    child !== "" &&
    Math.round(node.rotation) !== 0
  ) {
    const totalRotation = (node.rotation || 0) + (node.cumulativeRotation || 0);
    
    if (Math.round(totalRotation) === 0) {
      return child;
    }

    const rotationDegrees = numberToFixedString(totalRotation);
    return `Box(
    modifier = Modifier.rotate(${rotationDegrees}f)
) {
    ${child}
}`;
  }
  return child;
};

/**
 * Combines multiple blend transformations into a single modifier chain
 * This is more efficient than nesting multiple Box composables
 */
export const composeBlendModifiers = (node: AltNode, child: string): string => {
  const modifiers: string[] = [];
  
  // Add opacity modifier
  if (node.opacity !== undefined && node.opacity !== 1) {
    const opacity = numberToFixedString(node.opacity);
    modifiers.push(`alpha(${opacity}f)`);
  }
  
  // Add visibility modifier (using alpha for invisible elements)
  if (node.visible !== undefined && !node.visible) {
    modifiers.push(`alpha(0f)`);
  }
  
  // Add rotation modifier
  const totalRotation = (node.rotation || 0) + (node.cumulativeRotation || 0);
  if (Math.round(totalRotation) !== 0) {
    const rotationDegrees = numberToFixedString(totalRotation);
    modifiers.push(`rotate(${rotationDegrees}f)`);
  }
  
  // If we have modifiers, wrap in Box with combined modifier chain
  if (modifiers.length > 0 && child !== "") {
    const modifierChain = `Modifier.${modifiers.join(".")}`;
    return `Box(
    modifier = ${modifierChain}
) {
    ${child}
}`;
  }
  
  return child;
};