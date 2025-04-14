// ========================================================================
//          Figma Icon Recognition Algorithm - Simplified v5
// ========================================================================
// This file provides a simplified function to determine if a Figma node
// is likely functioning as an icon based on structure and size.

// --- Constants ---

const ICON_PRIMITIVE_TYPES: ReadonlySet<NodeType> = new Set([
  "ELLIPSE",
  "RECTANGLE",
  "STAR",
  "POLYGON",
  "LINE",
]); // Removed duplicate POLYGON

const ICON_COMPLEX_VECTOR_TYPES: ReadonlySet<NodeType> = new Set([
  "VECTOR",
  "BOOLEAN_OPERATION",
]);

const ICON_CONTAINER_TYPES: ReadonlySet<NodeType> = new Set([
  "FRAME",
  "GROUP",
  "COMPONENT",
  "INSTANCE",
]);

// Types explicitly disallowed as top-level icons or nested within icons (except GROUP)
const DISALLOWED_ICON_TYPES: ReadonlySet<NodeType> = new Set([
  "SLICE",
  "CONNECTOR",
  "STICKY",
  "SHAPE_WITH_TEXT",
  "CODE_BLOCK",
  "WIDGET",
  "TEXT",
  "COMPONENT_SET", // Component sets are containers for components, not icons themselves
]);

// Types disallowed *inside* an icon container (recursive check)
const DISALLOWED_CHILD_TYPES: ReadonlySet<NodeType> = new Set([
  "FRAME", // No nested frames
  "COMPONENT", // No nested components
  "INSTANCE", // No nested instances
  "TEXT", // No text
  "SLICE",
  "CONNECTOR",
  "STICKY",
  "SHAPE_WITH_TEXT",
  "CODE_BLOCK",
  "WIDGET",
  "COMPONENT_SET",
]);

// ========================================================================
//                        Helper Function
// ========================================================================

/**
 * Checks if a node's dimensions fall within a typical size range for icons.
 */
function isTypicalIconSize(
  node: SceneNode,
  minSize = 8,
  maxSize = 64, // Standard max size
  aspectRatioTolerance = 0.5, // Allow slightly non-square icons
): boolean {
  if (
    !("width" in node && "height" in node && node.width > 0 && node.height > 0)
  ) {
    return false; // Needs dimensions
  }
  if (
    node.width < minSize ||
    node.height < minSize ||
    node.width > maxSize ||
    node.height > maxSize
  ) {
    return false; // Outside size limits
  }
  const aspectRatio = node.width / node.height;
  return (
    aspectRatio >= 1 - aspectRatioTolerance &&
    aspectRatio <= 1 + aspectRatioTolerance // Check aspect ratio
  );
}

/**
 * Checks if a node has export settings for SVG.
 */
function hasSvgExportSettings(node: SceneNode): boolean {
  const settingsToCheck: ReadonlyArray<ExportSettings> =
    node.exportSettings || [];
  return settingsToCheck.some((setting) => setting.format === "SVG");
}

/**
 * Recursively checks the children of a container node.
 * Returns an object indicating if disallowed children were found
 * and if any valid icon content (vector/primitive) was found.
 */
function checkChildrenRecursively(children: ReadonlyArray<SceneNode>): {
  hasDisallowedChild: boolean;
  hasValidContent: boolean;
} {
  let hasDisallowedChild = false;
  let hasValidContent = false;

  for (const child of children) {
    if (child.visible === false) {
      continue; // Skip invisible children
    }

    if (DISALLOWED_CHILD_TYPES.has(child.type)) {
      hasDisallowedChild = true;
      break; // Found disallowed type, no need to check further
    }

    if (
      ICON_COMPLEX_VECTOR_TYPES.has(child.type) ||
      ICON_PRIMITIVE_TYPES.has(child.type)
    ) {
      hasValidContent = true;
    } else if (child.type === "GROUP" && "children" in child) {
      // Recursively check children of groups
      const groupResult = checkChildrenRecursively(child.children);
      if (groupResult.hasDisallowedChild) {
        hasDisallowedChild = true;
        break; // Disallowed child found in nested group
      }
      if (groupResult.hasValidContent) {
        hasValidContent = true; // Valid content found in nested group
      }
    }
    // Ignore other node types if they are not explicitly disallowed (e.g., SECTION?)
  }

  return { hasDisallowedChild, hasValidContent };
}

