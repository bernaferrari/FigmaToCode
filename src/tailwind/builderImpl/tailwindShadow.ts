import { AltBlendMixin } from "../../common/altMixins";

/**
 * https://tailwindcss.com/docs/box-shadow/
 * example: shadow
 */
export const tailwindShadow = (node: AltBlendMixin): string => {
  // [when testing] node.effects can be undefined
  if (node.effects && node.effects.length > 0) {
    const drop_shadow = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );
    let boxShadow = "";
    // simple shadow from tailwind
    if (drop_shadow.length > 0) {
      boxShadow = "shadow ";
    }

    const innerShadow =
      node.effects.filter((d): d is ShadowEffect => d.type === "INNER_SHADOW")
        .length > 0
        ? "shadow-inner "
        : "";

    return boxShadow + innerShadow;

    // todo customize the shadow

    // if (drop_shadow) {
    //   drop_shadow.forEach((d: ShadowEffect) => {
    //     d.radius;
    //     boxShadow += `BoxShadow(
    //       color: ${rgbTohex(d.color)},
    //       blurRadius: ${d.radius},
    //       offset: Offset(${d.offset.x}, ${d.offset.y}),
    //     ), `;
    //   });
    // }
    // TODO layer blur, shadow-outline
  }
  return "";
};
