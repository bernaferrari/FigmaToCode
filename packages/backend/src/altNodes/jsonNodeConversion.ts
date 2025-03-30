import { addWarning } from "../common/commonConversionWarnings";
import { PluginSettings } from "types";
import { variableToColorName } from "../tailwind/conversionTables";
import { HasGeometryTrait, Node, Paint } from "../api_types";
import { calculateRectangleFromBoundingBox } from "../common/commonPosition";
import { bench } from "../log";

// Performance tracking counters
export let getNodeByIdAsyncTime = 0;
export let getNodeByIdAsyncCalls = 0;
export let getStyledTextSegmentsTime = 0;
export let getStyledTextSegmentsCalls = 0;
export let processColorVariablesTime = 0;
export let processColorVariablesCalls = 0;

export const resetPerformanceCounters = () => {
  getNodeByIdAsyncTime = 0;
  getNodeByIdAsyncCalls = 0;
  getStyledTextSegmentsTime = 0;
  getStyledTextSegmentsCalls = 0;
  processColorVariablesTime = 0;
  processColorVariablesCalls = 0;
};

// Keep track of node names for sequential numbering
const nodeNameCounters: Map<string, number> = new Map();

const variableCache = new Map<string, string>();

const memoizedVariableToColorName = async (
  variableId: string,
): Promise<string> => {
  if (!variableCache.has(variableId)) {
    const colorName = (await variableToColorName(variableId)).replaceAll(
      ",",
      "",
    );
    variableCache.set(variableId, colorName);
    return colorName;
  }
  return variableCache.get(variableId)!;
};

/**
 * Process color variables in a paint style and add pre-computed variable names
 * @param paint The paint style to process (fill or stroke)
 */
const processColorVariables = async (paint: Paint) => {
  const start = Date.now();
  processColorVariablesCalls++;

  if (
    paint.type === "GRADIENT_ANGULAR" ||
    paint.type === "GRADIENT_DIAMOND" ||
    paint.type === "GRADIENT_LINEAR" ||
    paint.type === "GRADIENT_RADIAL"
  ) {
    // Filter stops with bound variables first to avoid unnecessary work
    const stopsWithVariables = paint.gradientStops.filter(
      (stop) => stop.boundVariables?.color,
    );

    // Process all gradient stops with variables in parallel
    if (stopsWithVariables.length > 0) {
      await Promise.all(
        stopsWithVariables.map(async (stop) => {
          (stop as any).variableColorName = await memoizedVariableToColorName(
            stop.boundVariables!.color!.id,
          );
        }),
      );
    }
  } else if (paint.type === "SOLID" && paint.boundVariables?.color) {
    // Pre-compute and store the variable name
    (paint as any).variableColorName = await memoizedVariableToColorName(
      paint.boundVariables.color.id,
    );
  }

  processColorVariablesTime += Date.now() - start;
};

const processEffectVariables = async (
  paint: DropShadowEffect | InnerShadowEffect,
) => {
  const start = Date.now();
  processColorVariablesCalls++;

  if (paint.boundVariables?.color) {
    // Pre-compute and store the variable name
    (paint as any).variableColorName = await memoizedVariableToColorName(
      paint.boundVariables.color.id,
    );
  }

  processColorVariablesTime += Date.now() - start;
};

const getColorVariables = async (
  node: HasGeometryTrait,
  settings: PluginSettings,
) => {
  // This tries to be as fast as it can, using Promise.all so it can parallelize calls.
  if (settings.useColorVariables) {
    if (node.fills && Array.isArray(node.fills)) {
      await Promise.all(
        node.fills.map((fill: Paint) => processColorVariables(fill)),
      );
    }
    if (node.strokes && Array.isArray(node.strokes)) {
      await Promise.all(
        node.strokes.map((stroke: Paint) => processColorVariables(stroke)),
      );
    }
    if ("effects" in node && node.effects && Array.isArray(node.effects)) {
      await Promise.all(
        node.effects
          .filter(
            (effect: Effect) =>
              effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW",
          )
          .map((effect: DropShadowEffect | InnerShadowEffect) =>
            processEffectVariables(effect),
          ),
      );
    }
  }
};

function adjustChildrenOrder(node: any) {
  if (!node.itemReverseZIndex || !node.children || node.layoutMode === "NONE") {
    return;
  }

  const children = node.children;
  const absoluteChildren = [];
  const fixedChildren = [];

  // Single pass to separate absolute and fixed children
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (child.layoutPositioning === "ABSOLUTE") {
      absoluteChildren.push(child);
    } else {
      fixedChildren.unshift(child); // Add to beginning to maintain original order
    }
  }

  // Combine the arrays (reversed absolute children + original order fixed children)
  node.children = [...absoluteChildren, ...fixedChildren];
}

