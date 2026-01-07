// Mock global figma object for tests
(global as any).figma = {
  mixed: Symbol("figma.mixed"),
  ui: {
    postMessage: () => {},
  },
};
