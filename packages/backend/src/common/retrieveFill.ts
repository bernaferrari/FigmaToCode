/**
 * Retrieve the first visible color that is being used by the layer, in case there are more than one.
 */
export const retrieveTopFill = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"],
): Paint | undefined => {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    // on Figma, the top layer is always at the last position
    // reverse, then try to find the first layer that is visible, if any.
    return [...fills].reverse().find((d) => d.visible !== false);
  }
};
