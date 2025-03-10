export function lowercaseFirstLetter(str: string): string {
  if (!str || str.length === 0) {
    return str;
  }

  return str.charAt(0).toLowerCase() + str.slice(1);
}
