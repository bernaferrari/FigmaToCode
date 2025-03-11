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
import { oldConvertNodesToAltNodes } from "./altNodes/oldAltConversion";
import {
  convertNodesToAltNodes,
  convertNodeToAltNode,
} from "./altNodes/altConversion";

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
  parentNode?: any,
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
        jsonNode,
      );
    }

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

  console.log("[debug] initial nodeJson", { ...nodeJson[0] });

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

  const { framework, useOldPluginVersion2025 } = settings;
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

  let convertedSelection: any;
  if (useOldPluginVersion2025) {
    convertedSelection = oldConvertNodesToAltNodes(selection, null);
    console.log("convertedSelection", convertedSelection);
  } else {
    const nodeJson = await nodesToJSON(selection, settings);
    console.log(`[benchmark] nodesToJSON: ${Date.now() - nodeToJSONStart}ms`);
    console.log("nodeJson", nodeJson);

    // Now we work directly with the JSON nodes
    const convertNodesStart = Date.now();
    convertedSelection = await convertNodesToAltNodes(nodeJson, null);
    const convertedSelection2 = [
      {
        id: "I2099:38616;1739:34914",
        name: "Modal",
        type: "FRAME",
        scrollBehavior: "SCROLLS",
        boundVariables: {
          minHeight: {
            type: "VARIABLE_ALIAS",
            id: "VariableID:ca5fdd543c7de4d7a5d043eb31c365871c484b3e/4411:779",
          },
          maxHeight: {
            type: "VARIABLE_ALIAS",
            id: "VariableID:143b8d97896be058533bf7578cac052ff1473fe5/4411:780",
          },
          size: {
            x: {
              type: "VARIABLE_ALIAS",
              id: "VariableID:51164a6f21a5daac8ea5fa8551389d4d7864a05e/1129:893",
            },
            y: {
              type: "VARIABLE_ALIAS",
              id: "VariableID:c7de0427328e0238030ad2c66fb3a86abcdf6421/2867:8",
            },
          },
          rectangleCornerRadii: {
            RECTANGLE_TOP_LEFT_CORNER_RADIUS: {
              type: "VARIABLE_ALIAS",
              id: "VariableID:f4761dc8bffff3a6dc119f76d86928372facdf02/3157:870",
            },
            RECTANGLE_TOP_RIGHT_CORNER_RADIUS: {
              type: "VARIABLE_ALIAS",
              id: "VariableID:f4761dc8bffff3a6dc119f76d86928372facdf02/3157:870",
            },
            RECTANGLE_BOTTOM_LEFT_CORNER_RADIUS: {
              type: "VARIABLE_ALIAS",
              id: "VariableID:f4761dc8bffff3a6dc119f76d86928372facdf02/3157:870",
            },
            RECTANGLE_BOTTOM_RIGHT_CORNER_RADIUS: {
              type: "VARIABLE_ALIAS",
              id: "VariableID:f4761dc8bffff3a6dc119f76d86928372facdf02/3157:870",
            },
          },
          fills: [
            {
              type: "VARIABLE_ALIAS",
              id: "VariableID:8cbcd0032a7cac3b9799f16f6f48c35cab554a40/2243:10",
            },
          ],
          effects: [
            {
              type: "VARIABLE_ALIAS",
              id: "VariableID:55268df3aca26e8ed4182c6831670c631ab2e88b/4411:298",
            },
            {
              type: "VARIABLE_ALIAS",
              id: "VariableID:7b576d4f7cef936e728857b8d6f7952e2a6dd6fe/3157:78",
            },
            {
              type: "VARIABLE_ALIAS",
              id: "VariableID:e7dccd708e8eb5f689ef26147d2d985b7af1bfd8/2013:336",
            },
          ],
        },
        children: [
          {
            id: "I2099:38616;1739:61360",
            name: "Content",
            type: "FRAME",
            scrollBehavior: "SCROLLS",
            children: [
              {
                id: "I2099:38616;1739:34917",
                name: "Modal Container",
                type: "INSTANCE",
                scrollBehavior: "SCROLLS",
                componentPropertyReferences: {
                  mainComponent: "Swap Modal Container#893:1",
                },
                boundVariables: {
                  itemSpacing: {
                    type: "VARIABLE_ALIAS",
                    id: "VariableID:b1aa965163834bcfd01131ac315d7d493f241ba6/10434:244",
                  },
                  paddingLeft: {
                    type: "VARIABLE_ALIAS",
                    id: "VariableID:c44b7d196360345cd2e77fddb9fdbb56b074630c/10434:249",
                  },
                  paddingTop: {
                    type: "VARIABLE_ALIAS",
                    id: "VariableID:becb73e51eeba1f8c786ade8394c2a4d29eb3ecf/10434:245",
                  },
                  paddingRight: {
                    type: "VARIABLE_ALIAS",
                    id: "VariableID:dca108e1e0b09a774a4527df680b8306bc9208b2/10434:246",
                  },
                  paddingBottom: {
                    type: "VARIABLE_ALIAS",
                    id: "VariableID:f6e871ff408efebce7861cdde12d1530510445e9/10434:248",
                  },
                  minHeight: {
                    type: "VARIABLE_ALIAS",
                    id: "VariableID:d4bef8dbc813180acafb9ee86fec3ab4e9cb2983/3203:9",
                  },
                  maxHeight: {
                    type: "VARIABLE_ALIAS",
                    id: "VariableID:5c0fdb551d4699d20f1fa1328995f4fb9d0ad8d5/3203:12",
                  },
                },
                componentId: "2099:38674",
                isExposedInstance: true,
                componentProperties: {
                  Type: {
                    value: "Fixed",
                    type: "VARIANT",
                    boundVariables: {},
                  },
                  Allignment: {
                    value: "Default (L-R)",
                    type: "VARIANT",
                    boundVariables: {},
                  },
                },
                overrides: [
                  {
                    id: "I2099:38616;1739:34917;2326:19664",
                    overriddenFields: [
                      "componentProperties",
                      "primaryAxisSizingMode",
                      "layoutGrow",
                      "counterAxisSizingMode",
                    ],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19688",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19673;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19661",
                    overriddenFields: [
                      "componentProperties",
                      "counterAxisSizingMode",
                      "primaryAxisSizingMode",
                    ],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19706",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19664;1202:3054",
                    overriddenFields: [
                      "layoutAlign",
                      "sharedPluginData",
                      "pluginData",
                      "componentProperties",
                      "counterAxisSizingMode",
                      "layoutGrow",
                      "paddingRight",
                      "paddingLeft",
                      "primaryAxisSizingMode",
                    ],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19697",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19673",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19664;1202:3050;1856:4",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19691",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19703;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19667",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19691;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917",
                    overriddenFields: [
                      "topLeftRadius",
                      "cornerRadius",
                      "topRightRadius",
                      "name",
                      "bottomLeftRadius",
                      "bottomRightRadius",
                      "primaryAxisSizingMode",
                      "counterAxisSizingMode",
                      "layoutGrow",
                      "boundVariables",
                    ],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19670",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19700",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19703",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19664;1202:3055",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19661;117:435;1658:6969",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19670;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19697;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19688;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19706;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19664;1202:3056",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19667;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;1732:20311",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19694",
                    overriddenFields: ["visible"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19664;1202:3053",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19694;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19664;1202:3052",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                  {
                    id: "I2099:38616;1739:34917;2326:19700;979:10619",
                    overriddenFields: ["sharedPluginData", "pluginData"],
                  },
                ],
                children: [
                  {
                    id: "I2099:38616;1739:34917;1732:20311",
                    name: "Grid",
                    type: "FRAME",
                    scrollBehavior: "SCROLLS",
                    boundVariables: {
                      itemSpacing: {
                        type: "VARIABLE_ALIAS",
                        id: "VariableID:b1aa965163834bcfd01131ac315d7d493f241ba6/10434:244",
                      },
                    },
                    children: [
                      {
                        id: "I2099:38616;1739:34917;1732:20312",
                        name: "Row",
                        type: "FRAME",
                        scrollBehavior: "SCROLLS",
                        boundVariables: {
                          itemSpacing: {
                            type: "VARIABLE_ALIAS",
                            id: "VariableID:be243c44965c9affe677211ea0cd661d873653e1/10434:247",
                          },
                          counterAxisSpacing: {
                            type: "VARIABLE_ALIAS",
                            id: "VariableID:b1aa965163834bcfd01131ac315d7d493f241ba6/10434:244",
                          },
                        },
                        children: [
                          {
                            id: "I2099:38616;1739:34917;2326:19661",
                            name: "TextImage Variation 2",
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            boundVariables: {
                              size: {
                                x: {
                                  type: "VARIABLE_ALIAS",
                                  id: "VariableID:7dde29c0269cd3c53a0f9f7c1e2cc8e86d43cf3b/3157:236",
                                },
                                y: {
                                  type: "VARIABLE_ALIAS",
                                  id: "VariableID:7dde29c0269cd3c53a0f9f7c1e2cc8e86d43cf3b/3157:236",
                                },
                              },
                            },
                            componentId: "2043:22065",
                            componentProperties: {
                              "↳Swap Icon/Image/Graphic#9837:448": {
                                value: "2092:64304",
                                type: "INSTANCE_SWAP",
                                preferredValues: [],
                              },
                              "Custom Size": {
                                value: "False",
                                type: "VARIANT",
                                boundVariables: {},
                              },
                              "Predefined Size": {
                                value: "L Container",
                                type: "VARIANT",
                                boundVariables: {},
                              },
                            },
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19661",
                                overriddenFields: [
                                  "componentProperties",
                                  "counterAxisSizingMode",
                                  "primaryAxisSizingMode",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19661;117:435;1658:6969",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [
                              {
                                id: "I2099:38616;1739:34917;2326:19661;117:435",
                                name: "FaxOfHook",
                                type: "INSTANCE",
                                scrollBehavior: "SCROLLS",
                                componentPropertyReferences: {
                                  mainComponent:
                                    "↳Swap Icon/Image/Graphic#9837:448",
                                },
                                componentId: "2092:64304",
                                overrides: [
                                  {
                                    id: "I2099:38616;1739:34917;2326:19661;117:435;1658:6969",
                                    overriddenFields: [
                                      "sharedPluginData",
                                      "pluginData",
                                    ],
                                  },
                                ],
                                children: [
                                  {
                                    id: "I2099:38616;1739:34917;2326:19661;117:435;1658:6969",
                                    name: "Vector",
                                    type: "VECTOR",
                                    scrollBehavior: "SCROLLS",
                                    boundVariables: {
                                      fills: [
                                        {
                                          type: "VARIABLE_ALIAS",
                                          id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                        },
                                      ],
                                    },
                                    blendMode: "PASS_THROUGH",
                                    fills: [
                                      {
                                        blendMode: "NORMAL",
                                        type: "SOLID",
                                        color: {
                                          r: 1,
                                          g: 1,
                                          b: 1,
                                          a: 1,
                                        },
                                        boundVariables: {
                                          color: {
                                            type: "VARIABLE_ALIAS",
                                            id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                          },
                                        },
                                      },
                                    ],
                                    fillOverrideTable: {
                                      "1": null,
                                    },
                                    strokes: [],
                                    strokeWeight: 0.75,
                                    strokeAlign: "CENTER",
                                    strokeJoin: "ROUND",
                                    strokeCap: "ROUND",
                                    strokeMiterAngle: 11.478341102600098,
                                    absoluteBoundingBox: {
                                      x: -1897.455078125,
                                      y: -2168.515380859375,
                                      width: 127.45187377929688,
                                      height: 125.89124298095703,
                                    },
                                    absoluteRenderBounds: {
                                      x: -1897.455078125,
                                      y: -2168.515380859375,
                                      width: 127.451904296875,
                                      height: 125.8912353515625,
                                    },
                                    constraints: {
                                      vertical: "SCALE",
                                      horizontal: "SCALE",
                                    },
                                    effects: [],
                                    interactions: [],
                                  },
                                ],
                                blendMode: "PASS_THROUGH",
                                clipsContent: true,
                                background: [],
                                fills: [],
                                strokes: [],
                                strokeWeight: 1,
                                strokeAlign: "INSIDE",
                                backgroundColor: {
                                  r: 0,
                                  g: 0,
                                  b: 0,
                                  a: 0,
                                },
                                absoluteBoundingBox: {
                                  x: -1907.5,
                                  y: -2177.75,
                                  width: 150,
                                  height: 150,
                                },
                                absoluteRenderBounds: {
                                  x: -1907.5,
                                  y: -2177.75,
                                  width: 150,
                                  height: 150,
                                },
                                constraints: {
                                  vertical: "TOP",
                                  horizontal: "LEFT",
                                },
                                layoutAlign: "STRETCH",
                                layoutGrow: 1,
                                layoutSizingHorizontal: "FILL",
                                layoutSizingVertical: "FILL",
                                effects: [],
                                interactions: [],
                              },
                            ],
                            blendMode: "PASS_THROUGH",
                            clipsContent: false,
                            background: [],
                            fills: [],
                            strokes: [],
                            strokeWeight: 1,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            layoutMode: "HORIZONTAL",
                            itemSpacing: 10,
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            absoluteBoundingBox: {
                              x: -1907.5,
                              y: -2177.75,
                              width: 150,
                              height: 150,
                            },
                            absoluteRenderBounds: {
                              x: -1907.5,
                              y: -2177.75,
                              width: 150,
                              height: 150,
                            },
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19664",
                            name: "TextImage Variation 1",
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            boundVariables: {
                              itemSpacing: {
                                type: "VARIABLE_ALIAS",
                                id: "VariableID:3f744b5e3c8b3619411d855f7fe34dd7351a9435/3157:1061",
                              },
                              minWidth: {
                                type: "VARIABLE_ALIAS",
                                id: "VariableID:1b137df291c4095c5e80c61d2c69a449cba2ccd9/3157:87",
                              },
                            },
                            componentId: "2058:19231",
                            exposedInstances: [
                              "I2099:38616;1739:34917;2326:19664;1202:3050",
                              "I2099:38616;1739:34917;2326:19664;1202:3052",
                              "I2099:38616;1739:34917;2326:19664;1202:3053",
                              "I2099:38616;1739:34917;2326:19664;1202:3054",
                              "I2099:38616;1739:34917;2326:19664;1202:3055",
                              "I2099:38616;1739:34917;2326:19664;1202:3056",
                            ],
                            componentProperties: {
                              "↳Show Title Big#1053:9": {
                                value: false,
                                type: "BOOLEAN",
                              },
                              "↳Show Content Small#1053:13": {
                                value: false,
                                type: "BOOLEAN",
                              },
                              "Show Icon#1053:11": {
                                value: false,
                                type: "BOOLEAN",
                              },
                              "Show Text#3122:8": {
                                value: true,
                                type: "BOOLEAN",
                              },
                              "↳Show Title Small#1053:12": {
                                value: false,
                                type: "BOOLEAN",
                              },
                              "↳Show Content#1053:10": {
                                value: true,
                                type: "BOOLEAN",
                              },
                              "↳Show Clarification#1053:7": {
                                value: false,
                                type: "BOOLEAN",
                              },
                              "↳Swap Icon#1053:8": {
                                value: "2033:1462",
                                type: "INSTANCE_SWAP",
                                preferredValues: [],
                              },
                              Alignment: {
                                value: "ImageLeft-Middle",
                                type: "VARIANT",
                                boundVariables: {},
                              },
                            },
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19664",
                                overriddenFields: [
                                  "componentProperties",
                                  "primaryAxisSizingMode",
                                  "layoutGrow",
                                  "counterAxisSizingMode",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19664;1202:3056",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19664;1202:3052",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19664;1202:3054",
                                overriddenFields: [
                                  "layoutAlign",
                                  "sharedPluginData",
                                  "pluginData",
                                  "componentProperties",
                                  "counterAxisSizingMode",
                                  "layoutGrow",
                                  "paddingRight",
                                  "paddingLeft",
                                  "primaryAxisSizingMode",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19664;1202:3055",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19664;1202:3050;1856:4",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19664;1202:3053",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [
                              {
                                id: "I2099:38616;1739:34917;2326:19664;1202:3050",
                                name: "Placeholder",
                                visible: false,
                                type: "INSTANCE",
                                scrollBehavior: "SCROLLS",
                                componentPropertyReferences: {
                                  mainComponent: "↳Swap Icon#1053:8",
                                  visible: "Show Icon#1053:11",
                                },
                                boundVariables: {
                                  size: {
                                    x: {
                                      type: "VARIABLE_ALIAS",
                                      id: "VariableID:1b137df291c4095c5e80c61d2c69a449cba2ccd9/3157:87",
                                    },
                                    y: {
                                      type: "VARIABLE_ALIAS",
                                      id: "VariableID:1b137df291c4095c5e80c61d2c69a449cba2ccd9/3157:87",
                                    },
                                  },
                                },
                                explicitVariableModes: {
                                  "VariableCollectionId:e2fa2f7f8d460f250b4a1269b312f661b543be85/443:278":
                                    "146:9",
                                },
                                componentId: "2033:1462",
                                isExposedInstance: true,
                                overrides: [
                                  {
                                    id: "I2099:38616;1739:34917;2326:19664;1202:3050;1856:4",
                                    overriddenFields: [
                                      "sharedPluginData",
                                      "pluginData",
                                    ],
                                  },
                                ],
                                children: [],
                                blendMode: "PASS_THROUGH",
                                clipsContent: false,
                                background: [],
                                fills: [],
                                strokes: [],
                                strokeWeight: 1,
                                strokeAlign: "INSIDE",
                                backgroundColor: {
                                  r: 0,
                                  g: 0,
                                  b: 0,
                                  a: 0,
                                },
                                absoluteBoundingBox: {
                                  x: -1720,
                                  y: -2177.75,
                                  width: 37.5,
                                  height: 37.5,
                                },
                                absoluteRenderBounds: null,
                                constraints: {
                                  vertical: "TOP",
                                  horizontal: "LEFT",
                                },
                                layoutAlign: "INHERIT",
                                layoutGrow: 0,
                                layoutSizingHorizontal: "FIXED",
                                layoutSizingVertical: "FIXED",
                                effects: [],
                                interactions: [],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19664;1202:3051",
                                name: "Text",
                                type: "FRAME",
                                scrollBehavior: "SCROLLS",
                                componentPropertyReferences: {
                                  visible: "Show Text#3122:8",
                                },
                                boundVariables: {
                                  itemSpacing: {
                                    type: "VARIABLE_ALIAS",
                                    id: "VariableID:61bc0ffe4bb813f939fb25252ec1ae428556cc4e/10419:0",
                                  },
                                },
                                children: [
                                  {
                                    id: "I2099:38616;1739:34917;2326:19664;1202:3052",
                                    name: "TitleBig",
                                    visible: false,
                                    type: "INSTANCE",
                                    scrollBehavior: "SCROLLS",
                                    componentPropertyReferences: {
                                      visible: "↳Show Title Big#1053:9",
                                    },
                                    componentId: "2033:2259",
                                    isExposedInstance: true,
                                    componentProperties: {
                                      "Title Label#1366:0": {
                                        value: "Title big text",
                                        type: "TEXT",
                                      },
                                    },
                                    overrides: [
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3052",
                                        overriddenFields: [
                                          "sharedPluginData",
                                          "pluginData",
                                        ],
                                      },
                                    ],
                                    children: [],
                                    blendMode: "PASS_THROUGH",
                                    clipsContent: false,
                                    background: [],
                                    fills: [],
                                    strokes: [],
                                    strokeWeight: 1,
                                    strokeAlign: "INSIDE",
                                    backgroundColor: {
                                      r: 0,
                                      g: 0,
                                      b: 0,
                                      a: 0,
                                    },
                                    layoutMode: "HORIZONTAL",
                                    primaryAxisSizingMode: "FIXED",
                                    counterAxisAlignItems: "CENTER",
                                    primaryAxisAlignItems: "CENTER",
                                    layoutWrap: "NO_WRAP",
                                    absoluteBoundingBox: {
                                      x: -1720,
                                      y: -2177.75,
                                      width: 321.5,
                                      height: 32,
                                    },
                                    absoluteRenderBounds: null,
                                    constraints: {
                                      vertical: "TOP",
                                      horizontal: "LEFT",
                                    },
                                    layoutAlign: "STRETCH",
                                    layoutGrow: 0,
                                    layoutSizingHorizontal: "FIXED",
                                    layoutSizingVertical: "HUG",
                                    effects: [],
                                    interactions: [],
                                  },
                                  {
                                    id: "I2099:38616;1739:34917;2326:19664;1202:3053",
                                    name: "TitleSmall",
                                    visible: false,
                                    type: "INSTANCE",
                                    scrollBehavior: "SCROLLS",
                                    componentPropertyReferences: {
                                      visible: "↳Show Title Small#1053:12",
                                    },
                                    boundVariables: {
                                      itemSpacing: {
                                        type: "VARIABLE_ALIAS",
                                        id: "VariableID:61bc0ffe4bb813f939fb25252ec1ae428556cc4e/10419:0",
                                      },
                                    },
                                    componentId: "2058:19206",
                                    isExposedInstance: true,
                                    componentProperties: {
                                      "Title small Label#1366:1": {
                                        value: "Title small text",
                                        type: "TEXT",
                                      },
                                    },
                                    overrides: [
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3053",
                                        overriddenFields: [
                                          "sharedPluginData",
                                          "pluginData",
                                        ],
                                      },
                                    ],
                                    children: [],
                                    blendMode: "PASS_THROUGH",
                                    clipsContent: false,
                                    background: [],
                                    fills: [],
                                    strokes: [],
                                    strokeWeight: 1,
                                    strokeAlign: "INSIDE",
                                    backgroundColor: {
                                      r: 0,
                                      g: 0,
                                      b: 0,
                                      a: 0,
                                    },
                                    layoutMode: "VERTICAL",
                                    counterAxisSizingMode: "FIXED",
                                    itemSpacing: 18,
                                    counterAxisAlignItems: "CENTER",
                                    primaryAxisAlignItems: "CENTER",
                                    layoutWrap: "NO_WRAP",
                                    absoluteBoundingBox: {
                                      x: -1720,
                                      y: -2177.75,
                                      width: 321.5,
                                      height: 26,
                                    },
                                    absoluteRenderBounds: null,
                                    constraints: {
                                      vertical: "TOP",
                                      horizontal: "LEFT",
                                    },
                                    layoutAlign: "STRETCH",
                                    layoutGrow: 0,
                                    layoutSizingHorizontal: "FIXED",
                                    layoutSizingVertical: "HUG",
                                    effects: [],
                                    interactions: [],
                                  },
                                  {
                                    id: "I2099:38616;1739:34917;2326:19664;1202:3054",
                                    name: "Content",
                                    type: "INSTANCE",
                                    scrollBehavior: "SCROLLS",
                                    componentPropertyReferences: {
                                      visible: "↳Show Content#1053:10",
                                    },
                                    boundVariables: {
                                      itemSpacing: {
                                        type: "VARIABLE_ALIAS",
                                        id: "VariableID:61bc0ffe4bb813f939fb25252ec1ae428556cc4e/10419:0",
                                      },
                                    },
                                    componentId: "2058:19212",
                                    isExposedInstance: true,
                                    componentProperties: {
                                      "Content Label#1366:2": {
                                        value:
                                          "You can send a fax to the dialed number or manually receive a fax by selecting one of these options.",
                                        type: "TEXT",
                                      },
                                    },
                                    overrides: [
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3054",
                                        overriddenFields: [
                                          "layoutAlign",
                                          "sharedPluginData",
                                          "pluginData",
                                          "componentProperties",
                                          "counterAxisSizingMode",
                                          "layoutGrow",
                                          "paddingRight",
                                          "paddingLeft",
                                          "primaryAxisSizingMode",
                                        ],
                                      },
                                    ],
                                    children: [
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3054;1053:1206",
                                        name: "Content",
                                        type: "TEXT",
                                        scrollBehavior: "SCROLLS",
                                        componentPropertyReferences: {
                                          characters: "Content Label#1366:2",
                                        },
                                        boundVariables: {
                                          fills: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                            },
                                          ],
                                          lineHeight: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:7458686840ba6bbe67d34048518a37290df777ed/4411:711",
                                            },
                                          ],
                                          fontFamily: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:f698a4f032592c139aea25637f9791852d11c35b/1203:148",
                                            },
                                          ],
                                          fontSize: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:5926de5ea9f1df6a583324845256eec3e10058d8/3157:790",
                                            },
                                          ],
                                        },
                                        blendMode: "PASS_THROUGH",
                                        fills: [
                                          {
                                            blendMode: "NORMAL",
                                            type: "SOLID",
                                            color: {
                                              r: 1,
                                              g: 1,
                                              b: 1,
                                              a: 1,
                                            },
                                            boundVariables: {
                                              color: {
                                                type: "VARIABLE_ALIAS",
                                                id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                              },
                                            },
                                          },
                                        ],
                                        strokes: [],
                                        strokeWeight: 1,
                                        strokeAlign: "OUTSIDE",
                                        absoluteBoundingBox: {
                                          x: -1710,
                                          y: -2177.75,
                                          width: 707.5,
                                          height: 62,
                                        },
                                        absoluteRenderBounds: {
                                          x: -1709.5155029296875,
                                          y: -2171.339599609375,
                                          width: 681.0682373046875,
                                          height: 53.128662109375,
                                        },
                                        constraints: {
                                          vertical: "TOP",
                                          horizontal: "LEFT",
                                        },
                                        layoutAlign: "STRETCH",
                                        layoutGrow: 0,
                                        layoutSizingHorizontal: "FILL",
                                        layoutSizingVertical: "HUG",
                                        characters:
                                          "You can send a fax to the dialed number or manually receive a fax by selecting one of these options.",
                                        characterStyleOverrides: [],
                                        styleOverrideTable: {},
                                        lineTypes: ["NONE"],
                                        lineIndentations: [0],
                                        style: {
                                          fontFamily: "HP Simplified",
                                          fontPostScriptName:
                                            "HPSimplified-Regular",
                                          fontStyle: "Regular",
                                          fontWeight: 400,
                                          textAutoResize: "HEIGHT",
                                          fontSize: 25.5,
                                          textAlignHorizontal: "LEFT",
                                          textAlignVertical: "TOP",
                                          letterSpacing: 0,
                                          lineHeightPx: 30.600000381469727,
                                          lineHeightPercent: 103.53753662109375,
                                          lineHeightPercentFontSize: 120,
                                          lineHeightUnit: "PIXELS",
                                        },
                                        layoutVersion: 4,
                                        styles: {
                                          text: "2022:10407",
                                        },
                                        effects: [],
                                        interactions: [],
                                      },
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3054;1202:1256",
                                        name: "Content",
                                        visible: false,
                                        type: "TEXT",
                                        scrollBehavior: "SCROLLS",
                                        boundVariables: {
                                          fills: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                            },
                                          ],
                                          lineHeight: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:7458686840ba6bbe67d34048518a37290df777ed/4411:711",
                                            },
                                          ],
                                          fontFamily: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:f698a4f032592c139aea25637f9791852d11c35b/1203:148",
                                            },
                                          ],
                                          fontSize: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:5926de5ea9f1df6a583324845256eec3e10058d8/3157:790",
                                            },
                                          ],
                                        },
                                        blendMode: "PASS_THROUGH",
                                        fills: [
                                          {
                                            blendMode: "NORMAL",
                                            type: "SOLID",
                                            color: {
                                              r: 1,
                                              g: 1,
                                              b: 1,
                                              a: 1,
                                            },
                                            boundVariables: {
                                              color: {
                                                type: "VARIABLE_ALIAS",
                                                id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                              },
                                            },
                                          },
                                        ],
                                        strokes: [],
                                        strokeWeight: 1,
                                        strokeAlign: "OUTSIDE",
                                        absoluteBoundingBox: {
                                          x: -1720,
                                          y: -2132.75,
                                          width: 216,
                                          height: 31,
                                        },
                                        absoluteRenderBounds: null,
                                        constraints: {
                                          vertical: "TOP",
                                          horizontal: "LEFT",
                                        },
                                        layoutAlign: "STRETCH",
                                        layoutGrow: 0,
                                        layoutSizingHorizontal: "FIXED",
                                        layoutSizingVertical: "FIXED",
                                        characters: "Content text",
                                        characterStyleOverrides: [],
                                        styleOverrideTable: {},
                                        lineTypes: ["NONE"],
                                        lineIndentations: [0],
                                        style: {
                                          fontFamily: "HP Simplified",
                                          fontPostScriptName:
                                            "HPSimplified-Regular",
                                          fontStyle: "Regular",
                                          fontWeight: 400,
                                          textAutoResize: "HEIGHT",
                                          fontSize: 25.5,
                                          textAlignHorizontal: "LEFT",
                                          textAlignVertical: "TOP",
                                          letterSpacing: 0,
                                          lineHeightPx: 30.600000381469727,
                                          lineHeightPercent: 103.53753662109375,
                                          lineHeightPercentFontSize: 120,
                                          lineHeightUnit: "PIXELS",
                                        },
                                        layoutVersion: 4,
                                        styles: {
                                          text: "2022:10407",
                                        },
                                        effects: [],
                                        interactions: [],
                                      },
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3054;1202:1267",
                                        name: "Content",
                                        visible: false,
                                        type: "TEXT",
                                        scrollBehavior: "SCROLLS",
                                        boundVariables: {
                                          fills: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                            },
                                          ],
                                          lineHeight: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:7458686840ba6bbe67d34048518a37290df777ed/4411:711",
                                            },
                                          ],
                                          fontFamily: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:f698a4f032592c139aea25637f9791852d11c35b/1203:148",
                                            },
                                          ],
                                          fontSize: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:5926de5ea9f1df6a583324845256eec3e10058d8/3157:790",
                                            },
                                          ],
                                        },
                                        blendMode: "PASS_THROUGH",
                                        fills: [
                                          {
                                            blendMode: "NORMAL",
                                            type: "SOLID",
                                            color: {
                                              r: 1,
                                              g: 1,
                                              b: 1,
                                              a: 1,
                                            },
                                            boundVariables: {
                                              color: {
                                                type: "VARIABLE_ALIAS",
                                                id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                              },
                                            },
                                          },
                                        ],
                                        strokes: [],
                                        strokeWeight: 1,
                                        strokeAlign: "OUTSIDE",
                                        absoluteBoundingBox: {
                                          x: -1720,
                                          y: -2132.75,
                                          width: 216,
                                          height: 31,
                                        },
                                        absoluteRenderBounds: null,
                                        constraints: {
                                          vertical: "TOP",
                                          horizontal: "LEFT",
                                        },
                                        layoutAlign: "STRETCH",
                                        layoutGrow: 0,
                                        layoutSizingHorizontal: "FIXED",
                                        layoutSizingVertical: "FIXED",
                                        characters: "Content text",
                                        characterStyleOverrides: [],
                                        styleOverrideTable: {},
                                        lineTypes: ["NONE"],
                                        lineIndentations: [0],
                                        style: {
                                          fontFamily: "HP Simplified",
                                          fontPostScriptName:
                                            "HPSimplified-Regular",
                                          fontStyle: "Regular",
                                          fontWeight: 400,
                                          textAutoResize: "HEIGHT",
                                          fontSize: 25.5,
                                          textAlignHorizontal: "LEFT",
                                          textAlignVertical: "TOP",
                                          letterSpacing: 0,
                                          lineHeightPx: 30.600000381469727,
                                          lineHeightPercent: 103.53753662109375,
                                          lineHeightPercentFontSize: 120,
                                          lineHeightUnit: "PIXELS",
                                        },
                                        layoutVersion: 4,
                                        styles: {
                                          text: "2022:10407",
                                        },
                                        effects: [],
                                        interactions: [],
                                      },
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3054;1202:1283",
                                        name: "Content",
                                        visible: false,
                                        type: "TEXT",
                                        scrollBehavior: "SCROLLS",
                                        boundVariables: {
                                          fills: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                            },
                                          ],
                                          lineHeight: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:7458686840ba6bbe67d34048518a37290df777ed/4411:711",
                                            },
                                          ],
                                          fontFamily: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:f698a4f032592c139aea25637f9791852d11c35b/1203:148",
                                            },
                                          ],
                                          fontSize: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:5926de5ea9f1df6a583324845256eec3e10058d8/3157:790",
                                            },
                                          ],
                                        },
                                        blendMode: "PASS_THROUGH",
                                        fills: [
                                          {
                                            blendMode: "NORMAL",
                                            type: "SOLID",
                                            color: {
                                              r: 1,
                                              g: 1,
                                              b: 1,
                                              a: 1,
                                            },
                                            boundVariables: {
                                              color: {
                                                type: "VARIABLE_ALIAS",
                                                id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                              },
                                            },
                                          },
                                        ],
                                        strokes: [],
                                        strokeWeight: 1,
                                        strokeAlign: "OUTSIDE",
                                        absoluteBoundingBox: {
                                          x: -1720,
                                          y: -2132.75,
                                          width: 216,
                                          height: 31,
                                        },
                                        absoluteRenderBounds: null,
                                        constraints: {
                                          vertical: "TOP",
                                          horizontal: "LEFT",
                                        },
                                        layoutAlign: "STRETCH",
                                        layoutGrow: 0,
                                        layoutSizingHorizontal: "FIXED",
                                        layoutSizingVertical: "FIXED",
                                        characters: "Content text",
                                        characterStyleOverrides: [],
                                        styleOverrideTable: {},
                                        lineTypes: ["NONE"],
                                        lineIndentations: [0],
                                        style: {
                                          fontFamily: "HP Simplified",
                                          fontPostScriptName:
                                            "HPSimplified-Regular",
                                          fontStyle: "Regular",
                                          fontWeight: 400,
                                          textAutoResize: "HEIGHT",
                                          fontSize: 25.5,
                                          textAlignHorizontal: "LEFT",
                                          textAlignVertical: "TOP",
                                          letterSpacing: 0,
                                          lineHeightPx: 30.600000381469727,
                                          lineHeightPercent: 103.53753662109375,
                                          lineHeightPercentFontSize: 120,
                                          lineHeightUnit: "PIXELS",
                                        },
                                        layoutVersion: 4,
                                        styles: {
                                          text: "2022:10407",
                                        },
                                        effects: [],
                                        interactions: [],
                                      },
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3054;1202:1304",
                                        name: "Content",
                                        visible: false,
                                        type: "TEXT",
                                        scrollBehavior: "SCROLLS",
                                        boundVariables: {
                                          fills: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                            },
                                          ],
                                          lineHeight: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:7458686840ba6bbe67d34048518a37290df777ed/4411:711",
                                            },
                                          ],
                                          fontFamily: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:f698a4f032592c139aea25637f9791852d11c35b/1203:148",
                                            },
                                          ],
                                          fontSize: [
                                            {
                                              type: "VARIABLE_ALIAS",
                                              id: "VariableID:5926de5ea9f1df6a583324845256eec3e10058d8/3157:790",
                                            },
                                          ],
                                        },
                                        blendMode: "PASS_THROUGH",
                                        fills: [
                                          {
                                            blendMode: "NORMAL",
                                            type: "SOLID",
                                            color: {
                                              r: 1,
                                              g: 1,
                                              b: 1,
                                              a: 1,
                                            },
                                            boundVariables: {
                                              color: {
                                                type: "VARIABLE_ALIAS",
                                                id: "VariableID:e208fc12668fdb73b1d1a743ba7f06ef9dd690ba/2013:512",
                                              },
                                            },
                                          },
                                        ],
                                        strokes: [],
                                        strokeWeight: 1,
                                        strokeAlign: "OUTSIDE",
                                        absoluteBoundingBox: {
                                          x: -1720,
                                          y: -2132.75,
                                          width: 216,
                                          height: 31,
                                        },
                                        absoluteRenderBounds: null,
                                        constraints: {
                                          vertical: "TOP",
                                          horizontal: "LEFT",
                                        },
                                        layoutAlign: "STRETCH",
                                        layoutGrow: 0,
                                        layoutSizingHorizontal: "FIXED",
                                        layoutSizingVertical: "FIXED",
                                        characters: "Content text",
                                        characterStyleOverrides: [],
                                        styleOverrideTable: {},
                                        lineTypes: ["NONE"],
                                        lineIndentations: [0],
                                        style: {
                                          fontFamily: "HP Simplified",
                                          fontPostScriptName:
                                            "HPSimplified-Regular",
                                          fontStyle: "Regular",
                                          fontWeight: 400,
                                          textAutoResize: "HEIGHT",
                                          fontSize: 25.5,
                                          textAlignHorizontal: "LEFT",
                                          textAlignVertical: "TOP",
                                          letterSpacing: 0,
                                          lineHeightPx: 30.600000381469727,
                                          lineHeightPercent: 103.53753662109375,
                                          lineHeightPercentFontSize: 120,
                                          lineHeightUnit: "PIXELS",
                                        },
                                        layoutVersion: 4,
                                        styles: {
                                          text: "2022:10407",
                                        },
                                        effects: [],
                                        interactions: [],
                                      },
                                    ],
                                    blendMode: "PASS_THROUGH",
                                    clipsContent: false,
                                    background: [],
                                    fills: [],
                                    strokes: [],
                                    strokeWeight: 1,
                                    strokeAlign: "INSIDE",
                                    backgroundColor: {
                                      r: 0,
                                      g: 0,
                                      b: 0,
                                      a: 0,
                                    },
                                    layoutMode: "VERTICAL",
                                    counterAxisSizingMode: "FIXED",
                                    itemSpacing: 18,
                                    counterAxisAlignItems: "CENTER",
                                    primaryAxisAlignItems: "CENTER",
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    layoutWrap: "NO_WRAP",
                                    absoluteBoundingBox: {
                                      x: -1720,
                                      y: -2177.75,
                                      width: 727.5,
                                      height: 62,
                                    },
                                    absoluteRenderBounds: {
                                      x: -1720,
                                      y: -2177.75,
                                      width: 727.5,
                                      height: 62,
                                    },
                                    constraints: {
                                      vertical: "TOP",
                                      horizontal: "LEFT",
                                    },
                                    layoutAlign: "STRETCH",
                                    layoutGrow: 0,
                                    layoutSizingHorizontal: "FILL",
                                    layoutSizingVertical: "HUG",
                                    effects: [],
                                    interactions: [],
                                  },
                                  {
                                    id: "I2099:38616;1739:34917;2326:19664;1202:3055",
                                    name: "ContentSmall",
                                    visible: false,
                                    type: "INSTANCE",
                                    scrollBehavior: "SCROLLS",
                                    componentPropertyReferences: {
                                      visible: "↳Show Content Small#1053:13",
                                    },
                                    boundVariables: {
                                      itemSpacing: {
                                        type: "VARIABLE_ALIAS",
                                        id: "VariableID:61bc0ffe4bb813f939fb25252ec1ae428556cc4e/10419:0",
                                      },
                                    },
                                    componentId: "2058:19218",
                                    isExposedInstance: true,
                                    componentProperties: {
                                      "Content Small Label#1366:3": {
                                        value: "Content small text",
                                        type: "TEXT",
                                      },
                                    },
                                    overrides: [
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3055",
                                        overriddenFields: [
                                          "sharedPluginData",
                                          "pluginData",
                                        ],
                                      },
                                    ],
                                    children: [],
                                    blendMode: "PASS_THROUGH",
                                    clipsContent: false,
                                    background: [],
                                    fills: [],
                                    strokes: [],
                                    strokeWeight: 1,
                                    strokeAlign: "INSIDE",
                                    backgroundColor: {
                                      r: 0,
                                      g: 0,
                                      b: 0,
                                      a: 0,
                                    },
                                    layoutMode: "VERTICAL",
                                    counterAxisSizingMode: "FIXED",
                                    itemSpacing: 18,
                                    counterAxisAlignItems: "CENTER",
                                    primaryAxisAlignItems: "CENTER",
                                    layoutWrap: "NO_WRAP",
                                    absoluteBoundingBox: {
                                      x: -1720,
                                      y: -2132.75,
                                      width: 321.5,
                                      height: 20,
                                    },
                                    absoluteRenderBounds: null,
                                    constraints: {
                                      vertical: "TOP",
                                      horizontal: "LEFT",
                                    },
                                    layoutAlign: "STRETCH",
                                    layoutGrow: 0,
                                    layoutSizingHorizontal: "FIXED",
                                    layoutSizingVertical: "HUG",
                                    effects: [],
                                    interactions: [],
                                  },
                                  {
                                    id: "I2099:38616;1739:34917;2326:19664;1202:3056",
                                    name: "Clarification",
                                    visible: false,
                                    type: "INSTANCE",
                                    scrollBehavior: "SCROLLS",
                                    componentPropertyReferences: {
                                      visible: "↳Show Clarification#1053:7",
                                    },
                                    boundVariables: {
                                      itemSpacing: {
                                        type: "VARIABLE_ALIAS",
                                        id: "VariableID:61bc0ffe4bb813f939fb25252ec1ae428556cc4e/10419:0",
                                      },
                                    },
                                    componentId: "2058:19224",
                                    isExposedInstance: true,
                                    componentProperties: {
                                      "Clarification Label#1366:4": {
                                        value: "Clarification text",
                                        type: "TEXT",
                                      },
                                    },
                                    overrides: [
                                      {
                                        id: "I2099:38616;1739:34917;2326:19664;1202:3056",
                                        overriddenFields: [
                                          "sharedPluginData",
                                          "pluginData",
                                        ],
                                      },
                                    ],
                                    children: [],
                                    blendMode: "PASS_THROUGH",
                                    clipsContent: false,
                                    background: [],
                                    fills: [],
                                    strokes: [],
                                    strokeWeight: 1,
                                    strokeAlign: "INSIDE",
                                    backgroundColor: {
                                      r: 0,
                                      g: 0,
                                      b: 0,
                                      a: 0,
                                    },
                                    layoutMode: "VERTICAL",
                                    counterAxisSizingMode: "FIXED",
                                    itemSpacing: 18,
                                    counterAxisAlignItems: "CENTER",
                                    primaryAxisAlignItems: "CENTER",
                                    layoutWrap: "NO_WRAP",
                                    absoluteBoundingBox: {
                                      x: -1720,
                                      y: -2132.75,
                                      width: 321.5,
                                      height: 20,
                                    },
                                    absoluteRenderBounds: null,
                                    constraints: {
                                      vertical: "TOP",
                                      horizontal: "LEFT",
                                    },
                                    layoutAlign: "STRETCH",
                                    layoutGrow: 0,
                                    layoutSizingHorizontal: "FIXED",
                                    layoutSizingVertical: "HUG",
                                    effects: [],
                                    interactions: [],
                                  },
                                ],
                                blendMode: "PASS_THROUGH",
                                clipsContent: false,
                                background: [],
                                fills: [],
                                strokes: [],
                                strokeWeight: 1,
                                strokeAlign: "INSIDE",
                                backgroundColor: {
                                  r: 0,
                                  g: 0,
                                  b: 0,
                                  a: 0,
                                },
                                layoutMode: "VERTICAL",
                                counterAxisSizingMode: "FIXED",
                                itemSpacing: 18,
                                primaryAxisAlignItems: "CENTER",
                                layoutWrap: "NO_WRAP",
                                absoluteBoundingBox: {
                                  x: -1720,
                                  y: -2177.75,
                                  width: 727.5,
                                  height: 62,
                                },
                                absoluteRenderBounds: {
                                  x: -1720,
                                  y: -2177.75,
                                  width: 727.5,
                                  height: 62,
                                },
                                constraints: {
                                  vertical: "TOP",
                                  horizontal: "LEFT",
                                },
                                layoutAlign: "INHERIT",
                                layoutGrow: 1,
                                layoutSizingHorizontal: "FILL",
                                layoutSizingVertical: "HUG",
                                effects: [],
                                interactions: [],
                              },
                            ],
                            blendMode: "PASS_THROUGH",
                            clipsContent: false,
                            background: [],
                            fills: [],
                            strokes: [],
                            strokeWeight: 1,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            layoutMode: "HORIZONTAL",
                            itemSpacing: 15,
                            primaryAxisSizingMode: "FIXED",
                            counterAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            absoluteBoundingBox: {
                              x: -1720,
                              y: -2177.75,
                              width: 727.5,
                              height: 62,
                            },
                            absoluteRenderBounds: {
                              x: -1720,
                              y: -2177.75,
                              width: 727.5,
                              height: 62,
                            },
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 1,
                            minWidth: 37.5,
                            layoutSizingHorizontal: "FILL",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19667",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19667",
                                overriddenFields: ["visible"],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19667;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1678.5,
                              y: -2177.75,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19670",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19670",
                                overriddenFields: ["visible"],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19670;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1564,
                              y: -2177.75,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19688",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19688",
                                overriddenFields: ["visible"],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19688;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1907.5,
                              y: -2122.25,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19691",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19691",
                                overriddenFields: ["visible"],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19691;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1793,
                              y: -2122.25,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19694",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19694;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19694",
                                overriddenFields: ["visible"],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1678.5,
                              y: -2122.25,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19673",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19673;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19673",
                                overriddenFields: ["visible"],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1564,
                              y: -2122.25,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19697",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19697",
                                overriddenFields: ["visible"],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19697;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1907.5,
                              y: -2066.75,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19700",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19700",
                                overriddenFields: ["visible"],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19700;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1793,
                              y: -2066.75,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19703",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19703",
                                overriddenFields: ["visible"],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19703;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1678.5,
                              y: -2066.75,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                          {
                            id: "I2099:38616;1739:34917;2326:19706",
                            name: "Slot",
                            visible: false,
                            type: "INSTANCE",
                            scrollBehavior: "SCROLLS",
                            componentId: "2060:58189",
                            overrides: [
                              {
                                id: "I2099:38616;1739:34917;2326:19706",
                                overriddenFields: ["visible"],
                              },
                              {
                                id: "I2099:38616;1739:34917;2326:19706;979:10619",
                                overriddenFields: [
                                  "sharedPluginData",
                                  "pluginData",
                                ],
                              },
                            ],
                            children: [],
                            blendMode: "PASS_THROUGH",
                            clipsContent: true,
                            background: [],
                            fills: [],
                            strokes: [],
                            cornerRadius: 4,
                            cornerSmoothing: 0,
                            strokeWeight: 2,
                            strokeAlign: "INSIDE",
                            backgroundColor: {
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0,
                            },
                            overflowDirection: "VERTICAL_SCROLLING",
                            layoutMode: "HORIZONTAL",
                            counterAxisAlignItems: "CENTER",
                            primaryAxisAlignItems: "CENTER",
                            layoutWrap: "NO_WRAP",
                            strokeDashes: [8, 4],
                            absoluteBoundingBox: {
                              x: -1564,
                              y: -2066.75,
                              width: 98,
                              height: 39,
                            },
                            absoluteRenderBounds: null,
                            constraints: {
                              vertical: "TOP",
                              horizontal: "LEFT",
                            },
                            layoutAlign: "INHERIT",
                            layoutGrow: 0,
                            layoutSizingHorizontal: "HUG",
                            layoutSizingVertical: "HUG",
                            effects: [],
                            interactions: [],
                          },
                        ],
                        blendMode: "PASS_THROUGH",
                        clipsContent: false,
                        background: [],
                        fills: [],
                        strokes: [],
                        strokeWeight: 1,
                        strokeAlign: "INSIDE",
                        backgroundColor: {
                          r: 0,
                          g: 0,
                          b: 0,
                          a: 0,
                        },
                        layoutMode: "HORIZONTAL",
                        itemSpacing: 37.5,
                        primaryAxisSizingMode: "FIXED",
                        layoutWrap: "WRAP",
                        counterAxisSpacing: 37.5,
                        counterAxisAlignContent: "AUTO",
                        absoluteBoundingBox: {
                          x: -1907.5,
                          y: -2177.75,
                          width: 915,
                          height: 150,
                        },
                        absoluteRenderBounds: {
                          x: -1907.5,
                          y: -2177.75,
                          width: 915,
                          height: 150,
                        },
                        constraints: {
                          vertical: "TOP",
                          horizontal: "LEFT",
                        },
                        layoutAlign: "STRETCH",
                        layoutGrow: 0,
                        layoutSizingHorizontal: "FILL",
                        layoutSizingVertical: "HUG",
                        effects: [],
                        interactions: [],
                        uniqueName: "Row",
                        width: 915,
                        height: 150,
                        x: 0,
                        y: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        primaryAxisAlignItems: "MIN",
                        counterAxisAlignItems: "MIN",
                      },
                    ],
                    blendMode: "PASS_THROUGH",
                    clipsContent: true,
                    background: [],
                    fills: [],
                    strokes: [],
                    strokeWeight: 1,
                    strokeAlign: "INSIDE",
                    backgroundColor: {
                      r: 0,
                      g: 0,
                      b: 0,
                      a: 0,
                    },
                    layoutMode: "VERTICAL",
                    counterAxisSizingMode: "FIXED",
                    itemSpacing: 37.5,
                    layoutWrap: "NO_WRAP",
                    absoluteBoundingBox: {
                      x: -1907.5,
                      y: -2177.75,
                      width: 915,
                      height: 150,
                    },
                    absoluteRenderBounds: {
                      x: -1907.5,
                      y: -2177.75,
                      width: 915,
                      height: 150,
                    },
                    constraints: {
                      vertical: "TOP",
                      horizontal: "LEFT",
                    },
                    layoutAlign: "STRETCH",
                    layoutGrow: 0,
                    layoutSizingHorizontal: "FILL",
                    layoutSizingVertical: "HUG",
                    effects: [],
                    interactions: [],
                    uniqueName: "Grid",
                    width: 915,
                    height: 150,
                    x: 22.5,
                    y: 22.5,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    primaryAxisAlignItems: "MIN",
                    counterAxisAlignItems: "MIN",
                  },
                ],
                blendMode: "PASS_THROUGH",
                clipsContent: false,
                background: [],
                fills: [],
                strokes: [],
                strokeWeight: 1,
                strokeAlign: "INSIDE",
                backgroundColor: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0,
                },
                overflowDirection: "VERTICAL_SCROLLING",
                layoutMode: "VERTICAL",
                counterAxisSizingMode: "FIXED",
                itemSpacing: 37.5,
                primaryAxisSizingMode: "FIXED",
                paddingLeft: 22.5,
                paddingRight: 22.5,
                paddingTop: 22.5,
                paddingBottom: 22.5,
                layoutWrap: "NO_WRAP",
                absoluteBoundingBox: {
                  x: -1930,
                  y: -2200.25,
                  width: 960,
                  height: 536.25,
                },
                absoluteRenderBounds: {
                  x: -1930,
                  y: -2200.25,
                  width: 960,
                  height: 536.25,
                },
                constraints: {
                  vertical: "TOP",
                  horizontal: "LEFT",
                },
                layoutAlign: "STRETCH",
                layoutGrow: 1,
                minHeight: 136.25,
                maxHeight: 536.25,
                layoutSizingHorizontal: "FILL",
                layoutSizingVertical: "FILL",
                effects: [],
                interactions: [],
                uniqueName: "Modal Container",
                variantProperties: {
                  Type: "Fixed",
                  Allignment: "Default (L-R)",
                },
                width: 960,
                height: 536.25,
                x: 0,
                y: 0,
                primaryAxisAlignItems: "MIN",
                counterAxisAlignItems: "MIN",
              },
              {
                id: "I2099:38616;1739:61707",
                name: "Scroll Container",
                type: "INSTANCE",
                locked: true,
                scrollBehavior: "SCROLLS",
                componentPropertyReferences: {
                  visible: "↳Show Scroll Container#1739:42",
                },
                componentId: "438:9274",
                componentProperties: {
                  "Show Top Gradient#1272:20": {
                    value: false,
                    type: "BOOLEAN",
                  },
                  "Show Bottom Gradient#1272:19": {
                    value: true,
                    type: "BOOLEAN",
                  },
                  "Show Container Bullets#2778:4": {
                    value: true,
                    type: "BOOLEAN",
                  },
                  "Show Left Gradient#1359:0": {
                    value: false,
                    type: "BOOLEAN",
                  },
                  "Show Right Gradient#1359:4": {
                    value: true,
                    type: "BOOLEAN",
                  },
                  "Show Scrollbar#1272:18": {
                    value: true,
                    type: "BOOLEAN",
                  },
                  "Show V Scrollbar#1359:8": {
                    value: true,
                    type: "BOOLEAN",
                  },
                  "Show H Scrollbar#1359:12": {
                    value: true,
                    type: "BOOLEAN",
                  },
                  Variation: {
                    value: "Vertical",
                    type: "VARIANT",
                    boundVariables: {},
                  },
                },
                overrides: [],
                children: [
                  {
                    id: "I2099:38616;1739:61707;548:24039",
                    name: "Gradient Top",
                    visible: false,
                    type: "RECTANGLE",
                    scrollBehavior: "SCROLLS",
                    componentPropertyReferences: {
                      visible: "Show Top Gradient#1272:20",
                    },
                    boundVariables: {
                      size: {
                        y: {
                          type: "VARIABLE_ALIAS",
                          id: "VariableID:7de17999810183e2464dbfd32573c3ecf15a9f2e/3157:462",
                        },
                      },
                      fills: [
                        {
                          type: "VARIABLE_ALIAS",
                          id: "VariableID:26724dcbb1ea60587379f89ef3dc160ae7f7f7da/2022:241",
                        },
                        {
                          type: "VARIABLE_ALIAS",
                          id: "VariableID:86e61e4b2a2fe9ab507a9302544920d38675a086/2036:2",
                        },
                      ],
                    },
                    blendMode: "PASS_THROUGH",
                    fills: [
                      {
                        blendMode: "NORMAL",
                        type: "GRADIENT_LINEAR",
                        gradientHandlePositions: [
                          {
                            x: 0.5,
                            y: -3.0616171314629196e-17,
                          },
                          {
                            x: 0.5,
                            y: 0.9999999999999999,
                          },
                          {
                            x: 0,
                            y: 0,
                          },
                        ],
                        gradientStops: [
                          {
                            color: {
                              r: 0.0784313753247261,
                              g: 0.0784313753247261,
                              b: 0.0784313753247261,
                              a: 1,
                            },
                            position: 0,
                            boundVariables: {
                              color: {
                                type: "VARIABLE_ALIAS",
                                id: "VariableID:86e61e4b2a2fe9ab507a9302544920d38675a086/2036:2",
                              },
                            },
                          },
                          {
                            color: {
                              r: 0.0784313753247261,
                              g: 0.0784313753247261,
                              b: 0.0784313753247261,
                              a: 0,
                            },
                            position: 1,
                            boundVariables: {
                              color: {
                                type: "VARIABLE_ALIAS",
                                id: "VariableID:26724dcbb1ea60587379f89ef3dc160ae7f7f7da/2022:241",
                              },
                            },
                          },
                        ],
                      },
                    ],
                    strokes: [],
                    strokeWeight: 1,
                    strokeAlign: "INSIDE",
                    styles: {
                      fill: "438:9260",
                    },
                    absoluteBoundingBox: {
                      x: -1930,
                      y: -2200,
                      width: 960,
                      height: 30,
                    },
                    absoluteRenderBounds: null,
                    constraints: {
                      vertical: "TOP",
                      horizontal: "LEFT_RIGHT",
                    },
                    layoutAlign: "INHERIT",
                    layoutGrow: 0,
                    layoutPositioning: "ABSOLUTE",
                    layoutSizingHorizontal: "FIXED",
                    layoutSizingVertical: "FIXED",
                    effects: [],
                    interactions: [],
                  },
                  {
                    id: "I2099:38616;1739:61707;548:24040",
                    name: "Gradient Bottom",
                    type: "RECTANGLE",
                    scrollBehavior: "SCROLLS",
                    componentPropertyReferences: {
                      visible: "Show Bottom Gradient#1272:19",
                    },
                    boundVariables: {
                      size: {
                        y: {
                          type: "VARIABLE_ALIAS",
                          id: "VariableID:7de17999810183e2464dbfd32573c3ecf15a9f2e/3157:462",
                        },
                      },
                      fills: [
                        {
                          type: "VARIABLE_ALIAS",
                          id: "VariableID:86e61e4b2a2fe9ab507a9302544920d38675a086/2036:2",
                        },
                        {
                          type: "VARIABLE_ALIAS",
                          id: "VariableID:26724dcbb1ea60587379f89ef3dc160ae7f7f7da/2022:241",
                        },
                      ],
                    },
                    blendMode: "PASS_THROUGH",
                    fills: [
                      {
                        blendMode: "NORMAL",
                        type: "GRADIENT_LINEAR",
                        gradientHandlePositions: [
                          {
                            x: 0.5,
                            y: -3.0616171314629196e-17,
                          },
                          {
                            x: 0.5,
                            y: 0.9999999999999999,
                          },
                          {
                            x: 0,
                            y: 0,
                          },
                        ],
                        gradientStops: [
                          {
                            color: {
                              r: 0.0784313753247261,
                              g: 0.0784313753247261,
                              b: 0.0784313753247261,
                              a: 0,
                            },
                            position: 0,
                            boundVariables: {
                              color: {
                                type: "VARIABLE_ALIAS",
                                id: "VariableID:26724dcbb1ea60587379f89ef3dc160ae7f7f7da/2022:241",
                              },
                            },
                          },
                          {
                            color: {
                              r: 0.0784313753247261,
                              g: 0.0784313753247261,
                              b: 0.0784313753247261,
                              a: 1,
                            },
                            position: 1,
                            boundVariables: {
                              color: {
                                type: "VARIABLE_ALIAS",
                                id: "VariableID:86e61e4b2a2fe9ab507a9302544920d38675a086/2036:2",
                              },
                            },
                          },
                        ],
                      },
                    ],
                    strokes: [],
                    strokeWeight: 1,
                    strokeAlign: "INSIDE",
                    styles: {
                      fill: "438:9261",
                    },
                    absoluteBoundingBox: {
                      x: -1930,
                      y: -1686,
                      width: 960,
                      height: 30,
                    },
                    absoluteRenderBounds: {
                      x: -1930,
                      y: -1686,
                      width: 960,
                      height: 22,
                    },
                    constraints: {
                      vertical: "BOTTOM",
                      horizontal: "LEFT_RIGHT",
                    },
                    layoutAlign: "INHERIT",
                    layoutGrow: 0,
                    layoutPositioning: "ABSOLUTE",
                    layoutSizingHorizontal: "FIXED",
                    layoutSizingVertical: "FIXED",
                    effects: [],
                    interactions: [],
                  },
                  {
                    id: "I2099:38616;1739:61707;548:24046",
                    name: "Scrollbar V",
                    type: "FRAME",
                    scrollBehavior: "SCROLLS",
                    componentPropertyReferences: {
                      visible: "Show Scrollbar#1272:18",
                    },
                    boundVariables: {
                      paddingTop: {
                        type: "VARIABLE_ALIAS",
                        id: "VariableID:eb2b818a81b47a755734677805c327446a7eaacc/3157:1078",
                      },
                      paddingRight: {
                        type: "VARIABLE_ALIAS",
                        id: "VariableID:eb2b818a81b47a755734677805c327446a7eaacc/3157:1078",
                      },
                      paddingBottom: {
                        type: "VARIABLE_ALIAS",
                        id: "VariableID:eb2b818a81b47a755734677805c327446a7eaacc/3157:1078",
                      },
                    },
                    children: [
                      {
                        id: "I2099:38616;1739:61707;548:24047",
                        name: "Bar",
                        type: "RECTANGLE",
                        scrollBehavior: "SCROLLS",
                        boundVariables: {
                          minHeight: {
                            type: "VARIABLE_ALIAS",
                            id: "VariableID:5fdc417718534e1862bd74d2b0cae46cbc3fdd93/3157:975",
                          },
                          size: {
                            x: {
                              type: "VARIABLE_ALIAS",
                              id: "VariableID:4e7717a4a0ee45c0a9977c43d56cf4cb32848299/3157:257",
                            },
                          },
                          rectangleCornerRadii: {
                            RECTANGLE_TOP_LEFT_CORNER_RADIUS: {
                              type: "VARIABLE_ALIAS",
                              id: "VariableID:2044450eb10ae8e476766aeb5bf3550e3c2ba36e/3157:901",
                            },
                            RECTANGLE_TOP_RIGHT_CORNER_RADIUS: {
                              type: "VARIABLE_ALIAS",
                              id: "VariableID:2044450eb10ae8e476766aeb5bf3550e3c2ba36e/3157:901",
                            },
                            RECTANGLE_BOTTOM_LEFT_CORNER_RADIUS: {
                              type: "VARIABLE_ALIAS",
                              id: "VariableID:2044450eb10ae8e476766aeb5bf3550e3c2ba36e/3157:901",
                            },
                            RECTANGLE_BOTTOM_RIGHT_CORNER_RADIUS: {
                              type: "VARIABLE_ALIAS",
                              id: "VariableID:2044450eb10ae8e476766aeb5bf3550e3c2ba36e/3157:901",
                            },
                          },
                          fills: [
                            {
                              type: "VARIABLE_ALIAS",
                              id: "VariableID:9b31d8ddc760d048c5d9e42dbce12aa5946a3041/2036:15",
                            },
                          ],
                        },
                        blendMode: "PASS_THROUGH",
                        fills: [
                          {
                            blendMode: "NORMAL",
                            type: "SOLID",
                            color: {
                              r: 0.658823549747467,
                              g: 0.658823549747467,
                              b: 0.658823549747467,
                              a: 1,
                            },
                            boundVariables: {
                              color: {
                                type: "VARIABLE_ALIAS",
                                id: "VariableID:9b31d8ddc760d048c5d9e42dbce12aa5946a3041/2036:15",
                              },
                            },
                          },
                        ],
                        strokes: [],
                        strokeWeight: 1,
                        strokeAlign: "INSIDE",
                        cornerRadius: 1000,
                        cornerSmoothing: 0,
                        absoluteBoundingBox: {
                          x: -979,
                          y: -2195.5,
                          width: 4.5,
                          height: 31,
                        },
                        absoluteRenderBounds: {
                          x: -979,
                          y: -2195.5,
                          width: 4.5,
                          height: 31,
                        },
                        constraints: {
                          vertical: "TOP",
                          horizontal: "LEFT",
                        },
                        layoutAlign: "INHERIT",
                        layoutGrow: 1,
                        minHeight: 15,
                        layoutSizingHorizontal: "FIXED",
                        layoutSizingVertical: "FILL",
                        effects: [],
                        interactions: [],
                      },
                    ],
                    blendMode: "PASS_THROUGH",
                    clipsContent: false,
                    background: [],
                    fills: [],
                    strokes: [],
                    strokeWeight: 1,
                    strokeAlign: "INSIDE",
                    backgroundColor: {
                      r: 0,
                      g: 0,
                      b: 0,
                      a: 0,
                    },
                    layoutMode: "VERTICAL",
                    primaryAxisSizingMode: "FIXED",
                    counterAxisAlignItems: "MAX",
                    paddingRight: 4.5,
                    paddingTop: 4.5,
                    paddingBottom: 4.5,
                    layoutWrap: "NO_WRAP",
                    absoluteBoundingBox: {
                      x: -979,
                      y: -2200,
                      width: 9,
                      height: 40,
                    },
                    absoluteRenderBounds: {
                      x: -979,
                      y: -2200,
                      width: 9,
                      height: 40,
                    },
                    constraints: {
                      vertical: "TOP",
                      horizontal: "LEFT",
                    },
                    layoutAlign: "INHERIT",
                    layoutGrow: 0,
                    layoutSizingHorizontal: "HUG",
                    layoutSizingVertical: "FIXED",
                    effects: [],
                    interactions: [],
                  },
                ],
                blendMode: "PASS_THROUGH",
                clipsContent: true,
                background: [],
                fills: [],
                strokes: [],
                strokeWeight: 1,
                strokeAlign: "INSIDE",
                backgroundColor: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0,
                },
                layoutMode: "VERTICAL",
                counterAxisSizingMode: "FIXED",
                primaryAxisSizingMode: "FIXED",
                counterAxisAlignItems: "MAX",
                layoutWrap: "NO_WRAP",
                absoluteBoundingBox: {
                  x: -1930,
                  y: -2200,
                  width: 960,
                  height: 536,
                },
                absoluteRenderBounds: {
                  x: -1930,
                  y: -2200,
                  width: 960,
                  height: 536,
                },
                constraints: {
                  vertical: "TOP_BOTTOM",
                  horizontal: "LEFT_RIGHT",
                },
                layoutAlign: "INHERIT",
                layoutGrow: 0,
                layoutPositioning: "ABSOLUTE",
                layoutSizingHorizontal: "FIXED",
                layoutSizingVertical: "FIXED",
                effects: [],
                interactions: [],
                uniqueName: "Scroll Container",
                variantProperties: {
                  Variation: "Vertical",
                },
                width: 960,
                height: 536,
                x: 0,
                y: 0.25,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                primaryAxisAlignItems: "MIN",
              },
            ],
            blendMode: "PASS_THROUGH",
            clipsContent: true,
            background: [],
            fills: [],
            strokes: [],
            strokeWeight: 1,
            strokeAlign: "INSIDE",
            backgroundColor: {
              r: 0,
              g: 0,
              b: 0,
              a: 0,
            },
            layoutMode: "VERTICAL",
            counterAxisSizingMode: "FIXED",
            itemSpacing: 10,
            primaryAxisSizingMode: "FIXED",
            layoutWrap: "NO_WRAP",
            absoluteBoundingBox: {
              x: -1930,
              y: -2200.25,
              width: 960,
              height: 536.25,
            },
            absoluteRenderBounds: {
              x: -1930,
              y: -2200.25,
              width: 960,
              height: 536.25,
            },
            constraints: {
              vertical: "TOP",
              horizontal: "LEFT",
            },
            layoutAlign: "STRETCH",
            layoutGrow: 1,
            layoutSizingHorizontal: "FILL",
            layoutSizingVertical: "FILL",
            effects: [],
            interactions: [],
            uniqueName: "Content",
            width: 960,
            height: 536.25,
            x: 0,
            y: 93.75,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            primaryAxisAlignItems: "MIN",
            counterAxisAlignItems: "MIN",
            isRelative: true,
          },
        ],
        blendMode: "PASS_THROUGH",
        clipsContent: true,
        background: [
          {
            blendMode: "NORMAL",
            type: "SOLID",
            color: {
              r: 0.1411764770746231,
              g: 0.1411764770746231,
              b: 0.1411764770746231,
              a: 1,
            },
            boundVariables: {
              color: {
                type: "VARIABLE_ALIAS",
                id: "VariableID:8cbcd0032a7cac3b9799f16f6f48c35cab554a40/2243:10",
              },
            },
          },
        ],
        fills: [
          {
            blendMode: "NORMAL",
            type: "SOLID",
            color: {
              r: 0.1411764770746231,
              g: 0.1411764770746231,
              b: 0.1411764770746231,
              a: 1,
            },
            boundVariables: {
              color: {
                type: "VARIABLE_ALIAS",
                id: "VariableID:8cbcd0032a7cac3b9799f16f6f48c35cab554a40/2243:10",
              },
            },
            variableColorName: "Box-Style-box4",
          },
        ],
        strokes: [],
        cornerRadius: 4.5,
        cornerSmoothing: 0,
        strokeWeight: 1,
        strokeAlign: "INSIDE",
        backgroundColor: {
          r: 0.1411764770746231,
          g: 0.1411764770746231,
          b: 0.1411764770746231,
          a: 1,
        },
        layoutMode: "VERTICAL",
        counterAxisSizingMode: "FIXED",
        primaryAxisSizingMode: "FIXED",
        counterAxisAlignItems: "CENTER",
        layoutWrap: "NO_WRAP",
        absoluteBoundingBox: {
          x: -1930,
          y: -2294,
          width: 960,
          height: 720,
        },
        absoluteRenderBounds: {
          x: -1969,
          y: -2323.10009765625,
          width: 1038,
          height: 789.10009765625,
        },
        constraints: {
          vertical: "TOP",
          horizontal: "LEFT",
        },
        layoutAlign: "INHERIT",
        layoutGrow: 0,
        minHeight: 320,
        maxHeight: 720,
        layoutSizingHorizontal: "FIXED",
        layoutSizingVertical: "FIXED",
        effects: [
          {
            type: "DROP_SHADOW",
            visible: true,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 0.47999998927116394,
            },
            blendMode: "NORMAL",
            offset: {
              x: 0,
              y: 9.899999618530273,
            },
            radius: 39,
            showShadowBehindNode: true,
            boundVariables: {
              radius: {
                type: "VARIABLE_ALIAS",
                id: "VariableID:7b576d4f7cef936e728857b8d6f7952e2a6dd6fe/3157:78",
              },
              color: {
                type: "VARIABLE_ALIAS",
                id: "VariableID:e7dccd708e8eb5f689ef26147d2d985b7af1bfd8/2013:336",
              },
              offsetY: {
                type: "VARIABLE_ALIAS",
                id: "VariableID:55268df3aca26e8ed4182c6831670c631ab2e88b/4411:298",
              },
            },
            variableColorName: "Elevation-elevation5",
          },
        ],
        styles: {
          effect: "438:10166",
        },
        interactions: [],
        uniqueName: "Modal",
        width: 960,
        height: 720,
        x: 160,
        y: 40,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        primaryAxisAlignItems: "MIN",
      },
    ];
    console.log(
      `[benchmark] convertNodesToAltNodes: ${Date.now() - convertNodesStart}ms`,
    );
  }

  console.log("[debug] convertedSelection", { ...convertedSelection[0] });

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
  // const gradients = retrieveGenericGradients(framework);
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
    gradients: [],
    settings,
    warnings: [...warnings],
  });
};
