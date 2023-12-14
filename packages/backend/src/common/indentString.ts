// From https://github.com/sindresorhus/indent-string
import { sliceNum } from "../common/numToAutoFixed";

export const compactProp = (prop: Record<string, string | number>, indentLevel: number = 2): string => {
  const propertiesArray = Object.entries(prop)
  .filter(([, value]) => value !== "")
  .map(
    ([key, value]) => indentString(`${key}=${typeof value === "number" ? sliceNum(value) : '"'+value+'"'}`)
  );
  return propertiesArray.join(" \n");
}

export const indentString = (str: string, indentLevel: number = 2): string => {
  // const options = {
  //   includeEmptyLines: false,
  // };

  // const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
  const regex = /^(?!\s*$)/gm;
  return str.replace(regex, " ".repeat(indentLevel));
};

export const indentStringFlutter = (
  str: string,
  indentLevel: number = 2
): string => {
  // const options = {
  //   includeEmptyLines: false,
  // };

  // const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
  const regex = /^(?!\s*$)/gm;
  return str.replace(regex, " ".repeat(indentLevel));
};
