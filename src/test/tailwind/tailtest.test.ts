import { createFigma } from "figma-api-stub";
// import * as figmaApiStub from "figma-api-stub";

describe("Tailwind Rectangle", () => {
  it("sync function returns true", () => {
    const figma = createFigma({
      simulateErrors: true,
      isWithoutTimeout: false,
    });
    const rect = figma.createRectangle();
    rect.resize(100, 200);
    console.log(rect);
  });
});
