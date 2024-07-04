/**
 * Assert a node exists and has a certain property and value
 *
 * @param node
 * @param prop
 * @param value
 */
export function hasProp<
  T extends Record<string, any> | null | undefined,
  K extends T extends Record<string, any> ? keyof T : never
>(
  node: T,
  prop: K,
  value?: T extends Record<string, any> ? T[keyof T] : never
): boolean {
  return node !== null && node !== undefined
    && (prop in node)
    && (value === undefined ? true : node[prop] === value);
}

/**
 * Get a prop from a node if it exists
 *
 * @param node
 * @param prop
 */
export function getProp<
  T extends Record<string, any> | null | undefined,
  K extends T extends Record<string, any> ? keyof T : never
>(
  node: T,
  prop: K,
): T extends Record<string, any> ? T[K] : undefined {
  if (node !== null && node !== undefined && prop in node) {
    return node[prop];
  }
  // @ts-ignore
  return undefined;
}
