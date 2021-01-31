// From https://github.com/sindresorhus/indent-string
export const indentString = (str: string, indentLevel: number): string => {
  const options = {
    includeEmptyLines: false,
  };

  const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
  return str.replace(regex, " ".repeat(indentLevel * 4));
};
