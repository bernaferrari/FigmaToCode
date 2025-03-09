import { convertNodesToAltNodes } from "./altNodes/altConversion";
import {
  retrieveGenericSolidUIColors,
  retrieveGenericLinearGradients as retrieveGenericGradients,
} from "./common/retrieveUI/retrieveColors";
import {
  addWarning,
  clearWarnings,
  warnings,
} from "./common/commonConversionWarnings";
import { postConversionComplete, postEmptyMessage } from "./messaging";
import { PluginSettings } from "types";
import { convertToCode } from "./common/retrieveUI/convertToCode";
import { generateHTMLPreview } from "./html/htmlMain";
import { variableToColorName } from "./tailwind/conversionTables";

// Performance tracking counters
let getNodeByIdAsyncTime = 0;
let getNodeByIdAsyncCalls = 0;
let getStyledTextSegmentsTime = 0;
let getStyledTextSegmentsCalls = 0;
let processColorVariablesTime = 0;
let processColorVariablesCalls = 0;

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

// Define all property paths that might contain gradients
const GRADIENT_PROPERTIES = ["fills", "strokes"];

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
  node: GeometryMixin,
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
 * Recursively process both JSON node and Figma node to update with data not available in JSON
 * @param jsonNode The JSON node to process
 * @param figmaNode The corresponding Figma node
 * @param settings Plugin settings
 * @param parentNode Optional parent node reference to set
 */
