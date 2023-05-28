import { indentStringFlutter } from "./indentString";

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

export const skipDefaultProperty = <T>(
  propertyValue: T,
  defaultProperty: T
): T | string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return propertyValue;
};

export const propertyIfNotDefault = (
  propertyValue: any,
  defaultProperty: any
): string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return propertyValue;
};

export const generateWidgetCode = (
  className: string,
  properties: Record<string, number | string>
): string => {
  const propertiesArray = Object.entries(properties)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => {
      if (typeof value === "number") {
        return `${key}: ${sliceNum(value)},`;
      }
      return `${key}: ${value},`;
    });

  if (propertiesArray.length === 0) {
    return `${className}()`;
  }

  const joined = propertiesArray.join(" ");

  if (joined.length < 40) {
    return `${className}(${joined.slice(0, -1)})`;
  }

  return `${className}(\n${indentStringFlutter(propertiesArray.join("\n"))}\n)`;
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export const replaceAllUtil = (str: string, find: string, replace: string) =>
  str.replace(new RegExp(escapeRegExp(find), "g"), replace);

export function className(name: string): string {
  const cleanedName = name
    .replace(/[^a-zA-Z0-9]+/g, "")
    .replace(/^[0-9]+/g, "");
  return cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
}
