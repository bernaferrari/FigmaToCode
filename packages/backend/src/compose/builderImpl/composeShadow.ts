import { rgbTo8hex } from "../../common/color";
import { numberToFixedString } from "../../common/numToAutoFixed";

/**
 * Converts Figma shadow effects to Jetpack Compose shadow modifiers
 * @param effects Array of effects from a Figma node
 * @returns Compose shadow modifier string
 */
export const composeShadow = (effects: readonly Effect[]): string => {
  if (!effects || effects.length === 0) {
    return "";
  }

  const shadowEffects = effects.filter(
    (effect) =>
      (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") &&
      effect.visible !== false
  );

  if (shadowEffects.length === 0) {
    return "";
  }

  const shadowModifiers: string[] = [];

  shadowEffects.forEach((effect) => {
    if (effect.type === "DROP_SHADOW") {
      const offsetX = numberToFixedString(effect.offset.x);
      const offsetY = numberToFixedString(effect.offset.y);
      const blurRadius = numberToFixedString(effect.radius);
      const spreadRadius = effect.spread ? numberToFixedString(effect.spread) : "0";
      
      // Convert Figma color to Compose Color
      const color = rgbTo8hex(effect.color, effect.color.a);
      
      // For simple shadows with no spread and small blur, use elevation
      if (effect.spread === 0 && effect.radius <= 8 && effect.offset.x === 0) {
        const elevation = Math.abs(effect.offset.y);
        if (elevation > 0 && elevation <= 24) {
          shadowModifiers.push(`shadow(${numberToFixedString(elevation)}.dp)`);
          return;
        }
      }
      
      // For complex shadows, use drawBehind with custom drawing
      if (effect.offset.x !== 0 || effect.offset.y !== 0 || effect.spread !== 0) {
        shadowModifiers.push(`drawBehind {
    drawRect(
        color = Color(0x${color.toUpperCase()}),
        topLeft = Offset(${offsetX}.dp.toPx(), ${offsetY}.dp.toPx()),
        size = size.copy(
            width = size.width + ${spreadRadius}.dp.toPx(),
            height = size.height + ${spreadRadius}.dp.toPx()
        ),
        blendMode = BlendMode.Multiply
    )
}`);
      } else {
        // Simple shadow with custom color
        shadowModifiers.push(`shadow(${blurRadius}.dp, shape = RectangleShape)`);
      }
    } else if (effect.type === "INNER_SHADOW") {
      // Inner shadows in Compose require custom drawing
      const offsetX = numberToFixedString(effect.offset.x);
      const offsetY = numberToFixedString(effect.offset.y);
      const blurRadius = numberToFixedString(effect.radius);
      const color = rgbTo8hex(effect.color, effect.color.a);
      
      shadowModifiers.push(`drawWithContent {
    drawContent()
    drawRect(
        color = Color(0x${color.toUpperCase()}),
        topLeft = Offset(${offsetX}.dp.toPx(), ${offsetY}.dp.toPx()),
        size = size,
        blendMode = BlendMode.Multiply
    )
}`);
    }
  });

  return shadowModifiers.join("\n.");
};

/**
 * Helper function to determine if a shadow can use simple elevation
 * @param effect The shadow effect to check
 * @returns boolean indicating if simple elevation can be used
 */
export const canUseSimpleElevation = (effect: Effect): boolean => {
  if (effect.type !== "DROP_SHADOW") {
    return false;
  }
  
  return (
    effect.offset.x === 0 &&
    effect.offset.y > 0 &&
    effect.offset.y <= 24 &&
    effect.spread === 0 &&
    effect.radius <= 8
  );
};

/**
 * Maps common Figma shadow presets to Material Design elevation levels
 * @param effect The shadow effect
 * @returns Material Design elevation level or null if no match
 */
export const getMaterialElevation = (effect: Effect): number | null => {
  if (effect.type !== "DROP_SHADOW" || !canUseSimpleElevation(effect)) {
    return null;
  }

  const offsetY = Math.abs(effect.offset.y);
  const blur = effect.radius;
  
  // Material Design elevation mappings
  if (offsetY === 1 && blur === 3) return 1;
  if (offsetY === 2 && blur === 4) return 2;
  if (offsetY === 3 && blur === 5) return 3;
  if (offsetY === 4 && blur === 6) return 4;
  if (offsetY === 6 && blur === 10) return 6;
  if (offsetY === 8 && blur === 12) return 8;
  if (offsetY === 12 && blur === 17) return 12;
  if (offsetY === 16 && blur === 24) return 16;
  if (offsetY === 24 && blur === 38) return 24;
  
  return offsetY; // Fallback to offset as elevation
};