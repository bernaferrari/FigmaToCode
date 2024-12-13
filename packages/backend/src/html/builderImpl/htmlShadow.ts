import { htmlColor } from "./htmlColor";

/**
 * https://tailwindcss.com/docs/box-shadow/
 * example: shadow
 */
export const htmlShadow = (node: BlendMixin): string => {
  // [when testing] node.effects can be undefined
  if (node.effects && node.effects.length > 0) {
    const shadowEffects = node.effects.filter(
      (d) =>
        (d.type === "DROP_SHADOW" ||
          d.type === "INNER_SHADOW" ||
          d.type === "LAYER_BLUR") &&
        d.visible,
    );
    // simple shadow from tailwind
    if (shadowEffects.length > 0) {
      const shadow = shadowEffects[0];
      let x = 0;
      let y = 0;
      let blur = 0;
      let spread = "";
      let inner = "";
      let color = "";

      if (shadow.type === "DROP_SHADOW" || shadow.type === "INNER_SHADOW") {
        x = shadow.offset.x;
        y = shadow.offset.y;
        blur = shadow.radius;
        spread = shadow.spread ? `${shadow.spread}px ` : "";
        inner = shadow.type === "INNER_SHADOW" ? " inset" : "";
        color = htmlColor(shadow.color, shadow.color.a);
      } else if (shadow.type === "LAYER_BLUR") {
        x = shadow.radius;
        y = shadow.radius;
        blur = shadow.radius;
      }

      // Return box-shadow in the desired format
      return `${x}px ${y}px ${blur}px ${spread}${color}${inner}`;
    }
  }
  return "";
};
