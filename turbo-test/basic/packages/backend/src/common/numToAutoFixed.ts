import { indentString, indentStringFlutter } from "./indentString";

// this is necessary to avoid a height of 4.999999523162842.
export const sliceNum = (num: number): string => {
  return num.toFixed(2).replace(/\.00$/, "");
};

export const printPropertyIfNotDefault = (
  propertyName: string,
  propertyValue: any,
  defaultProperty: any
): string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return `${propertyName}: ${propertyValue}`;
};

export const generateWidgetCode = (
  className: string,
  properties: Record<string, string>
): string => {
  const printedProperties = Object.entries(properties)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}: ${value},`)
    .join("\n");

  return `${className}(\n${indentStringFlutter(printedProperties)}\n)`;
};
