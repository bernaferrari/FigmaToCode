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

    expect(getContainerSizeProp(node)).toEqual("w-full h-64 ");
    expect(getContainerSizeProp(subnode)).toEqual("w-2 h-2 ");
  });

  describe("when layoutAlign is STRETCH", () => {
    it("autolayout is horizontal, width should be full", () => {
      const node = figma.createFrame();
      node.resize(500, 500);
      node.layoutMode = "HORIZONTAL";

      const subnode = figma.createRectangle();
      subnode.resize(25, 25);
      subnode.layoutAlign = "STRETCH";
      // todo is this correct? Maybe it should be w-full
      node.appendChild(subnode);

      expect(getContainerSizeProp(node)).toEqual("");
      expect(getContainerSizeProp(subnode)).toEqual("w-full ");
    });

    it("autolayout is vertical, height should be ???", () => {
      const node = figma.createFrame();
      node.resize(500, 500);
      node.layoutMode = "VERTICAL";

      const subnode = figma.createRectangle();
      subnode.resize(25, 25);
      subnode.layoutAlign = "STRETCH";
      // todo is this correct? Maybe it should be w-full
      node.appendChild(subnode);

      expect(getContainerSizeProp(node)).toEqual("");
      expect(getContainerSizeProp(subnode)).toEqual("w-6 h-6 ");
    });
  });

  describe("parent is frame, node is frame, both the same layoutMode", () => {
    it("when parent is horizontal and node is horizontal, child defines the size", () => {
      const node = figma.createFrame();
      node.resize(500, 500);
      node.layoutMode = "HORIZONTAL";

      const subnode = figma.createFrame();
      subnode.resize(500, 250);
      subnode.layoutMode = "HORIZONTAL";

      const child = figma.createFrame();
      child.resize(16, 16);
      subnode.appendChild(child);
      node.appendChild(subnode);

      expect(getContainerSizeProp(node)).toEqual("");
      expect(getContainerSizeProp(subnode)).toEqual("");
      expect(getContainerSizeProp(child)).toEqual("w-4 h-4 ");
    });

    it("when parent is vertical and node is vertical, child defines the size", () => {
      const node = figma.createFrame();
      node.resize(500, 500);
      node.layoutMode = "VERTICAL";

      const subnode = figma.createFrame();
      subnode.resize(500, 250);
      subnode.layoutMode = "VERTICAL";

      const child = figma.createFrame();
      child.resize(16, 16);
      subnode.appendChild(child);
      node.appendChild(subnode);

      expect(getContainerSizeProp(node)).toEqual("");
      expect(getContainerSizeProp(subnode)).toEqual("");
      expect(getContainerSizeProp(child)).toEqual("w-4 h-4 ");
    });
  });

  describe("frame is too large for Tailwind to handle", () => {
    it("if width is too large", () => {
      const node = figma.createFrame();
      node.resize(500, 64);
      node.layoutMode = "NONE";
      node.counterAxisSizingMode = "FIXED";

      expect(getContainerSizeProp(node)).toEqual("w-full h-16 ");
    });

    it("if height is too large without children", () => {
      const node = figma.createFrame();
      node.resize(64, 500);
      node.layoutMode = "NONE";
      node.counterAxisSizingMode = "FIXED";

      // max of h-64
      expect(getContainerSizeProp(node)).toEqual("w-16 h-64 ");
    });

    it("if height is too large with children", () => {
      const node = figma.createFrame();
      node.resize(64, 500);
      node.layoutMode = "NONE";
      node.counterAxisSizingMode = "FIXED";

      const subnode = figma.createFrame();
      subnode.resize(64, 250);
      subnode.layoutMode = "NONE";
      node.appendChild(subnode);

      // h-auto
      expect(getContainerSizeProp(node)).toEqual("w-16 h-64 ");
    });
    // todo improve this. Try to set the parent height to be the same as children before h-auto
    it("children are higher than node", () => {
      const node = figma.createFrame();
      node.resize(16, 16);
      node.layoutMode = "NONE";
      node.counterAxisSizingMode = "FIXED";

      const subnode = figma.createFrame();
      subnode.resize(32, 32);
      subnode.layoutMode = "NONE";
      node.appendChild(subnode);

      // h-auto
      expect(getContainerSizeProp(node)).toEqual("w-4 h-4 ");
    });

    it("child is way larger than node", () => {
      const node = figma.createFrame();
      node.resize(16, 16);
      node.layoutMode = "NONE";
      node.counterAxisSizingMode = "FIXED";

      const subnode = figma.createFrame();
      subnode.resize(257, 257);
      subnode.layoutMode = "NONE";
      node.appendChild(subnode);

      // todo this seems wrong
      // h-auto
      expect(getContainerSizeProp(node)).toEqual("w-4 h-4 ");
    });
  });

  // todo stroke

  // when parent is HORIZONTAL and child is HORIZONTAL, let the child define the size
});
