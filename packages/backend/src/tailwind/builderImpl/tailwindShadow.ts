/**
 * https://tailwindcss.com/docs/box-shadow/
 * example: shadow
 */
export const tailwindShadow = (node: BlendMixin): string[] => {
  // [when testing] node.effects can be undefined
  if (node.effects && node.effects.length > 0) {
    const EPSILON = 0.0001; // Small tolerance for floating-point comparison

    const dropShadow = node.effects.map((d) => {
      if (d.type === "DROP_SHADOW") {
        if (
          d.offset?.x === 0 &&
          d.offset?.y === 1 &&
          d.radius === 2 &&
          d.spread === 0 &&
          d.color?.r === 0 &&
          d.color?.g === 0 &&
          d.color?.b === 0 &&
          Math.abs(d.color?.a - 0.05) < EPSILON
        ) {
          return "shadow-sm";
        } else if (
          d.offset?.x === 0 &&
          d.offset?.y === 1 &&
          d.radius === 3 &&
          d.spread === 0 &&
          d.color?.r === 0 &&
          d.color?.g === 0 &&
          d.color?.b === 0 &&
          Math.abs(d.color?.a - 0.1) < EPSILON
        ) {
          return "shadow";
        } else if (
          d.offset?.x === 0 &&
          d.offset?.y === 4 &&
          d.radius === 6 &&
          d.spread === -1 &&
          d.color?.r === 0 &&
          d.color?.g === 0 &&
          d.color?.b === 0 &&
          Math.abs(d.color?.a - 0.1) < EPSILON
        ) {
          return "shadow-md";
        } else if (
          d.offset?.x === 0 &&
          d.offset?.y === 10 &&
          d.radius === 15 &&
          d.spread === -3 &&
          d.color?.r === 0 &&
          d.color?.g === 0 &&
          d.color?.b === 0 &&
          Math.abs(d.color?.a - 0.1) < EPSILON
        ) {
          return "shadow-lg";
        } else if (
          d.offset?.x === 0 &&
          d.offset?.y === 20 &&
          d.radius === 25 &&
          d.spread === -5 &&
          d.color?.r === 0 &&
          d.color?.g === 0 &&
          d.color?.b === 0 &&
          Math.abs(d.color?.a - 0.1) < EPSILON
        ) {
          return "shadow-xl";
        } else if (
          d.offset?.x === 0 &&
          d.offset?.y === 25 &&
          d.radius === 50 &&
          d.spread === -12 &&
          d.color?.r === 0 &&
          d.color?.g === 0 &&
          d.color?.b === 0 &&
          Math.abs(d.color?.a - 0.25) < EPSILON
        ) {
          return "shadow-2xl";
        } else {
          const offsetX = d.offset?.x || 0;
          const offsetY = d.offset?.y || 0;
          const radius = d.radius || 0;
          const spread = d.spread || 0;
          const r = Math.round((d.color?.r || 0) * 255);
          const g = Math.round((d.color?.g || 0) * 255);
          const b = Math.round((d.color?.b || 0) * 255);
          const a = (d.color?.a || 0).toFixed(2); // Limit alpha to 2 decimal, otherwise we will get values like 0.12356587999
          return `shadow-[${offsetX}px_${offsetY}px_${radius}px_${spread}px_rgba(${r},${g},${b},${a})]`;
        }
      }
      return "";
    }).filter(Boolean);

    const innerShadow = node.effects.map((d) => {
      if (d.type === "INNER_SHADOW") {
        if (
          d.offset?.x === 0 &&
          d.offset?.y === 2 &&
          d.radius === 4 &&
          d.spread === 0 &&
          d.color?.r === 0 &&
          d.color?.g === 0 &&
          d.color?.b === 0 &&
          Math.abs(d.color?.a - 0.05) < EPSILON
        ) {
          return "shadow-inner";
        } else {
          const offsetX = d.offset?.x || 0;
          const offsetY = d.offset?.y || 0;
          const radius = d.radius || 0;
          const spread = d.spread || 0;
          const r = Math.round((d.color?.r || 0) * 255);
          const g = Math.round((d.color?.g || 0) * 255);
          const b = Math.round((d.color?.b || 0) * 255);
          const a = (d.color?.a || 0).toFixed(2); // Limit alpha to 2 decimal, otherwise we will get values like 0.12356587999
          return `shadow-[inset_${offsetX}px_${offsetY}px_${radius}px_${spread}px_rgba(${r},${g},${b},${a})]`;
        }
      }
      return "";
    }).filter(Boolean);

    return [...dropShadow, ...innerShadow];
  }
  return [];
};
