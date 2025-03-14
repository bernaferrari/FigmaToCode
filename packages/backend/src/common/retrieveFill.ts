import { Paint } from "../api_types";

/**
 * Retrieve the first visible color that is being used by the layer, in case there are more than one.
 */
export const retrieveTopFill = (
  fills: ReadonlyArray<Paint> | undefined,
): Paint | undefined => {
  if (fills && Array.isArray(fills) && fills.length > 0) {
    // on Figma, the top layer is always at the last position
    // reverse, then try to find the first layer that is visible, if any.
    return [...fills].reverse().find((d) => d.visible !== false);
  }

  return undefined;
};