/**
 * Checks if a node can be flattened into SVG
 */
const canBeFlattened = (node: Node): boolean => {
  // These node types should be directly flattened
  const flattenableTypes: string[] = [
    "VECTOR",
    "STAR",
    "POLYGON",
    "BOOLEAN_OPERATION",
    "REGULAR_POLYGON",
  ];
  if ("children" in node && node.children) {
    return node.children.every((child) => {
      if (child.type === "GROUP" && "children" in child && child.children) {
        return child.children.every((d) => canBeFlattened(d));
      }
      return flattenableTypes.includes(child.type);
    });
  }

  // Handle special case for Rectangle nodes with zero or near-zero height
  if (node.type === "RECTANGLE") {
    return false; // Rectangles should not be flattened by default
  }

  return flattenableTypes.includes(node.type);
};

/**
 * Recursively process both JSON node and Figma node to update with data not available in JSON
 * This now includes the functionality from convertNodeToAltNode
 * @param jsonNode The JSON node to process
 * @param figmaNode The corresponding Figma node
 * @param settings Plugin settings
 * @param parentNode Optional parent node reference to set
 * @param parentCumulativeRotation Optional parent cumulative rotation to inherit
 * @returns Potentially modified jsonNode, array of nodes (for inlined groups), or null
 */
