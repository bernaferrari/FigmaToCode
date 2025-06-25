import { rgbTo6hex, rgbTo8hex } from "../../common/color";

export const composeColor = (fill: Paint): string | null => {
  if (fill.type === "SOLID") {
    const color = rgbTo6hex(fill.color);
    if (fill.opacity !== undefined && fill.opacity < 1) {
      const alpha = Math.round(fill.opacity * 255).toString(16).padStart(2, '0');
      return `background(Color(0x${alpha}${color.slice(1)}))`;
    }
    return `background(Color(0xFF${color.slice(1)}))`;
  } else if (fill.type === "GRADIENT_LINEAR") {
    // Convert gradient to Compose Brush
    const stops = fill.gradientStops.map(stop => {
      const color = rgbTo6hex(stop.color);
      return `${stop.position}f to Color(0xFF${color.slice(1)})`;
    }).join(", ");
    
    return `background(Brush.linearGradient(
        colorStops = arrayOf(${stops})
    ))`;
  } else if (fill.type === "GRADIENT_RADIAL") {
    const stops = fill.gradientStops.map(stop => {
      const color = rgbTo6hex(stop.color);
      return `${stop.position}f to Color(0xFF${color.slice(1)})`;
    }).join(", ");
    
    return `background(Brush.radialGradient(
        colorStops = arrayOf(${stops})
    ))`;
  }
  
  return null;
};