type VisibilityMixin = { visible: boolean };
const isVisible = (node: VisibilityMixin) => node.visible;
export const getVisibleNodes = (nodes: readonly SceneNode[]) =>
  nodes.filter(isVisible);
