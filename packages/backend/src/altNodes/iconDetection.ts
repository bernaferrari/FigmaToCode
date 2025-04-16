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

// Types that are considered icons regardless of size if they are top-level
const ICON_TYPES_IGNORE_SIZE: ReadonlySet<NodeType> = new Set([
  "VECTOR",
  "BOOLEAN_OPERATION",
  "POLYGON",
  "STAR",
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
 * Checks if a node's dimensions fall within a typical *maximum* size for icons.
 * Simplified to only check max size.
 */
function isTypicalIconSize(
  node: SceneNode,
  maxSize = 64, // Standard max size
): boolean {
  if (
    !("width" in node && "height" in node && node.width > 0 && node.height > 0)
  ) {
    return false; // Needs dimensions
  }
  // Only check if dimensions exceed the maximum allowed size
  return node.width <= maxSize && node.height <= maxSize;
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
 * v5.2: Always consider VECTOR nodes as icons, regardless of size.
 * v5.3: Always consider VECTOR, BOOLEAN_OPERATION, POLYGON, STAR as icons regardless of size. Simplified size check to max dimension only.
 * v5.4: Check for disallowed types *before* checking SVG export settings.
 *
 * @param node The Figma SceneNode to evaluate.
 * @param logDetails Set to true to print debug information to the console.
 * @returns True if the node is likely an icon, false otherwise.
 */
export function isLikelyIcon(node: SceneNode, logDetails = false): boolean {
  const info: string[] = [`Node: ${node.name} (${node.type}, ID: ${node.id})`];
  let result = false;
  let reason = "";

  // --- 1. Initial Filtering (Disallowed Types First) ---
  if (DISALLOWED_ICON_TYPES.has(node.type)) {
    reason = `Disallowed Type: ${node.type}`;
    result = false;
  }
  // --- 2. Check for SVG Export Settings (Only if not disallowed) ---
  else if (hasSvgExportSettings(node)) {
    reason = "Has SVG export settings";
    result = true;
  }
  // --- 3. Dimension Check ---
  else if (
    !("width" in node && "height" in node && node.width > 0 && node.height > 0)
  ) {
    // Exception: Allow specific types even without dimensions initially.
    if (ICON_TYPES_IGNORE_SIZE.has(node.type)) {
      reason = `Direct ${node.type} type (no dimensions check needed)`;
      result = true;
    } else {
      reason = "No dimensions";
      result = false;
    }
  } else {
    // --- 4. Direct Vector/Boolean/Primitive ---
    // Special case: VECTOR, BOOLEAN_OPERATION, POLYGON, STAR are always icons
    if (ICON_TYPES_IGNORE_SIZE.has(node.type)) {
      reason = `Direct ${node.type} type (size ignored)`;
      result = true;
    }
    // Check other primitives (ELLIPSE, RECTANGLE, LINE) with size constraint
    else if (ICON_PRIMITIVE_TYPES.has(node.type)) {
      if (isTypicalIconSize(node)) {
        reason = `Direct ${node.type} with typical size`;
        result = true;
      } else {
        reason = `Direct ${node.type} but too large (${Math.round(node.width)}x${Math.round(node.height)})`;
        result = false;
      }
    }
    // --- 5. Container Logic ---
    else if (ICON_CONTAINER_TYPES.has(node.type) && "children" in node) {
      // Container size check still uses the simplified isTypicalIconSize
      if (!isTypicalIconSize(node)) {
        reason = `Container but too large (${Math.round(node.width)}x${Math.round(node.height)})`;
        result = false;
      } else {
        const visibleChildren = node.children.filter(
          (child) => child.visible !== false,
        );

        if (visibleChildren.length === 0) {
          // Check for styling on empty containers (size already checked)
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
            reason =
              "Empty container with visible fill/stroke and typical size";
            result = true;
          } else {
            reason = "Empty container with no visible style";
            result = false; // Size is okay, but no content or style
          }
        } else {
          // Check content of non-empty containers (size already checked)
          const checkResult = checkChildrenRecursively(visibleChildren);

          if (checkResult.hasDisallowedChild) {
            reason =
              "Container has disallowed child type (Text, Frame, Component, Instance, etc.)";
            result = false;
          } else if (!checkResult.hasValidContent) {
            // Allow containers if they *only* contain other groups,
            // as long as those groups eventually contain valid content.
            // The checkResult.hasValidContent handles this.
            reason = "Container has no vector or primitive content";
            result = false;
          } else {
            reason = "Container with valid children and typical size";
            result = true; // Passed size, no disallowed children, has valid content
          }
        }
      }
    }
    // --- 6. Default ---
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
