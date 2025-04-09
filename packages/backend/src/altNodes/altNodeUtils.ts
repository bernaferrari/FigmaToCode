import { AltNode } from "types";
import { curry } from "../common/curry";
import { exportAsyncProxy } from "../common/exportAsyncProxy";
import { addWarning } from "../common/commonConversionWarnings";
import { getVariableNameFromColor } from "./jsonNodeConversion";
import { htmlColor } from "../html/builderImpl/htmlColor";

export const overrideReadonlyProperty = curry(
  <T, K extends keyof T>(prop: K, value: any, obj: T): T =>
    Object.defineProperty(obj, prop, {
      value: value,
      writable: true,
      configurable: true,
    }),
);

export const assignParent = overrideReadonlyProperty("parent");
export const assignChildren = overrideReadonlyProperty("children");
export const assignType = overrideReadonlyProperty("type");
export const assignRectangleType = assignType("RECTANGLE");

export function isNotEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export const isTypeOrGroupOfTypes = curry(
  (matchTypes: NodeType[], node: SceneNode): boolean => {
    // Check if the current node's type is in the matchTypes array
    if (matchTypes.includes(node.type)) return true;

    // Only check children if this is a container type node that can have children
    if ("children" in node) {
      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i];
        const result = isTypeOrGroupOfTypes(matchTypes, childNode);
        if (!result) {
          // If any child is not of the specified types, return false
          return false;
        }
      }
      // All children are valid types
      return node.children.length > 0; // Only return true if there are children
    }

    // Not a container node and not a matching type
    return false;
  },
);

export const isSVGNode = (node: SceneNode) => {
  const altNode = node as AltNode<typeof node>;
  return altNode.canBeFlattened;
};

export const renderAndAttachSVG = async (node: any) => {
  if (node.canBeFlattened) {
    if (node.svg) {
      return node;
    }

    try {
      const svg = (await exportAsyncProxy<string>(node, {
        format: "SVG_STRING",
      })) as string;
      
      // Process the SVG to replace colors with variable references
      if (node.colorVariableMappings && node.colorVariableMappings.size > 0) {
        let processedSvg = svg;
        
        // Replace fill="COLOR" or stroke="COLOR" patterns
        const colorAttributeRegex = /(fill|stroke)="([^"]*)"/g;
        
        processedSvg = processedSvg.replace(colorAttributeRegex, (match, attribute, colorValue) => {
          // Clean up the color value and normalize it
          const normalizedColor = colorValue.toLowerCase().trim();
          
          // Look up the color directly in our mappings
          const mapping = node.colorVariableMappings.get(normalizedColor);
          if (mapping) {
            // If we have a variable reference, use it with fallback to original
            return `${attribute}="var(--${mapping.variableName}, ${colorValue})"`;
          }
          
          // Otherwise keep the original color
          return match;
        });
        
        // Also handle style attributes with fill: or stroke: properties
        const styleRegex = /style="([^"]*)(?:(fill|stroke):\s*([^;"]*))(;|\s|")([^"]*)"/g;
        
        processedSvg = processedSvg.replace(styleRegex, (match, prefix, property, colorValue, separator, suffix) => {
          // Clean up any extra spaces from the color value
          const normalizedColor = colorValue.toLowerCase().trim();
          
          // Look up the color directly in our mappings
          const mapping = node.colorVariableMappings.get(normalizedColor);
          if (mapping) {
            // Replace just the color value with the variable and fallback
            return `style="${prefix}${property}: var(--${mapping.variableName}, ${colorValue})${separator}${suffix}"`;
          }
          
          return match;
        });
        
        node.svg = processedSvg;
      } else {
        node.svg = svg;
      }
    } catch (error) {
      addWarning(`Failed rendering SVG for ${node.name}`);
      console.error(`Error rendering SVG for ${node.type}:${node.id}`);
      console.error(error);
    }
  }
  return node;
};
