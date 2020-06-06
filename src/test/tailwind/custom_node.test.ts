import { CustomNode } from "../../tailwind/custom_node";
import { createFigma } from "figma-api-stub";

describe("Tailwind Custom AutoLayout", () => {
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
      expect(customNode.attributes).toEqual("inline-flex flex-col items-center ");
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
      expect(customNode.attributes).toEqual("inline-flex items-center ");
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
      expect(customNode.attributes).toEqual("relative ");
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
      expect(customNode.attributes).toEqual("inline-flex flex-col items-center ");
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
      expect(customNode.attributes).toEqual("inline-flex items-center ");
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
      expect(customNode.attributes).toEqual("relative ");
    });
  });
});
