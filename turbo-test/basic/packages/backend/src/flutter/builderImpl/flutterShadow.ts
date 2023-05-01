import { AltSceneNode } from "../../altNodes/altMixins";
import { rgbTo8hex } from "../../common/color";
import { numToAutoFixed } from "../../common/numToAutoFixed";
import { indentString } from "../../common/indentString";

export const flutterBoxShadow = (node: AltSceneNode): string => {
  let propBoxShadow = "";
  if (node.effects?.length > 0) {
    const dropShadow: Array<DropShadowEffect> = node.effects.filter(
      (d): d is DropShadowEffect =>
        d.type === "DROP_SHADOW" && d.visible
    );

    if (dropShadow.length > 0) {
      let boxShadow = "";

      dropShadow.forEach((d: DropShadowEffect) => {
        const color = `\ncolor: Color(0x${rgbTo8hex(d.color, d.color.a)}),`;
        const radius = `\nblurRadius: ${numToAutoFixed(d.radius)},`;
        const offset = `\noffset: Offset(${numToAutoFixed(
          d.offset.x
        )}, ${numToAutoFixed(d.offset.y)}),`;

        const property = color + radius + offset;

        boxShadow += `\nBoxShadow(${indentString(property)}\n),`;
      });

      propBoxShadow = `\nboxShadow: [${indentString(boxShadow)}\n],`;
    }
    // TODO inner shadow, layer blur
  }
  return propBoxShadow;
};

export const flutterElevationAndShadowColor = (
  node: AltSceneNode
): [string, string] => {
  let elevation = "";
  let shadowColor = "";

  if (node.effects.length > 0) {
    const dropShadow: Array<DropShadowEffect> = node.effects.filter(
      (d): d is DropShadowEffect =>
        d.type === "DROP_SHADOW" && d.visible
    );

    if (dropShadow.length > 0 && dropShadow[0].type === "DROP_SHADOW") {
      shadowColor = `\ncolor: Color(0x${rgbTo8hex(
        dropShadow[0].color,
        dropShadow[0].color.a
      )}), `;
      elevation = `\nelevation: ${numToAutoFixed(dropShadow[0].radius)}, `;
    }
  }

  return [elevation, shadowColor];
};
