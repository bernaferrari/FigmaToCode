import { lowercaseFirstLetter } from "./lowercaseFirstLetter";

export const getClassLabel = (isJSX: boolean = false) =>
  isJSX ? "className" : "class";

export const joinStyles = (styles: string[], isJSX: boolean) =>
  styles.map((s) => s.trim()).join(isJSX ? ", " : "; ");

export const formatStyleAttribute = (
  styles: string[],
  isJSX: boolean,
): string => {
  const trimmedStyles = joinStyles(styles, isJSX);

  if (trimmedStyles === "") return "";

  return ` style=${isJSX ? `{{${trimmedStyles}}}` : `"${trimmedStyles}"`}`;
};

export const formatDataAttribute = (label: string, value?: string) =>
  ` data-${lowercaseFirstLetter(label).replace(" ", "-")}${value === undefined ? `` : `="${value}"`}`;

export const formatClassAttribute = (
  classes: string[],
  isJSX: boolean,
): string =>
  classes.length === 0 ? "" : ` ${getClassLabel(isJSX)}="${classes.join(" ")}"`;
