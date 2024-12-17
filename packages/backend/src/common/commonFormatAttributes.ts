import { stringToClassName as stringToClassName } from "./numToAutoFixed";

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

export const formatLayerNameAttribute = (name: string) =>
  name === "" ? "" : ` data-layer="${name}"`;

export const formatClassAttribute = (
  classes: string[],
  isJSX: boolean,
): string =>
  classes.length === 0 ? "" : ` ${getClassLabel(isJSX)}="${classes.join(" ")}"`;
