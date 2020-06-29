// retrieve the SOLID color for Flutter when existent, otherwise ""
export const flutterColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
) => {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    let fill = fills[0];

    if (fill.type === "SOLID") {

      let opacity = fill.opacity ?? 1.0;

      // if fill isn't visible, it shouldn't be painted.
      return opacity
        ? `color: Color(0x${rgbaTohex(fill.color, opacity)}),`
        : "";
    }
  }

  return "";
};

// Convert RGB (r,g,b: [0, 1]) + alpha [0, 1] to 8 digit hex
// Convert RGBA (r,g,b,a: [0, 1]) to 8 digit hex
export const rgbaTohex = (
  color: RGB | RGBA,
  alpha: number = "a" in color ? color.a : 1.0
): string => {
  // when color is RGBA, alpha is set automatically
  // when color is RGB, alpha need to be set manually (default: 1.0)
  const hex =
    ((alpha * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.r * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.g * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.b * 255) | (1 << 8)).toString(16).slice(1);

  return hex;
};

// Convert generic named weights to numbers, which is the way Flutter understands
export const convertFontWeight = (weight: string) => {
  switch (weight) {
    case "Thin":
      return "100";
    case "Extra Light":
      return "200";
    case "Light":
      return "300";
    case "Regular":
      return "400";
    case "Medium":
      return "500";
    case "Semi Bold":
      return "600";
    case "Bold":
      return "700";
    case "Extra Bold":
      return "800";
    case "Black":
      return "900";
    default:
      return "400";
  }
};

// https://stackoverflow.com/a/20762713
export const mostFrequent = (arr: Array<any>) => {
  return arr
    .sort(
      (a, b) =>
        arr.filter((v) => v === a).length - arr.filter((v) => v === b).length
    )
    .pop();
};
