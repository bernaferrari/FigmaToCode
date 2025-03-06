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

// Keep track of node names for sequential numbering
const nodeNameCounters: Map<string, number> = new Map();

// Helper function to add parent references to all children in the node tree
const addParentReferences = (node: any) => {
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      // Add parent reference to the child
      child.parent = node;
      // Recursively process this child's children
      addParentReferences(child);
    }
  }
};

// Define all property paths that might contain gradients
const GRADIENT_PROPERTIES = ["fills", "strokes", "effects"];

/**
 * Process color variables in a paint style and add pre-computed variable names
 * @param paint The paint style to process (fill or stroke)
 */
const processColorVariables = async (paint: Paint) => {
  if (
    paint.type === "GRADIENT_ANGULAR" ||
    paint.type === "GRADIENT_DIAMOND" ||
    paint.type === "GRADIENT_LINEAR" ||
    paint.type === "GRADIENT_RADIAL"
  ) {
    for (const stop of paint.gradientStops) {
      if (stop.boundVariables?.color) {
        (stop as any).variableColorName = await variableToColorName(
          stop.boundVariables.color,
        );
      }
    }
  } else if (paint.type === "SOLID" && paint.boundVariables?.color) {
    // Pre-compute and store the variable name
    (paint as any).variableColorName = await variableToColorName(
      paint.boundVariables.color,
    );
  }
};

const getColorVariables = async (node: any, settings: PluginSettings) => {
  if (settings.useColorVariables) {
    // Process color variables in fills and strokes
    if (node.fills && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        await processColorVariables(fill);
      }
    }

    if (node.strokes && Array.isArray(node.strokes)) {
      for (const stroke of node.strokes) {
        await processColorVariables(stroke);
      }
    }
    // Process color variables in effects if they exist
    if (node.effects && Array.isArray(node.effects)) {
      for (const effect of node.effects) {
        if (effect.color) {
          await processColorVariables(effect);
        }
      }
    }
  }
};

/**
 * Recursively process node and its children to update with data not available in JSON
 * @param node The node to process
 * @param optimizeLayout Whether to extract and include inferredAutoLayout data
 */