const processNodePair = async (
  jsonNode: any,
  figmaNode: SceneNode,
  settings: PluginSettings,
  parentNode?: any
) => {
  if (!jsonNode.id) return;

  // Set parent reference if parent is provided
  if (parentNode) {
    jsonNode.parent = parentNode;
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

  // Check if we need to handle gradients
  const hasGradient = GRADIENT_PROPERTIES.some((propName) => {
    const property = jsonNode[propName];
    return (
      property &&
      Array.isArray(property) &&
      property.length > 0 &&
      property.some(
        (item: any) => item.type && item.type.startsWith("GRADIENT_"),
      )
    );
  });

  // Handle gradients
  if (hasGradient) {
    GRADIENT_PROPERTIES.forEach((propName) => {
      const property = jsonNode[propName];
      if (
        property &&
        Array.isArray(property) &&
        property.length > 0 &&
        property.some(
          (item) => item.type && item.type.startsWith("GRADIENT_"),
        ) &&
        propName in figmaNode
      ) {
        jsonNode[propName] = JSON.parse(
          JSON.stringify((figmaNode as any)[propName]),
        );
      }
    });
  }

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
          const mutableSegment = Object.assign({}, segment);

          if (settings.useColorVariables && segment.fills) {
            mutableSegment.fills = await Promise.all(
              segment.fills.map(async (d) => {
                if (
                  d.blendMode !== "PASS_THROUGH" &&
                  d.blendMode !== "NORMAL"
                ) {
                  addWarning("BlendMode is not supported in Text colors");
                }
                const fill = { ...d };
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
  if ("width" in figmaNode) {
    jsonNode.width = figmaNode.width;
    jsonNode.height = figmaNode.height;
    jsonNode.x = figmaNode.x;
    jsonNode.y = figmaNode.y;
  }

  if ("rotation" in jsonNode) {
    jsonNode.rotation = jsonNode.rotation * (180 / Math.PI);
  }

  if ("individualStrokeWeights" in jsonNode) {
    jsonNode.strokeTopWeight = jsonNode.individualStrokeWeights.top;
    jsonNode.strokeBottomWeight = jsonNode.individualStrokeWeights.bottom;
    jsonNode.strokeLeftWeight = jsonNode.individualStrokeWeights.left;
    jsonNode.strokeRightWeight = jsonNode.individualStrokeWeights.right;
  }

  await getColorVariables(jsonNode, settings);

  // Some places check if paddingLeft exists. This makes sure they all exist, even if 0.
  if (jsonNode.layoutMode) {
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
    jsonNode.children &&
    Array.isArray(jsonNode.children) &&
    "children" in figmaNode &&
    figmaNode.children.length === jsonNode.children.length
  ) {
    // Somehow this is slower than the for loop.
    // await Promise.all(
    //   jsonNode.children.map((child: any, i: number) =>
    //     processNodePair(child, figmaNode.children[i], settings),
    //   ),
    // );

    for (let i = 0; i < jsonNode.children.length; i++) {
      await processNodePair(
        jsonNode.children[i],
        figmaNode.children[i],
        settings,
        jsonNode // Pass the current node as parent for its children
      );
    }

    if (
      jsonNode.layoutMode !== "NONE" &&
      jsonNode.children.some(
        (d: any) =>
          "layoutPositioning" in d && d.layoutPositioning === "ABSOLUTE",
      )
    ) {
      jsonNode.isRelative = true;
    }

    adjustChildrenOrder(jsonNode);
  }
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
): Promise<SceneNode[]> => {
  // Reset name counters for each conversion
  nodeNameCounters.clear();

  const exportJsonStart = Date.now();
  // First get the JSON representation of nodes
  const nodeJson = (await Promise.all(
    nodes.map(
      async (node) =>
        (
          (await node.exportAsync({
            format: "JSON_REST_V1",
          })) as any
        ).document,
    ),
  )) as SceneNode[];
  console.log(
    `[benchmark][inside nodesToJSON] JSON_REST_V1 export: ${Date.now() - exportJsonStart}ms`,
  );

  // Now process each top-level node pair (JSON node + Figma node)
  const processNodesStart = Date.now();
  for (let i = 0; i < nodes.length; i++) {
    await processNodePair(nodeJson[i], nodes[i], settings);
  }
  console.log(
    `[benchmark][inside nodesToJSON] Process node pairs: ${Date.now() - processNodesStart}ms`,
  );

  return nodeJson;
};

export const run = async (settings: PluginSettings) => {
  // Reset performance counters at the beginning
  getNodeByIdAsyncTime = 0;
  getNodeByIdAsyncCalls = 0;
  getStyledTextSegmentsTime = 0;
  getStyledTextSegmentsCalls = 0;
  processColorVariablesTime = 0;
  processColorVariablesCalls = 0;
  variableCache.clear();
  clearWarnings();

  const { framework } = settings;
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    postEmptyMessage();
    return;
  } else if (selection.length > 1) {
    addWarning(
      "Ungrouped elements may have incorrect positioning. If this happens, try wrapping the selection in a Frame or Group.",
    );
  }

  // Timing with Date.now() instead of console.time
  const nodeToJSONStart = Date.now();
  const nodeJson = await nodesToJSON(selection, settings);
  console.log(`[benchmark] nodesToJSON: ${Date.now() - nodeToJSONStart}ms`);
  console.log("nodeJson", nodeJson);

  // Now we work directly with the JSON nodes
  const convertNodesStart = Date.now();
  const convertedSelection = await convertNodesToAltNodes(nodeJson, null);
  console.log(
    `[benchmark] convertNodesToAltNodes: ${Date.now() - convertNodesStart}ms`,
  );

  // ignore when nothing was selected
  // If the selection was empty, the converted selection will also be empty.
  if (convertedSelection.length === 0) {
    postEmptyMessage();
    return;
  }

  const convertToCodeStart = Date.now();
  const code = await convertToCode(convertedSelection, settings);
  console.log(
    `[benchmark] convertToCode: ${Date.now() - convertToCodeStart}ms`,
  );

  const generatePreviewStart = Date.now();
  const htmlPreview = await generateHTMLPreview(convertedSelection, settings);
  console.log(
    `[benchmark] generateHTMLPreview: ${Date.now() - generatePreviewStart}ms`,
  );

  const colorPanelStart = Date.now();
  const colors = retrieveGenericSolidUIColors(framework);
  const gradients = retrieveGenericGradients(framework);
  console.log(
    `[benchmark] color and gradient panel: ${Date.now() - colorPanelStart}ms`,
  );
  console.log(
    `[benchmark] total generation time: ${Date.now() - nodeToJSONStart}ms`,
  );

  // Log performance statistics
  console.log(
    `[benchmark] getNodeByIdAsync: ${getNodeByIdAsyncTime}ms (${getNodeByIdAsyncCalls} calls, avg: ${(getNodeByIdAsyncTime / getNodeByIdAsyncCalls || 1).toFixed(2)}ms)`,
  );
  console.log(
    `[benchmark] getStyledTextSegments: ${getStyledTextSegmentsTime}ms (${getStyledTextSegmentsCalls} calls, avg: ${
      getStyledTextSegmentsCalls > 0
        ? (getStyledTextSegmentsTime / getStyledTextSegmentsCalls).toFixed(2)
        : 0
    }ms)`,
  );
  console.log(
    `[benchmark] processColorVariables: ${processColorVariablesTime}ms (${processColorVariablesCalls} calls, avg: ${
      processColorVariablesCalls > 0
        ? (processColorVariablesTime / processColorVariablesCalls).toFixed(2)
        : 0
    }ms)`,
  );

  postConversionComplete({
    code,
    htmlPreview,
    colors,
    gradients,
    settings,
    warnings: [...warnings],
  });
};
