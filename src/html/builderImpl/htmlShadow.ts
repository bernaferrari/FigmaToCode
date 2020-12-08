import { htmlSolidToRgba } from "./htmlColor";
import { AltBlendMixin } from "../../altNodes/altMixins";

/**
 * https://tailwindcss.com/docs/box-shadow/
 * example: shadow
 */
export const htmlShadow = (node: AltBlendMixin): string => {
  // [when testing] node.effects can be undefined
  if (node.effects && node.effects.length > 0) {
    const dropShadow = node.effects.filter(
      (d): d is ShadowEffect =>
        (d.type === "DROP_SHADOW" || d.type === "INNER_SHADOW") &&
        d.visible !== false
    );
    // simple shadow from tailwind
    if (dropShadow.length > 0) {
      const shadow = dropShadow[0];
      const x = shadow.offset.x;
      const y = shadow.offset.y;
      const color = htmlSolidToRgba(shadow.color, shadow.color.a);
      const blur = shadow.radius;
      const spread = shadow.spread ? `${shadow.spread}px ` : "";
      const inner = shadow.type === "INNER_SHADOW" ? " inset" : "";

      return `${x}px ${y}px ${blur}px ${spread}${color}${inner}`;
    }
  }
  return "";
};
