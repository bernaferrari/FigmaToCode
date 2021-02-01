// From https://github.com/sindresorhus/indent-string
export const indentString = (str: string, indentLevel: number = 1): string => {
  // const options = {
  //   includeEmptyLines: false,
  // };

  // const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
  const regex = /^(?!\s*$)/gm;
  return str.replace(regex, " ".repeat(indentLevel * 4));
};
