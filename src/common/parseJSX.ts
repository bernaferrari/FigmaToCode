import { numToAutoFixed } from "./numToAutoFixed";

export const formatWithJSX = (
  property: string,
  isJsx: boolean,
  value: number | string
): string => {
  // convert font-size to fontSize.
  const jsx_property = property
    .split("-")
    .map((d, i) => (i > 0 ? d.charAt(0).toUpperCase() + d.slice(1) : d))
    .join("");

  if (typeof value === "number") {
    if (isJsx) {
      return `${jsx_property}: ${numToAutoFixed(value)}, `;
    } else {
      return `${property}: ${numToAutoFixed(value)}px; `;
    }
  } else {
    if (isJsx) {
      return `${jsx_property}: '${value}', `;
    } else {
      return `${property}: ${value}; `;
    }
  }
};
