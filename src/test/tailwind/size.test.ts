import { createFigma } from "figma-api-stub";
import { tailwindMain } from "../../tailwind/tailwind_main";
import { getContainerSizeProp } from "../../tailwind/size";

describe("Tailwind Size", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });

  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;

  it("rect", () => {
    const node = figma.createRectangle();
    node.resize(16, 16);
    expect(getContainerSizeProp(node)).toEqual("w-4 h-4 ");
  });

  it("frame", () => {
    const node = figma.createFrame();
    node.resize(16, 16);
    expect(getContainerSizeProp(node)).toEqual("w-4 h-4 ");
  });

  it("frame inside frame", () => {
    const node = figma.createFrame();
    node.resize(16, 16);

    const subnode = figma.createFrame();
    subnode.resize(16, 16);

    node.appendChild(subnode);

    expect(getContainerSizeProp(node)).toEqual("");
    expect(getContainerSizeProp(subnode)).toEqual("w-full ");
  });

  it("frame inside frame (1/2)", () => {
    const node = figma.createFrame();
    node.resize(16, 16);

    const subnode = figma.createFrame();
    subnode.resize(8, 8);

    node.appendChild(subnode);

    expect(getContainerSizeProp(node)).toEqual("w-4 h-4 ");
    expect(getContainerSizeProp(subnode)).toEqual("w-1/2 h-2 ");
  });

  it("small frame inside large frame", () => {
    const node = figma.createFrame();
    node.resize(500, 500);

    const subnode = figma.createFrame();
    subnode.resize(8, 8);

    node.appendChild(subnode);

    expect(getContainerSizeProp(node)).toEqual("");
    expect(getContainerSizeProp(subnode)).toEqual("w-2 h-2 ");
  });
});
