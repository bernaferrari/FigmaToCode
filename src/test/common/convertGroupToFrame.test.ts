import { tailwindMain } from "./../../tailwind/tailwindMain";
import { AltGroupNode, AltRectangleNode } from "./../../common/altMixins";
import { convertGroupToFrame } from "./../../common/convertGroupToFrame";
import { createFigma } from "figma-api-stub";

describe("Convert Group to Frame", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;
  it("Simple conversion", () => {
    const rectangle = new AltRectangleNode();
    rectangle.x = 20;
    rectangle.y = 20;
    rectangle.width = 20;
    rectangle.height = 20;

    const group = new AltGroupNode();
    group.x = 20;
    group.y = 20;
    group.width = 20;
    group.height = 20;
    group.children = [rectangle];

    expect(
      tailwindMain("", [convertGroupToFrame(group)], false, false)
    ).toEqual('<div class="w-full h-5"></div>');
  });
});
