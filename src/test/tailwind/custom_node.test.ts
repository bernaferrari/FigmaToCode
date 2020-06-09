import { CustomNode } from "../../tailwind/custom_node";
import { createFigma } from "figma-api-stub";
import { getContainerSizeProp } from "../../tailwind/size";

describe("Tailwind Custom Node", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });

  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;

  describe("frame custom autolayout", () => {
    it("frame zero children", () => {
      const frame = figma.createFrame();
      frame.resize(32, 32);
      frame.layoutMode = "NONE";

      const customNode = new CustomNode(frame);
      expect(customNode.attributes).toEqual("");
    });

    it("frame one children", () => {
      const frame = figma.createFrame();
      frame.resize(32, 32);
      frame.layoutMode = "NONE";

      const node0 = figma.createRectangle();
      node0.resize(16, 16);
      node0.x = 0;
      node0.y = 0;
      frame.appendChild(node0);

      const customNode = new CustomNode(frame);
      expect(customNode.attributes).toEqual("");
    });

    it("frame two children vertical", () => {
      const frame = figma.createFrame();
      frame.resize(16, 32);
      frame.layoutMode = "NONE";

      const node0 = figma.createRectangle();
      node0.resize(16, 16);
      node0.x = 0;
      node0.y = 0;
      frame.appendChild(node0);

      const node1 = figma.createRectangle();
      node1.resize(16, 16);
      node1.x = 0;
      node1.y = 16;
      frame.appendChild(node1);

      const customNode = new CustomNode(frame);
      expect(customNode.attributes).toEqual(
        "inline-flex flex-col items-center justify-center "
      );
    });

    it("frame two children horizontal", () => {
      const frame = figma.createFrame();
      frame.resize(32, 16);
      frame.layoutMode = "NONE";

      const node0 = figma.createRectangle();
      node0.resize(16, 16);
      node0.x = 0;
      node0.y = 0;
      frame.appendChild(node0);

      const node1 = figma.createRectangle();
      node1.resize(16, 16);
      node1.x = 16;
      node1.y = 0;
      frame.appendChild(node1);

      const customNode = new CustomNode(frame);
      expect(customNode.attributes).toEqual(
        "inline-flex items-center justify-center "
      );
    });

    it("frame three children relative", () => {
      const frame = figma.createFrame();
      frame.resize(32, 32);
      frame.layoutMode = "NONE";

      const node0 = figma.createRectangle();
      node0.resize(16, 16);
      node0.x = 0;
      node0.y = 0;
      frame.appendChild(node0);

      const node1 = figma.createRectangle();
      node1.resize(16, 16);
      node1.x = 0;
      node1.y = 16;
      frame.appendChild(node1);

      const node2 = figma.createRectangle();
      node2.resize(16, 16);
      node2.x = 16;
      node2.y = 0;
      frame.appendChild(node2);

      const customNode = new CustomNode(frame);
      expect(customNode.attributes).toEqual(
        "inline-flex items-center justify-center "
      );
    });
  });

  describe("group custom autolayout", () => {
    it("group one children", () => {
      const frame = figma.createFrame();
      frame.resize(32, 32);

      const node0 = figma.createRectangle();
      node0.resize(16, 16);
      node0.x = 0;
      node0.y = 0;

      const customNode = new CustomNode(figma.group([node0], frame));
      expect(customNode.attributes).toEqual("");
    });

    it("group two children vertical", () => {
      const frame = figma.createFrame();
      frame.resize(16, 32);

      const node0 = figma.createRectangle();
      node0.resize(16, 16);
      node0.x = 0;
      node0.y = 0;

      const node1 = figma.createRectangle();
      node1.resize(16, 16);
      node1.x = 0;
      node1.y = 16;

      const customNode = new CustomNode(figma.group([node0, node1], frame));
      expect(customNode.attributes).toEqual(
        "inline-flex flex-col items-center justify-center "
      );
    });

    it("group two children horizontal", () => {
      const frame = figma.createFrame();
      frame.resize(32, 16);

      const node0 = figma.createRectangle();
      node0.resize(16, 16);
      node0.x = 0;
      node0.y = 0;

      const node1 = figma.createRectangle();
      node1.resize(16, 16);
      node1.x = 16;
      node1.y = 0;

      const customNode = new CustomNode(figma.group([node0, node1], frame));
      expect(customNode.attributes).toEqual("inline-flex items-center justify-center ");
    });

    it("group three children relative", () => {
      const frame = figma.createFrame();
      frame.resize(32, 32);
      frame.layoutMode = "NONE";

      const node0 = figma.createRectangle();
      node0.resize(16, 16);
      node0.x = 0;
      node0.y = 0;

      const node1 = figma.createRectangle();
      node1.resize(16, 16);
      node1.x = 0;
      node1.y = 16;

      const node2 = figma.createRectangle();
      node2.resize(16, 16);
      node2.x = 16;
      node2.y = 0;

      const customNode = new CustomNode(
        figma.group([node0, node1, node2], frame)
      );
      expect(customNode.attributes).toEqual(
        "inline-flex items-center justify-center "
      );
    });
  });

  describe("complex layouts for autoautolayout", () => {
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
      expect(getContainerSizeProp(node)).toEqual("w-16 ");
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
      expect(getContainerSizeProp(node)).toEqual("w-16 ");
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
});
