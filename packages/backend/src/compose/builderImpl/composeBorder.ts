import { commonStroke } from "../../common/commonStroke";
import { rgbTo6hex } from "../../common/color";
import { numberToFixedString } from "../../common/numToAutoFixed";
import { retrieveTopFill } from "../../common/retrieveFill";

/**
 * Helper function to convert RGBA paint to hex format for Compose
 */
const rgbaToHex = (fill: Paint): string => {
  if (fill.type === "SOLID") {
    return rgbTo6hex(fill.color);
  }
  return "000000"; // fallback
};

/**
 * Get stroke alignment string for Compose border
 * Compose doesn't have perfect equivalents for all stroke alignments,
 * but we can approximate with different approaches
 */
const getStrokeAlignment = (node: SceneNode): "inside" | "center" | "outside" => {
  if ("strokeAlign" in node) {
    switch (node.strokeAlign) {
      case "INSIDE":
        return "inside";
      case "CENTER":
        return "center";
      case "OUTSIDE":
        return "outside";
      default:
        return "inside";
    }
  }
  return "inside";
};

/**
 * Generate Compose border modifier string
 * @param node - The scene node with stroke properties
 * @returns Compose border modifier string
 */
export const composeBorder = (node: SceneNode): string => {
  if (!("strokes" in node)) {
    return "";
  }

  const stroke = commonStroke(node);
  if (!stroke) {
    return "";
  }

  const strokeFill = retrieveTopFill(node.strokes);
  if (!strokeFill) {
    return "";
  }

  const strokeAlignment = getStrokeAlignment(node);

  // Handle uniform border (all sides same)
  if ("all" in stroke) {
    if (stroke.all === 0) {
      return "";
    }

    return generateBorderModifier(stroke.all, strokeFill, strokeAlignment);
  } else {
    // Handle non-uniform borders
    // Compose doesn't have direct support for different border widths per side
    // We'll use the maximum width and add a warning
    const maxWidth = Math.max(
      stroke.left,
      stroke.top,
      stroke.right,
      stroke.bottom
    );

    if (maxWidth === 0) {
      return "";
    }

    // For now, use uniform border with max width
    // TODO: Consider using Canvas or custom drawing for true non-uniform borders
    return generateBorderModifier(maxWidth, strokeFill, strokeAlignment);
  }
};

/**
 * Generate the actual border modifier string
 */
const generateBorderModifier = (
  width: number,
  fill: Paint,
  alignment: "inside" | "center" | "outside"
): string => {
  const widthDp = `${numberToFixedString(width)}.dp`;

  if (fill.type === "SOLID") {
    const color = rgbaToHex(fill);
    const opacity = fill.opacity ?? 1.0;
    
    let colorValue: string;
    if (opacity < 1) {
      const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0').toUpperCase();
      colorValue = `Color(0x${alpha}${color.toUpperCase()})`;
    } else {
      colorValue = `Color(0xFF${color.toUpperCase()})`;
    }

    // For alignment, we note that Compose doesn't have built-in stroke alignment
    // All borders are essentially "inside" by default
    // For outside borders, we might need custom drawing or padding adjustments
    if (alignment === "outside") {
      // Add comment about limitation
      return `.border(width = ${widthDp}, color = ${colorValue}) // Note: Compose borders are always inside`;
    } else {
      return `.border(width = ${widthDp}, color = ${colorValue})`;
    }
  } else if (fill.type === "GRADIENT_LINEAR") {
    // Convert gradient to Compose Brush
    const stops = fill.gradientStops.map(stop => {
      const stopColor = rgbTo6hex(stop.color);
      const stopOpacity = stop.color.a ?? 1.0;
      let colorValue: string;
      
      if (stopOpacity < 1) {
        const alpha = Math.round(stopOpacity * 255).toString(16).padStart(2, '0').toUpperCase();
        colorValue = `Color(0x${alpha}${stopColor.toUpperCase()})`;
      } else {
        colorValue = `Color(0xFF${stopColor.toUpperCase()})`;
      }
      
      return `${numberToFixedString(stop.position)}f to ${colorValue}`;
    }).join(", ");

    const brush = `Brush.linearGradient(
        colorStops = arrayOf(${stops})
    )`;

    if (alignment === "outside") {
      return `.border(width = ${widthDp}, brush = ${brush}) // Note: Compose borders are always inside`;
    } else {
      return `.border(width = ${widthDp}, brush = ${brush})`;
    }
  } else if (fill.type === "GRADIENT_RADIAL") {
    // Convert radial gradient to Compose Brush
    const stops = fill.gradientStops.map(stop => {
      const stopColor = rgbTo6hex(stop.color);
      const stopOpacity = stop.color.a ?? 1.0;
      let colorValue: string;
      
      if (stopOpacity < 1) {
        const alpha = Math.round(stopOpacity * 255).toString(16).padStart(2, '0').toUpperCase();
        colorValue = `Color(0x${alpha}${stopColor.toUpperCase()})`;
      } else {
        colorValue = `Color(0xFF${stopColor.toUpperCase()})`;
      }
      
      return `${numberToFixedString(stop.position)}f to ${colorValue}`;
    }).join(", ");

    const brush = `Brush.radialGradient(
        colorStops = arrayOf(${stops})
    )`;

    if (alignment === "outside") {
      return `.border(width = ${widthDp}, brush = ${brush}) // Note: Compose borders are always inside`;
    } else {
      return `.border(width = ${widthDp}, brush = ${brush})`;
    }
  }

  return "";
};