export const PLACEHOLDER_IMAGE_DOMAIN = "https://placehold.co";

export const getPlaceholderImage = (w: number, h = -1) => {
  const _w = w.toFixed(0);
  const _h = (h < 0 ? w : h).toFixed(0);
  return `${PLACEHOLDER_IMAGE_DOMAIN}/${_w}x${_h}`;
};