const processNodeData = async (node: any, settings: PluginSettings) => {
  if (node.id) {
    // Check if we need to fetch the Figma node at all
    const hasGradient = GRADIENT_PROPERTIES.some((propName) => {
      const property = node[propName];
      return (
        property &&
        Array.isArray(property) &&
        property.length > 0 &&
        property.some(
          (item: any) => item.type && item.type.startsWith("GRADIENT_"),
        )
      );
    });

    // Ensure node has a unique name with simple numbering
    const cleanName = node.name.trim();

    // Track names with simple counter
    const count = nodeNameCounters.get(cleanName) || 0;
    nodeNameCounters.set(cleanName, count + 1);

    // For first occurrence, use original name; for duplicates, add sequential suffix
    node.uniqueName =
      count === 0
        ? cleanName
        : `${cleanName}_${count.toString().padStart(2, "0")}`;

    // Handle additional node properties
    if (
      hasGradient ||
      settings.optimizeLayout ||
      node.type === "INSTANCE" ||
      node.type === "TEXT"
    ) {
      const figmaNode = await figma.getNodeByIdAsync(node.id);

      if (!figmaNode) {
        return;
      }

      // Handle gradients
      if (hasGradient) {
        GRADIENT_PROPERTIES.forEach((propName) => {
          const property = node[propName];
          if (
            property &&
            Array.isArray(property) &&
            property.length > 0 &&
            property.some(
              (item) => item.type && item.type.startsWith("GRADIENT_"),
            ) &&
            propName in figmaNode
          ) {
            node[propName] = JSON.parse(
              JSON.stringify((figmaNode as any)[propName]),
            );
          }
        });
      }

      // Handle text-specific properties
      if (figmaNode.type === "TEXT") {
        // Get the text segments
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

        // Assign unique IDs to each segment
        if (styledTextSegments.length > 0) {
          const baseSegmentName = (node.uniqueName || node.name)
            .replace(/[^a-zA-Z0-9_-]/g, "")
            .toLowerCase();

          // Add a uniqueId to each segment
          styledTextSegments = await Promise.all(
            styledTextSegments.map(async (segment, index) => {
              const mutableSegment = Object.assign({}, segment);

              if (settings.useColorVariables && segment.fills) {
                mutableSegment.fills = segment.fills.map((d) => ({ ...d }));
                for (const fill of mutableSegment.fills) {
                  await processColorVariables(fill);
                }
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

          node.styledTextSegments = styledTextSegments;
        }

        Object.assign(node, node.style);
        if (!node.textAutoResize) {
          node.textAutoResize = "NONE";
        }
      }

      // Extract inferredAutoLayout if optimizeLayout is enabled
      if (settings.optimizeLayout && "inferredAutoLayout" in figmaNode) {
        node.inferredAutoLayout = JSON.parse(
          JSON.stringify((figmaNode as any).inferredAutoLayout),
        );
      }

      // Extract component metadata from instances
      if (
        node.type === "INSTANCE" &&
        "variantProperties" in figmaNode &&
        figmaNode.variantProperties
      ) {
        node.variantProperties = figmaNode.variantProperties;
      }

      // Always copy size and position
      if ("width" in figmaNode) {
        node.width = (figmaNode as any).width;
        node.height = (figmaNode as any).height;
        node.x = (figmaNode as any).x;
        node.y = (figmaNode as any).y;
      }
    } else {
      // Hopefully one day this won't be needed anymore.
      const figmaNode = await figma.getNodeByIdAsync(node.id);
      if (figmaNode && "width" in figmaNode) {
        node.width = (figmaNode as any).width;
        node.height = (figmaNode as any).height;
        node.x = (figmaNode as any).x;
        node.y = (figmaNode as any).y;
      }
    }

    await getColorVariables(node, settings);

    // Set default layout properties if missing
    if (!node.layoutMode) node.layoutMode = "NONE";
    if (!node.layoutGrow) node.layoutGrow = 0;
    if (!node.layoutSizingHorizontal) node.layoutSizingHorizontal = "FIXED";
    if (!node.layoutSizingVertical) node.layoutSizingVertical = "FIXED";

    // If layout sizing is HUG but there are no children, set it to FIXED
    const hasChildren =
      node.children && Array.isArray(node.children) && node.children.length > 0;
    if (node.layoutSizingHorizontal === "HUG" && !hasChildren) {
      node.layoutSizingHorizontal = "FIXED";
    }
    if (node.layoutSizingVertical === "HUG" && !hasChildren) {
      node.layoutSizingVertical = "FIXED";
    }
  }

  // Process children recursively
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      await processNodeData(child, settings);
    }

    // Handle itemReverseZIndex for absolute-positioned children on AutoLayout
    if (
      "children" in node &&
      "itemReverseZIndex" in node &&
      node.itemReverseZIndex
    ) {
      const absoluteChildren = node.children.filter(
        (child: SceneNode) =>
          "layoutPositioning" in child &&
          child.layoutPositioning === "ABSOLUTE",
      );
      const reversedAbsolute = [...absoluteChildren].reverse();
      let index = 0;
      node.children = node.children.map((child: SceneNode) => {
        if (
          "layoutPositioning" in child &&
          child.layoutPositioning === "ABSOLUTE"
        ) {
          return reversedAbsolute[index++];
        } else {
          return child;
        }
      });
    }
  }

  // Process children recursively
  // if (node.children && Array.isArray(node.children)) {
  //   for (const child of node.children) {
  //     await processNodeData(child, settings);
  //   }
  // }
};

/**
 * Convert Figma nodes to JSON format with parent references added
 * @param nodes The Figma nodes to convert to JSON
 * @param optimizeLayout Whether to extract and include inferredAutoLayout data
 * @returns JSON representation of the nodes with parent references
 */
export const nodesToJSON = async (
  nodes: ReadonlyArray<SceneNode>,
  settings: PluginSettings,
): Promise<SceneNode[]> => {
  // Reset name counters for each conversion
  nodeNameCounters.clear();

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

  // Process gradients and inferredAutoLayout in the JSON tree before adding parent references
  for (const node of nodeJson) {
    await processNodeData(node, settings);
  }

  // Add parent references to all children in the node tree
  nodeJson.forEach((node) => addParentReferences(node));

  return nodeJson;
};

export const run = async (settings: PluginSettings) => {
  clearWarnings();

  const { framework } = settings;
  const selection = figma.currentPage.selection;

  if (selection.length > 1) {
    addWarning(
      "Ungrouped elements may have incorrect positioning. If this happens, try wrapping the selection in a Frame or Group.",
    );
  }

  const nodeJson = await nodesToJSON(selection, settings);
  console.log("nodeJson", nodeJson);

  // Now we work directly with the JSON nodes
  const convertedSelection = await convertNodesToAltNodes(nodeJson, null);

  // ignore when nothing was selected
  // If the selection was empty, the converted selection will also be empty.
  if (convertedSelection.length === 0) {
    postEmptyMessage();
    return;
  }

  const code = await convertToCode(convertedSelection, settings);
  const htmlPreview = await generateHTMLPreview(convertedSelection, settings);
  const colors = retrieveGenericSolidUIColors(framework);
  const gradients = retrieveGenericGradients(framework, settings);

  postConversionComplete({
    code,
    htmlPreview,
    colors,
    gradients,
    settings,
    warnings: [...warnings],
  });
};
