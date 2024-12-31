import { curry } from "../common/curry";

export const overrideReadonlyProperty = curry(
  <T, K extends keyof T>(prop: K, value: any, obj: T): void => {
    Object.defineProperty(obj, prop, {
      value: value,
      writable: true,
      configurable: true,
    });
  },
);

export const assignParent = overrideReadonlyProperty("parent");

export function isNotEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}
