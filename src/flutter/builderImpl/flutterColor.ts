import { rgbTo8hex } from "../../common/color";
import { retrieveFill } from "../../common/retrieveFill";

/**
 * Retrieve the SOLID color for Flutter when existent, otherwise ""
 */
export const flutterColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string => {
  const fill = retrieveFill(fills);

  if (fill?.type === "SOLID") {
    const opacity = fill.opacity ?? 1.0;

    // todo maybe ignore text color when it is black?

    return `color: Color(0x${rgbTo8hex(fill.color, opacity)}), `;
  }

  return "";
};
