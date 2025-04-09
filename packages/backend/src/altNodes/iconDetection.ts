// ========================================================================
//          Figma Icon Recognition Algorithm (Plugin API) - v3
// ========================================================================
// This file provides functions to heuristically determine if a Figma node
// is likely functioning as an icon. Refined to better handle simple shapes.

// --- Constants ---

const ICON_PRIMITIVE_TYPES: ReadonlySet<NodeType> = new Set([
  "ELLIPSE",
  "RECTANGLE",
  "STAR",
  "POLYGON",
  "LINE",
  "POLYGON",
]);

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

const DISALLOWED_ICON_TYPES: ReadonlySet<NodeType> = new Set([
  "SLICE",
  "CONNECTOR",
  "STICKY",
  "SHAPE_WITH_TEXT",
  "CODE_BLOCK",
  "WIDGET",
  // 'TEXT' is handled specifically
]);

// ========================================================================
//                        Helper Functions
// ========================================================================

// --- nameSuggestsIcon, isTypicalIconSize, hasIconExportSettings remain the same ---
// (Assuming they are defined as in the previous version)

/**
 * Checks if a node's name suggests it's an icon based on common naming conventions.
 * (Implementation from previous version)
 */
function nameSuggestsIcon(name: string): boolean {
  if (!name || typeof name !== "string" || name.trim() === "") return false;
  const lowerName = name.toLowerCase();
  const prefixPattern =
    /^(icon[\/\-_]|ic[\/\-_]|icn[\/\-_]|ico[\/\-_]|glyph[\/\-_])/;
  if (prefixPattern.test(lowerName)) return true;
  const suffixPattern = /[\/\-_]icon$/;
  if (suffixPattern.test(lowerName)) return true;
  const containsWordPattern = /([\/\-_]|^)(ic(on)?|glyph)([\/\-_]|$)/;
  if (containsWordPattern.test(lowerName)) return true;
  const variantSizePattern = /(\/|size=|[\/\-_])(xs|sm|md|lg|xl|\d{1,3})(px)?$/;
  if (variantSizePattern.test(lowerName)) {
    if (
      containsWordPattern.test(lowerName) ||
      prefixPattern.test(lowerName) ||
      lowerName.includes("/")
    )
      return true;
  }
  const leadingSizePattern = /^\d{1,3}(px)?\//;
  if (leadingSizePattern.test(lowerName)) return true;
  return false;
}

/**
 * Checks if a node's dimensions fall within a typical size range for icons.
 * (Implementation from previous version)
 */
function isTypicalIconSize(
  node: SceneNode,
  minSize = 8,
  maxSize = 64, // Keep slightly larger max size
  aspectRatioTolerance = 0.5,
): boolean {
  if (
    !("width" in node && "height" in node && node.width > 0 && node.height > 0)
  )
    return false;
  if (
    node.width < minSize ||
    node.height < minSize ||
    node.width > maxSize ||
    node.height > maxSize
  )
    return false;
  const aspectRatio = node.width / node.height;
  return (
    aspectRatio >= 1 - aspectRatioTolerance &&
    aspectRatio <= 1 + aspectRatioTolerance
  );
}

/**
 * Checks if a node (or its main component) has icon-like export settings.
 * (Implementation from previous version, ensuring suffix check handles potential null/undefined)
 */
function hasIconExportSettings(node: SceneNode): boolean {
  let settingsToCheck: ReadonlyArray<ExportSettings> =
    node.exportSettings || [];
  if (
    node.type === "INSTANCE" &&
    node.mainComponent &&
    settingsToCheck.length === 0
  ) {
    settingsToCheck = node.mainComponent.exportSettings || [];
  }
  if (settingsToCheck.length > 0) {
    return settingsToCheck.some(
      (setting) =>
        setting.format === "SVG" ||
        (setting.format === "PNG" &&
          (setting.suffix === "" || /\@[1-4]x$/.test(setting.suffix || ""))) || // Added || '' for safety
        (setting.format === "JPG" &&
          (setting.suffix === "" || /\@[1-4]x$/.test(setting.suffix || ""))), // Added || '' for safety
    );
  }
  return false;
}