const processNodePair = async (
  jsonNode: Node,
  figmaNode: SceneNode,
  settings: PluginSettings,
  parentNode?: Node,
  parentCumulativeRotation: number = 0,
): Promise<Node | Node[] | null> => {
  if (!jsonNode.id) return null;
  if (jsonNode.visible === false) return null;

  // Add canBeFlattened property
  (jsonNode as any).canBeFlattened = canBeFlattened(jsonNode);

  // Handle node type-specific conversions (from convertNodeToAltNode)
  const nodeType = jsonNode.type;

  // Store the cumulative rotation (parent's cumulative + node's own)
  if (parentNode) {
    // Only add cumulative when there is a parent. This is useful for the GROUP -> FRAME transformation, where
    // we want to move the rotation of the GROUP to children, but want to se FRAME to 0.
    jsonNode.cumulativeRotation = parentCumulativeRotation;
  }

  // Handle empty frames and convert to rectangles
  if (
    (nodeType === "FRAME" ||
      nodeType === "INSTANCE" ||
      nodeType === "COMPONENT" ||
      nodeType === "COMPONENT_SET") &&
    (!jsonNode.children || jsonNode.children.length === 0)
  ) {
    // Convert to rectangle
    jsonNode.type = "RECTANGLE";
    return processNodePair(
      jsonNode,
      figmaNode,
      settings,
      parentNode,
      parentCumulativeRotation,
    );
  }

  if ("rotation" in jsonNode) {
    jsonNode.rotation = -jsonNode.rotation * (180 / Math.PI);
  }

  // Inline all GROUP nodes by processing their children directly
  if (nodeType === "GROUP" && jsonNode.children) {
    const processedChildren = [];

    if (
      Array.isArray(jsonNode.children) &&
      figmaNode &&
      "children" in figmaNode &&
      figmaNode.children.length === jsonNode.children.length
    ) {
      for (let i = 0; i < jsonNode.children.length; i++) {
        const child = jsonNode.children[i];
        const figmaChild = figmaNode.children[i];
        if (!figmaChild) continue;

        const processedChild = await processNodePair(
          child,
          figmaChild,
          settings,
          parentNode, // The group’s parent
          parentCumulativeRotation + (jsonNode.rotation || 0),
        );

        // Push the processed group children directly
        if (processedChild !== null) {
          if (Array.isArray(processedChild)) {
            processedChildren.push(...processedChild);
          } else {
            processedChildren.push(processedChild);
          }
        }
      }
    }

    // Simply return the processed children; skip splicing parent’s children
    return processedChildren;
  }

  // Return null for unsupported nodes
  if (nodeType === "SLICE") {
    return null;
  }

  // Set parent reference if parent is provided
  if (parentNode) {
    (jsonNode as any).parent = parentNode;
  }

  // Ensure node has a unique name with simple numbering
  const cleanName = jsonNode.name.trim();

  // Track names with simple counter
  const count = nodeNameCounters.get(cleanName) || 0;
  nodeNameCounters.set(cleanName, count + 1);

  // For first occurrence, use original name; for duplicates, add sequential suffix
  jsonNode.uniqueName =
    count === 0
      ? cleanName
      : `${cleanName}_${count.toString().padStart(2, "0")}`;

  // Handle text-specific properties
  if (figmaNode.type === "TEXT") {
    const getSegmentsStart = Date.now();
    getStyledTextSegmentsCalls++;
    let styledTextSegments = figmaNode.getStyledTextSegments([
      "fontName",
      "fills",
      "fontSize",
      "fontWeight",
      "hyperlink",
      "indentation",
      "letterSpacing",
      "lineHeight",
      "listOptions",
      "textCase",
      "textDecoration",
      "textStyleId",
      "fillStyleId",
      "openTypeFeatures",
    ]);
    getStyledTextSegmentsTime += Date.now() - getSegmentsStart;

    // Assign unique IDs to each segment
    if (styledTextSegments.length > 0) {
      const baseSegmentName = (jsonNode.uniqueName || jsonNode.name)
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toLowerCase();

      // Add a uniqueId to each segment
      styledTextSegments = await Promise.all(
        styledTextSegments.map(async (segment, index) => {
          const mutableSegment: any = Object.assign({}, segment);

          if (settings.useColorVariables && segment.fills) {
            mutableSegment.fills = await Promise.all(
              segment.fills.map(async (d) => {
                if (
                  d.blendMode !== "PASS_THROUGH" &&
                  d.blendMode !== "NORMAL"
                ) {
                  addWarning("BlendMode is not supported in Text colors");
                }
                const fill = { ...d } as Paint;
                await processColorVariables(fill);
                return fill;
              }),
            );
          }

          // For single segments, don't add index suffix
          if (styledTextSegments.length === 1) {
            (mutableSegment as any).uniqueId = `${baseSegmentName}_span`;
          } else {
            // For multiple segments, add index suffix
            (mutableSegment as any).uniqueId =
              `${baseSegmentName}_span_${(index + 1).toString().padStart(2, "0")}`;
          }
          return mutableSegment;
        }),
      );

      jsonNode.styledTextSegments = styledTextSegments;
    }

    Object.assign(jsonNode, jsonNode.style);
    if (!jsonNode.textAutoResize) {
      jsonNode.textAutoResize = "NONE";
    }
  }

  // Extract component metadata from instances
  if ("variantProperties" in figmaNode && figmaNode.variantProperties) {
    jsonNode.variantProperties = figmaNode.variantProperties;
  }

  // Always copy size and position
  if ("absoluteBoundingBox" in jsonNode && jsonNode.absoluteBoundingBox) {
    if (jsonNode.parent) {
      // Extract width and height from bounding box and rotation. This is necessary because Figma JSON API doesn't have width and height.
      const rect = calculateRectangleFromBoundingBox(
        {
          width: jsonNode.absoluteBoundingBox.width,
          height: jsonNode.absoluteBoundingBox.height,
          x:
            jsonNode.absoluteBoundingBox.x -
            (jsonNode.parent?.absoluteBoundingBox.x || 0),
          y:
            jsonNode.absoluteBoundingBox.y -
            (jsonNode.parent?.absoluteBoundingBox.y || 0),
        },
        -((jsonNode.rotation || 0) + (jsonNode.cumulativeRotation || 0)),
      );

      jsonNode.width = rect.width;
      jsonNode.height = rect.height;
      jsonNode.x = rect.left;
      jsonNode.y = rect.top;
    } else {
      jsonNode.width = jsonNode.absoluteBoundingBox.width;
      jsonNode.height = jsonNode.absoluteBoundingBox.height;
      jsonNode.x = 0;
      jsonNode.y = 0;
    }
  }

  if ("individualStrokeWeights" in jsonNode) {
    jsonNode.strokeTopWeight = jsonNode.individualStrokeWeights.top;
    jsonNode.strokeBottomWeight = jsonNode.individualStrokeWeights.bottom;
    jsonNode.strokeLeftWeight = jsonNode.individualStrokeWeights.left;
    jsonNode.strokeRightWeight = jsonNode.individualStrokeWeights.right;
  }

  await getColorVariables(jsonNode, settings);

  // Some places check if paddingLeft exists. This makes sure they all exist, even if 0.
  if ("layoutMode" in jsonNode && jsonNode.layoutMode) {
    if (jsonNode.paddingLeft === undefined) {
      jsonNode.paddingLeft = 0;
    }
    if (jsonNode.paddingRight === undefined) {
      jsonNode.paddingRight = 0;
    }
    if (jsonNode.paddingTop === undefined) {
      jsonNode.paddingTop = 0;
    }
    if (jsonNode.paddingBottom === undefined) {
      jsonNode.paddingBottom = 0;
    }
  }

  // Set default layout properties if missing
  if (!jsonNode.layoutMode) jsonNode.layoutMode = "NONE";
  if (!jsonNode.layoutGrow) jsonNode.layoutGrow = 0;
  if (!jsonNode.layoutSizingHorizontal)
    jsonNode.layoutSizingHorizontal = "FIXED";
  if (!jsonNode.layoutSizingVertical) jsonNode.layoutSizingVertical = "FIXED";
  if (!jsonNode.primaryAxisAlignItems) {
    jsonNode.primaryAxisAlignItems = "MIN";
  }
  if (!jsonNode.counterAxisAlignItems) {
    jsonNode.counterAxisAlignItems = "MIN";
  }

  // If layout sizing is HUG but there are no children, set it to FIXED
  const hasChildren =
    "children" in jsonNode &&
    jsonNode.children &&
    Array.isArray(jsonNode.children) &&
    jsonNode.children.length > 0;

  if (jsonNode.layoutSizingHorizontal === "HUG" && !hasChildren) {
    jsonNode.layoutSizingHorizontal = "FIXED";
  }
  if (jsonNode.layoutSizingVertical === "HUG" && !hasChildren) {
    jsonNode.layoutSizingVertical = "FIXED";
  }

  // Process children recursively if both have children
  if (
    "children" in jsonNode &&
    jsonNode.children &&
    Array.isArray(jsonNode.children) &&
    "children" in figmaNode &&
    figmaNode.children.length === jsonNode.children.length
  ) {
    const cumulative =
      parentCumulativeRotation +
      (jsonNode.type === "GROUP" ? jsonNode.rotation || 0 : 0);

    // Process children and handle potential null returns
    const processedChildren = [];
    for (let i = 0; i < jsonNode.children.length; i++) {
      const processedChild = await processNodePair(
        jsonNode.children[i],
        figmaNode.children[i],
        settings,
        jsonNode,
        cumulative,
      );

      if (processedChild !== null) {
        if (Array.isArray(processedChild)) {
          processedChildren.push(...processedChild);
        } else {
          processedChildren.push(processedChild);
        }
      }
    }

    // Replace children array with processed children
    jsonNode.children = processedChildren;

    if (
      jsonNode.layoutMode === "NONE" ||
      jsonNode.children.some(
        (d: any) =>
          "layoutPositioning" in d && d.layoutPositioning === "ABSOLUTE",
      )
    ) {
      jsonNode.isRelative = true;
    }

    adjustChildrenOrder(jsonNode);
  } else if (
    "children" in figmaNode &&
    figmaNode.children.length !== jsonNode.children.length
  ) {
    addWarning(
      "Error: JSON and Figma nodes have different child counts. Please report this issue.",
    );
  }

  return jsonNode;
};

