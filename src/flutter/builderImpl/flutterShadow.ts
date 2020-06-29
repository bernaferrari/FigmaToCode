import { AltSceneNode } from "../../common/altMixins";
import { rgbaTohex } from "../flutter_helpers";

export const flutterBoxShadow = (node: AltSceneNode): string => {
  let propBoxShadow = "";
  if (node.effects.length > 0) {
    const drop_shadow: Array<ShadowEffect> = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );
    let boxShadow = "";
    if (drop_shadow) {
      drop_shadow.forEach((d: ShadowEffect) => {
        const color = `color: Color(0x${rgbaTohex(d.color)}, `;
        const radius = `blurRadius: ${d.radius}, `;
        const offset = `offset: Offset(${d.offset.x}, ${d.offset.y}), `;
        boxShadow += `BoxShadow(${color}${radius}${offset}),),`;
      });
    }
    // TODO inner shadow, layer blur
    propBoxShadow = `boxShadow: [ ${boxShadow} ],`;
  }
  return propBoxShadow;
};

export const flutterElevationAndShadowColor = (
  node: AltSceneNode
): [string, string] => {
  let elevation = "";
  let shadowColor = "";

  if (node.effects.length > 0) {
    const drop_shadow: Array<ShadowEffect> = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );
    if (
      drop_shadow &&
      drop_shadow.length > 0 &&
      drop_shadow[0].type === "DROP_SHADOW"
    ) {
      shadowColor = `color: Color(0x${rgbaTohex(drop_shadow[0].color)}, `;
      elevation = `elevation: ${drop_shadow[0].radius}, `;
    }
  }

  return [elevation, shadowColor];
};