// ========================================================================
//                  Main Icon Recognition Function
// ========================================================================

/**
 * Analyzes a Figma SceneNode using simplified structural rules to determine if it's likely an icon.
 * v5.1: Added rule to always consider nodes with SVG export settings as icons.
 *
 * @param node The Figma SceneNode to evaluate.
 * @param logDetails Set to true to print debug information to the console.
 * @returns True if the node is likely an icon, false otherwise.
 */
export function isLikelyIcon(node: SceneNode, logDetails = false): boolean {
  const info: string[] = [`Node: ${node.name} (${node.type}, ID: ${node.id})`];
  let result = false;
  let reason = "";

  // --- 1. Check for SVG Export Settings ---
  if (hasSvgExportSettings(node)) {
    reason = "Has SVG export settings";
    result = true;
  }
  // --- 2. Initial Filtering ---
  else if (node.visible === false) {
    reason = "Invisible";
    result = false;
  } else if (DISALLOWED_ICON_TYPES.has(node.type)) {
    reason = `Disallowed Type: ${node.type}`;
    result = false;
  } else if (
    !("width" in node && "height" in node && node.width > 0 && node.height > 0)
  ) {
    reason = "No dimensions";
    result = false;
  } else {
    // --- 3. Direct Vector/Boolean/Primitive ---
    if (
      ICON_COMPLEX_VECTOR_TYPES.has(node.type) ||
      ICON_PRIMITIVE_TYPES.has(node.type)
    ) {
      if (isTypicalIconSize(node)) {
        reason = `Direct ${node.type} with typical size`;
        result = true;
      } else {
        reason = `Direct ${node.type} but wrong size (${Math.round(node.width)}x${Math.round(node.height)})`;
        result = false;
      }
    }
    // --- 4. Container Logic ---
    else if (ICON_CONTAINER_TYPES.has(node.type) && "children" in node) {
      if (!isTypicalIconSize(node)) {
        reason = `Container but wrong size (${Math.round(node.width)}x${Math.round(node.height)})`;
        result = false;
      } else {
        const visibleChildren = node.children.filter(
          (child) => child.visible !== false,
        );

        if (visibleChildren.length === 0) {
          // Check for styling on empty containers
          const hasVisibleFill =
            "fills" in node &&
            Array.isArray(node.fills) &&
            node.fills.some(
              (f) =>
                typeof f === "object" &&
                f !== null &&
                f.visible !== false &&
                ("opacity" in f ? (f.opacity ?? 1) : 1) > 0,
            );
          const hasVisibleStroke =
            "strokes" in node &&
            Array.isArray(node.strokes) &&
            node.strokes.some((s) => s.visible !== false);

          if (hasVisibleFill || hasVisibleStroke) {
            reason = "Empty container with visible fill/stroke";
            result = true;
          } else {
            reason = "Empty container with no visible style";
            result = false;
          }
        } else {
          // Check content of non-empty containers
          const checkResult = checkChildrenRecursively(visibleChildren);

          if (checkResult.hasDisallowedChild) {
            reason =
              "Container has disallowed child type (Text, Frame, Component, Instance, etc.)";
            result = false;
          } else if (!checkResult.hasValidContent) {
            reason = "Container has no vector or primitive content";
            result = false;
          } else {
            reason = "Container with valid children and typical size";
            result = true; // Passed size, no disallowed children, has valid content
          }
        }
      }
    }
    // --- 5. Default ---
    else {
      reason =
        "Not a recognized icon structure (Vector, Primitive, or valid Container)";
      result = false;
    }
  }

  info.push(`Result: ${result ? "YES" : "NO"} (${reason})`);
  if (logDetails) console.log(info.join(" | "));
  return result;
}