/**
 * Recursively checks if a node's visible content consists primarily of allowed vector shapes.
 * This version differentiates return value slightly based on *how* it's vector-like.
 * Returns:
 *  - 'complex' if it's VECTOR, BOOLEAN_OPERATION, or container with vector children.
 *  - 'primitive' if it's just a single primitive shape (RECTANGLE, ELLIPSE, etc.).
 *  - 'none' if it contains disallowed types or is invisible/empty inappropriately.
 */
function checkVectorContentNature(
  node: SceneNode,
): "complex" | "primitive" | "none" {
  // Direct complex vector types
  if (ICON_COMPLEX_VECTOR_TYPES.has(node.type)) {
    return "complex";
  }

  // Direct primitive vector types
  if (ICON_PRIMITIVE_TYPES.has(node.type)) {
    return "primitive";
  }

  // Disallowed types immediately disqualify
  if (DISALLOWED_ICON_TYPES.has(node.type) || node.type === "TEXT") {
    return "none";
  }

  // Allowed containers: check their children recursively
  if (ICON_CONTAINER_TYPES.has(node.type) && "children" in node) {
    const visibleChildren = node.children.filter((child) => child.visible);

    if (visibleChildren.length > 0) {
      let containsComplex = false;
      for (const child of visibleChildren) {
        const childNature = checkVectorContentNature(child);
        if (childNature === "none") {
          return "none"; // Any disallowed child disqualifies the container
        }
        if (childNature === "complex") {
          containsComplex = true;
        }
      }
      // If all children passed, return 'complex' if at least one child was complex,
      // otherwise return 'primitive' (container only holds primitives).
      return containsComplex ? "complex" : "primitive";
    } else {
      // Empty container: Allow if it has visual style OR if it's C/I
      const hasVisibleFill =
        "fills" in node &&
        Array.isArray(node.fills) &&
        node.fills.some(
          (f) => f.visible !== false && f.opacity && f.opacity > 0,
        );
      const hasVisibleStroke =
        "strokes" in node &&
        Array.isArray(node.strokes) &&
        node.strokes.some((s) => s.visible !== false);
      if (
        hasVisibleFill ||
        hasVisibleStroke ||
        node.type === "COMPONENT" ||
        node.type === "INSTANCE"
      ) {
        return "primitive"; // Empty C/I or styled Frame/Group is okay, treat as primitive base
      } else {
        return "none"; // Empty, unstyled Frame/Group is not valid content
      }
    }
  }

  // Unknown node type or node type without children that wasn't caught earlier
  return "none";
}

/**
 * Checks if a container node (Frame or Group) contains a visible TEXT child directly.
 * @param node The SceneNode (should be Frame or Group).
 * @returns True if a visible text child exists.
 */
function containsVisibleTextChild(node: SceneNode): boolean {
  if ((node.type === "FRAME" || node.type === "GROUP") && "children" in node) {
    return node.children.some(
      (child) => child.visible && child.type === "TEXT",
    );
  }
  return false;
}

// ========================================================================
//                  Main Icon Recognition Function
// ========================================================================

/**
 * Analyzes a Figma SceneNode using multiple heuristics to determine if it's likely an icon.
 * Combines checks for type, name, size, structure, export settings, and context.
 * v3: Refined scoring for simple primitives vs complex vectors.
 *
 * @param node The Figma SceneNode to evaluate.
 * @param confidenceThreshold The minimum score required to classify as an icon. (Default: 4)
 * @param logDetails Set to true to print debug information to the console for each node evaluated.
 * @returns True if the node is likely an icon, false otherwise.
 */
