// https://stackoverflow.com/a/20762713
export const mostFrequent = (arr: Array<any>): any => {
  return arr
    .sort(
      (a, b) =>
        arr.filter((v) => v === a).length - arr.filter((v) => v === b).length
    )
    .pop();
};
