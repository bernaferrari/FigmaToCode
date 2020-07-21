import { AltBlendMixin } from "../../altNodes/altMixins";

/**
 * https://tailwindcss.com/docs/box-shadow/
 * example: shadow
 */
export const tailwindShadow = (node: AltBlendMixin): string => {
  // [when testing] node.effects can be undefined
  if (node.effects && node.effects.length > 0) {
    const dropShadow = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW" && d.visible !== false
    );
    let boxShadow = "";
    // simple shadow from tailwind
    if (dropShadow.length > 0) {
      boxShadow = "shadow ";
    }

    const innerShadow =
      node.effects.filter((d): d is ShadowEffect => d.type === "INNER_SHADOW")
        .length > 0
        ? "shadow-inner "
        : "";

    return boxShadow + innerShadow;

    // todo customize the shadow
    // TODO layer blur, shadow-outline
  }
  return "";
};