export function isLikelyIcon(
  node: SceneNode,
  confidenceThreshold = 3,
  logDetails = false,
): boolean {
  let score = 0;
  const info: string[] = [`Node: ${node.name} (${node.type}, ID: ${node.id})`];

  // --- 1. Initial Filtering Out ---
  if (node.visible === false) {
    info.push("Result: NO (Invisible)");
    if (logDetails) console.log(info.join(" | "));
    return false;
  }
  if (DISALLOWED_ICON_TYPES.has(node.type) || node.type === "TEXT") {
    info.push(`Result: NO (Disallowed Type: ${node.type})`);
    if (logDetails) console.log(info.join(" | "));
    return false;
  }
  if (!("width" in node && "height" in node)) {
    info.push("Result: NO (No dimensions)");
    if (logDetails) console.log(info.join(" | "));
    return false;
  }

  // Filter overly large nodes unless they are C/I or Frames
  const MAX_NON_CI_FRAME_SIZE = 64; // Tightened max size
  if (
    node.type !== "COMPONENT" &&
    node.type !== "INSTANCE" &&
    node.type !== "FRAME" &&
    (node.width > MAX_NON_CI_FRAME_SIZE || node.height > MAX_NON_CI_FRAME_SIZE)
  ) {
    info.push(
      `Result: NO (Too large for type ${node.type}: ${node.width}x${node.height})`,
    );
    if (logDetails) console.log(info.join(" | "));
    return false;
  }

  // --- 2. Scoring Heuristics ---
  let isComponentOrInstance = false;
  let mainComp: ComponentNode | null = null;

  // Heuristic: Component/Instance Status (Strong: +2)
  if (node.type === "COMPONENT") {
    score += 2;
    info.push("Is Component (+2)");
    isComponentOrInstance = true;
    mainComp = node;
  } else if (
    node.type === "INSTANCE" &&
    node.mainComponent?.type === "COMPONENT"
  ) {
    score += 2;
    info.push("Is Instance (+2)");
    isComponentOrInstance = true;
    mainComp = node.mainComponent;
  } else if (node.type === "INSTANCE") {
    info.push("Is Instance (mainComp inaccessible/invalid)");
  }

  // Heuristic: Naming Convention (Strong: +2)
  if (nameSuggestsIcon(node.name)) {
    score += 2;
    info.push("Name Suggests (+2)");
  }
  if (
    mainComp &&
    node.name !== mainComp.name &&
    nameSuggestsIcon(mainComp.name)
  ) {
    score += 0.5;
    info.push("MainComp Name Suggests (+0.5)");
  }

  // Heuristic: Export Settings (Good: +1)
  if (hasIconExportSettings(node)) {
    score += 1;
    info.push("Has Icon Export Settings (+1)");
  }

  // Heuristic: Size (Good: +1) - Prefer main component size
  const nodeToCheckSize = mainComp || node;
  if (isTypicalIconSize(nodeToCheckSize)) {
    score += 1;
    info.push(
      `Typical Size (${Math.round(nodeToCheckSize.width)}x${Math.round(nodeToCheckSize.height)}) (+1)`,
    );
  } else if ("width" in nodeToCheckSize) {
    info.push(
      `Atypical Size (${Math.round(nodeToCheckSize.width)}x${Math.round(nodeToCheckSize.height)})`,
    );
  }

  // Heuristic: Structure - Vector Content Nature (Variable Score)
  const contentNature = checkVectorContentNature(node);
  if (contentNature === "complex") {
    score += 3; // Higher score for complex vectors/boolean ops/nested vectors
    info.push("Vector Content [Complex] (+2)");
    return true;
  } else if (contentNature === "primitive") {
    score += 1; // Lower score if it's just a primitive shape or contains only primitives
    info.push("Vector Content [Primitive] (+1)");
  } else {
    // contentNature === 'none'
    // Penalize only if it's not a C/I (which might have complex internal reasons for failing)
    if (!isComponentOrInstance) {
      // No score change, but log it. The lack of positive points is the main effect.
      // score -= 1; // Optionally add penalty back if needed
      info.push("Content NOT Vector-Like/Disallowed (-0)");
    } else {
      info.push("Content NOT Vector-Like (C/I - penalty skipped)");
    }
  }

  // Heuristic: Context - Parent / Component Set (Good: +0.5 to +1)
  if (node.parent) {
    if (node.parent.type === "COMPONENT_SET" && isComponentOrInstance) {
      score += 1;
      info.push("In Component Set (+1)");
    } else if (nameSuggestsIcon(node.parent.name)) {
      score += 0.5;
      info.push(`Parent Name "${node.parent.name}" Suggests (+0.5)`);
    }
  }

  // Heuristic: Problematic Children (Penalty: -1)
  if (containsVisibleTextChild(node)) {
    score -= 1;
    info.push("Contains Visible Text Child (-1)");
  }

  // --- 3. Decision ---
  const isIcon = score >= confidenceThreshold;
  // Round score for cleaner logging if using decimals
  const displayScore = Math.round(score * 10) / 10;
  info.push(
    `Score: ${displayScore} / ${confidenceThreshold} -> ${isIcon ? "YES" : "NO"}`,
  );
  if (logDetails) console.log(info.join(" | "));

  return isIcon;
}
