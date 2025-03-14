export const getVisibleNodes = (nodes: readonly SceneNode[]) =>
  nodes.filter((d) => d.visible ?? true);