/**
 * Convert Figma nodes to JSON format with parent references added
 * @param nodes The Figma nodes to convert to JSON
 * @param settings Plugin settings
 * @returns JSON representation of the nodes with parent references
 */
export const nodesToJSON = async (
  nodes: ReadonlyArray<SceneNode>,
  settings: PluginSettings,
): Promise<Node[]> => {
  // Reset name counters for each conversion
  nodeNameCounters.clear();
  const exportJsonStart = Date.now();
  // First get the JSON representation of nodes with rotation handling
  const nodeResults = await Promise.all(
    nodes.map(async (node) => {
      // Export node to JSON
      const nodeDoc = (
        (await node.exportAsync({
          format: "JSON_REST_V1",
        })) as any
      ).document;

      let nodeCumulativeRotation = 0;

      // Wire GROUPs into FRAME.
      if (node.type === "GROUP") {
        nodeDoc.type = "FRAME";

        // Fix rotation for children.
        if ("rotation" in nodeDoc && nodeDoc.rotation) {
          nodeCumulativeRotation = -nodeDoc.rotation * (180 / Math.PI);
          nodeDoc.rotation = 0;
        }
      }

      return {
        nodeDoc,
        nodeCumulativeRotation,
      };
    }),
  );

  console.log("[debug] initial nodeJson", { ...nodes[0] });

  bench(
    `[benchmark][inside nodesToJSON] JSON_REST_V1 export: ${Date.now() - exportJsonStart}ms`,
  );

  // Now process each top-level node pair (JSON node + Figma node)
  const processNodesStart = Date.now();
  const result: Node[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const processedNode = await processNodePair(
      nodeResults[i].nodeDoc,
      nodes[i],
      settings,
      undefined,
      nodeResults[i].nodeCumulativeRotation,
    );
    if (processedNode !== null) {
      if (Array.isArray(processedNode)) {
        // If processNodePair returns an array (inlined group), add all nodes
        result.push(...processedNode);
      } else {
        // If it returns a single node, add it directly
        result.push(processedNode);
      }
    }
  }

  bench(
    `[benchmark][inside nodesToJSON] Process node pairs: ${Date.now() - processNodesStart}ms`,
  );

  return result;
};
