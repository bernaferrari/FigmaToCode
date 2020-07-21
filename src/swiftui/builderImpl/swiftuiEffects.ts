import { AltSceneNode } from "../../altNodes/altMixins";
import { numToAutoFixed } from "../../common/numToAutoFixed";

export const swiftuiShadow = (node: AltSceneNode): string => {
  if (!node.effects || node.effects.length === 0) {
    return "";
  }

  const dropShadow: Array<ShadowEffect> = node.effects.filter(
    (d): d is ShadowEffect => d.type === "DROP_SHADOW" && d.visible !== false
  );

  if (dropShadow.length === 0) {
    return "";
  }

  // retrieve first shadow.
  const shadow = dropShadow[0];
  let comp = "";

  const color = shadow.color;
  // set color when not black with 0.25 of opacity, which is the Figma default. Round the alpha now to avoid rounding issues.
  const a = numToAutoFixed(color.a);
  if (color.r + color.g + color.b === 0 && a !== "0.25") {
    const r = numToAutoFixed(color.r);
    const g = numToAutoFixed(color.g);
    const b = numToAutoFixed(color.b);
    comp += `color: Color(red: ${r}, green: ${g}, blue: ${b}, opacity: ${a}), `;
  }

  comp += `radius: ${numToAutoFixed(shadow.radius)}`;

  if (shadow.offset.x !== shadow.offset.y) {
    const x =
      shadow.offset.x > 0 ? `x: ${numToAutoFixed(shadow.offset.x)}` : "";
    const y =
      shadow.offset.y > 0 ? `y: ${numToAutoFixed(shadow.offset.y)}` : "";

    // add initial comma since this is an optional paramater and radius must come first.
    comp += ", ";
    if (x && y) {
      comp += `${x}, ${y}`;
    } else {
      // no comma in the middle, since only one of them will be valid
      comp += `${x}${y}`;
    }
  }

  return `\n.shadow(${comp})`;
};

export const swiftuiBlur = (node: AltSceneNode): string => {
  if (!node.effects || node.effects.length === 0) {
    return "";
  }

  const layerBlur: Array<BlurEffect> = node.effects.filter(
    (d): d is BlurEffect => d.type === "LAYER_BLUR" && d.visible !== false
  );

  if (layerBlur.length === 0) {
    return "";
  }

  // retrieve first blur.
  const blur = layerBlur[0].radius;
  return `\n.blur(radius: ${numToAutoFixed(blur)})`;
};
