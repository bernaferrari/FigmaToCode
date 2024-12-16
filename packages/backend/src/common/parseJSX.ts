import { sliceNum } from "./numToAutoFixed";

export const formatWithJSX = (
  property: string,
  isJsx: boolean,
  value: number | string,
): string => {
  // convert font-size to fontSize.
  const jsx_property = property
    .split("-")
    .map((d, i) => (i > 0 ? d.charAt(0).toUpperCase() + d.slice(1) : d))
    .join("");

  if (typeof value === "number") {
    if (isJsx) {
      return `${jsx_property}: ${sliceNum(value)}`;
    } else {
      return `${property}: ${sliceNum(value)}px`;
    }
  } else if (isJsx) {
    return `${jsx_property}: '${value}'`;
  } else {
    return `${property}: ${value}`;
  }
};

export const formatMultipleJSXArray = (
  styles: Record<string, string | number>,
  isJsx: boolean,
): string[] =>
  Object.entries(styles)
    .filter(([key, value]) => value !== "")
    .map(([key, value]) => formatWithJSX(key, isJsx, value));

export const formatMultipleJSX = (
  styles: Record<string, string | number | null>,
  isJsx: boolean,
): string =>
  Object.entries(styles)
    .filter(([key, value]) => value)
    .map(([key, value]) => formatWithJSX(key, isJsx, value!))
    .join(isJsx ? ", " : "; ");
