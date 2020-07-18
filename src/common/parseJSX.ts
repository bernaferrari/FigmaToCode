import { numToAutoFixed } from "./numToAutoFixed";

export const parseNumJSX = (
  std_str: string,
  jsx_str: string,
  isJsx: boolean,
  value: number
): string => {
  if (isJsx) {
    return `${jsx_str}: ${numToAutoFixed(value)}, `;
  } else {
    return `${std_str}: ${numToAutoFixed(value)}px; `;
  }
};
