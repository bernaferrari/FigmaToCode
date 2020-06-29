import { rgbTo8hex } from "../../common/rgbToHex";

// retrieve the SOLID color for Flutter when existent, otherwise ""
export const flutterColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    const fill = fills[0];

    if (fill.type === "SOLID") {
      const opacity = fill.opacity ?? 1.0;

      // if fill isn't visible, it shouldn't be painted.
      return opacity
        ? `color: Color(0x${rgbTo8hex(fill.color, opacity)}),`
        : "";
    }
  }

  return "";
};
