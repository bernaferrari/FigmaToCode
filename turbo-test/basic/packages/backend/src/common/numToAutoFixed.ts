// this is necessary to avoid a height of 4.999999523162842.
export const numToAutoFixed = (num: number): string => {
  return num.toFixed(2).replace(/\.00$/, "");
};
