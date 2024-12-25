import { indentStringFlutter } from "./indentString";

// this is necessary to avoid a height of 4.999999523162842.
export const sliceNum = (num: number): string => {
  return num.toFixed(2).replace(/\.00$/, "");
};

export const printPropertyIfNotDefault = (
  propertyName: string,
  propertyValue: any,
  defaultProperty: any,
): string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return `${propertyName}: ${propertyValue}`;
};

export const skipDefaultProperty = <T>(
  propertyValue: T,
  defaultProperty: T,
): T | string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return propertyValue;
};

export const propertyIfNotDefault = (
  propertyValue: any,
  defaultProperty: any,
): string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return propertyValue;
};

export const generateWidgetCode = (
  className: string,
  properties: Record<string, number | string | string[]>,
  positionedValues?: string[],
): string => {
  console.log("properties", properties);
  const propertiesArray = Object.entries(properties)
    .filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== "";
    })
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [\n${indentStringFlutter(value.join(",\n"))},\n],`;
      } else {
        return `${key}: ${
          typeof value === "number" ? sliceNum(value) : value
        },`;
      }
    });

  const positionedValuesString = (positionedValues || [])
    .map((value) => {
      return typeof value === "number" ? sliceNum(value) : value;
    })
    .join(", ");

  const compactPropertiesArray = propertiesArray.join(" ");
  if (compactPropertiesArray.length < 40 && !positionedValues) {
    return `${className}(${compactPropertiesArray.slice(0, -1)})`;
  }

  const joined = `${positionedValuesString}${
    positionedValuesString ? ",\n" : ""
  }${propertiesArray.join("\n")}`;

  return `${className}(\n${indentStringFlutter(joined.trim())}\n)`;
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export const replaceAllUtil = (str: string, find: string, replace: string) =>
  str.replace(new RegExp(escapeRegExp(find), "g"), replace);

export function stringToClassName(name: string): string {
  const words = name.split(/[^a-zA-Z0-9]+/);
  const camelCaseWords = words.map((word, index) => {
    if (index === 0) {
      const cleanedWord = word.replace(/^[^a-zA-Z]+/g, "");
      return (
        cleanedWord.charAt(0).toUpperCase() + cleanedWord.slice(1).toLowerCase()
      );
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return camelCaseWords.join("");
}
