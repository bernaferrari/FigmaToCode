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
import { generateHTMLPreview } from "./html/htmlMain";
import {
  postConversionComplete,
  postConversionStart,
  postEmptyMessage,
} from "./messaging";
import { PluginSettings } from "types";
import { convertToCode } from "./common/retrieveUI/convertToCode";

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
 * Recursively process node and its children to update with data not available in JSON
 * @param node The node to process
 * @param optimizeLayout Whether to extract and include inferredAutoLayout data
 */
const processNodeData = (node: any, optimizeLayout: boolean) => {
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

    // Only fetch the Figma node if we have gradients, optimizeLayout is enabled, or it's an instance
    if (
      hasGradient ||
      optimizeLayout ||
      node.type === "INSTANCE" ||
      node.type === "TEXT"
    ) {
      try {
        const figmaNode = figma.getNodeById(node.id);
        if (figmaNode) {
          // Handle gradients if needed
          if (hasGradient) {
            GRADIENT_PROPERTIES.forEach((propName) => {
              const property = node[propName];
              if (property && Array.isArray(property) && property.length > 0) {
                // We already know there's a gradient in at least one property
                if (
                  property.some(
                    (item: any) =>
                      item.type && item.type.startsWith("GRADIENT_"),
                  ) &&
                  propName in figmaNode
                ) {
                  // Replace with the actual property that contains proper gradient transforms
                  node[propName] = JSON.parse(
                    JSON.stringify((figmaNode as any)[propName]),
                  );
                }
              }
            });
          }

          if (figmaNode.type === "TEXT") {
            node.styledTextSegments = figmaNode.getStyledTextSegments([
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
            Object.assign(node, node.style);
            if (!node.textAutoResize) {
              node.textAutoResize = "NONE";
            }
          }

          // Extract inferredAutoLayout if optimizeLayout is enabled
          if (optimizeLayout && "inferredAutoLayout" in figmaNode) {
            node.inferredAutoLayout = JSON.parse(
              JSON.stringify((figmaNode as any).inferredAutoLayout),
            );
          }

          // Extract component metadata from instances
          if (figmaNode.type === "INSTANCE") {
            if (figmaNode.variantProperties) {
              node.variantProperties = figmaNode.variantProperties;
            }
          }

          if ("width" in figmaNode) {
            node.width = (figmaNode as any).width;
            node.height = (figmaNode as any).height;
            node.x = (figmaNode as any).x;
            node.y = (figmaNode as any).y;
          }
        }
      } catch (e) {
        // Silently fail if there's an error accessing the Figma node
      }
    } else {
      const figmaNode = figma.getNodeById(node.id);
      node.width = (figmaNode as any).width;
      node.height = (figmaNode as any).height;
      node.x = (figmaNode as any).x;
      node.y = (figmaNode as any).y;
    }

    if (!node.layoutMode) {
      node.layoutMode = "NONE";
    }
    if (!node.layoutGrow) {
      node.layoutGrow = 0;
    }
    if (!node.layoutSizingHorizontal) {
      node.layoutSizingHorizontal = "FIXED";
    }
    if (!node.layoutSizingVertical) {
      node.layoutSizingVertical = "FIXED";
    }
  }

  // Process children recursively
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) =>
      processNodeData(child, optimizeLayout),
    );
  }
};

/**
 * Convert Figma nodes to JSON format with parent references added
 * @param nodes The Figma nodes to convert to JSON
 * @param optimizeLayout Whether to extract and include inferredAutoLayout data
 * @returns JSON representation of the nodes with parent references
 */
export const nodesToJSON = async (
  nodes: ReadonlyArray<SceneNode>,
  optimizeLayout: boolean = false,
): Promise<SceneNode[]> => {
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
  nodeJson.forEach((node) => processNodeData(node, optimizeLayout));

  // Add parent references to all children in the node tree
  nodeJson.forEach((node) => addParentReferences(node));

  return nodeJson;
};

export const run = async (settings: PluginSettings) => {
  clearWarnings();

  const { framework, optimizeLayout } = settings;
  const selection = figma.currentPage.selection;

  if (selection.length > 1) {
    addWarning(
      "Ungrouped elements may have incorrect positioning. If this happens, try wrapping the selection in a Frame or Group.",
    );
  }

  const nodeJson = await nodesToJSON(selection, optimizeLayout);
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
  const htmlPreview = await generateHTMLPreview(
    convertedSelection,
    settings,
    code,
  );
  const colors = retrieveGenericSolidUIColors(framework);
  const gradients = retrieveGenericGradients(framework);

  postConversionComplete({
    code,
    htmlPreview,
    colors,
    gradients,
    settings,
    warnings: [...warnings],
  });
};
