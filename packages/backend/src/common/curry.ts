export function curry<T extends (...args: any[]) => any>(
  fn: T,
  arity = fn.length,
): any {
  return function curried(...args: any[]): any {
    if (args.length >= arity) {
      return fn(...args);
    }
    return function (...moreArgs: any[]) {
      return curried(...args, ...moreArgs);
    };
  };
}
