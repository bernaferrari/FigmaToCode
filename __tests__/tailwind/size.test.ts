import { frameNodeToAlt } from "../../src/altNodes/altConversion";
import { createFigma } from "figma-api-stub";
import { tailwindSize } from "../../src/tailwind/builderImpl/tailwindSize";
import { convertSingleNodeToAlt } from "../../src/altNodes/altConversion";

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
    const updatedNode = convertSingleNodeToAlt(node);
    expect(tailwindSize(updatedNode)).toEqual("w-4 h-4 ");
  });

  it("frame", () => {
    const node = figma.createFrame();
    node.resize(16, 16);
    expect(tailwindSize(frameNodeToAlt(node))).toEqual("w-4 h-4 ");
  });

  it("frame inside frame", () => {
    const node = figma.createFrame();
    node.resize(16, 16);

    const subnode = figma.createFrame();
    subnode.resize(16, 16);

    node.appendChild(subnode);

    expect(tailwindSize(frameNodeToAlt(node))).toEqual("");
    expect(tailwindSize(frameNodeToAlt(subnode))).toEqual("w-4 h-4 ");
  });

  it("frame inside frame (1/2)", () => {
    const node = figma.createFrame();
    node.resize(8, 8);

    const subnode = figma.createFrame();
    subnode.resize(8, 8);

    node.appendChild(subnode);

    expect(tailwindSize(frameNodeToAlt(node))).toEqual("");
    expect(tailwindSize(frameNodeToAlt(subnode))).toEqual("w-2 h-2 ");
  });

  it("small frame inside large frame", () => {
    const node = figma.createFrame();
    node.resize(500, 500);

    const subnode = figma.createFrame();
    subnode.resize(8, 8);

    node.appendChild(subnode);

    expect(tailwindSize(frameNodeToAlt(node))).toEqual("w-full ");
    expect(tailwindSize(frameNodeToAlt(subnode))).toEqual("w-2 h-2 ");
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

      expect(tailwindSize(frameNodeToAlt(node))).toEqual("");
      expect(tailwindSize(convertSingleNodeToAlt(subnode))).toEqual("w-6 h-6 ");
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

      expect(tailwindSize(frameNodeToAlt(node))).toEqual("");
      expect(tailwindSize(convertSingleNodeToAlt(subnode))).toEqual("w-6 h-6 ");
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

      expect(tailwindSize(frameNodeToAlt(node))).toEqual("");
      expect(tailwindSize(frameNodeToAlt(subnode))).toEqual("");
      expect(tailwindSize(frameNodeToAlt(child))).toEqual("w-4 h-4 ");
    });

    it("when parent is vertical and node is vertical, child defines the size", () => {
      const node = figma.createFrame();
      node.resize(500, 500);
      node.counterAxisSizingMode = "FIXED";
      node.layoutMode = "VERTICAL";

      const subnode = figma.createFrame();
      subnode.counterAxisSizingMode = "FIXED";
      subnode.resize(500, 250);
      subnode.layoutMode = "VERTICAL";

      const child = figma.createFrame();
      child.resize(16, 16);
      subnode.appendChild(child);
      node.appendChild(subnode);

      expect(tailwindSize(frameNodeToAlt(node))).toEqual("");
      expect(tailwindSize(frameNodeToAlt(subnode))).toEqual("w-full ");
      expect(tailwindSize(frameNodeToAlt(child))).toEqual("w-4 h-4 ");
    });
  });

  //   describe("frame is too large for Tailwind to handle", () => {
  //     it("frame with no children becomes a rectangle (too large width)", () => {
  //       const node = figma.createFrame();
  //       node.resize(500, 64);
  //       node.layoutMode = "NONE";
  //       node.counterAxisSizingMode = "FIXED";

  //       expect(getContainerSizeProp(frameNodeToAlt(node))).toEqual(
  //         "w-full h-16 "
  //       );
  //     });

  //     it("frame with no children becomes a rectangle (too large height)", () => {
  //       const node = figma.createFrame();
  //       node.resize(64, 500);
  //       node.layoutMode = "NONE";

  //       // max of h-64
  //       expect(getContainerSizeProp(frameNodeToAlt(node))).toEqual("w-16 h-64 ");
  //     });

  //     it("if height is too large with children", () => {
  //       const node = figma.createFrame();
  //       node.resize(64, 500);
  //       node.layoutMode = "NONE";
  //       node.counterAxisSizingMode = "FIXED";

  //       const subnode = figma.createFrame();
  //       subnode.resize(64, 250);
  //       subnode.layoutMode = "NONE";
  //       node.appendChild(subnode);

  //       // h-auto
  //       expect(getContainerSizeProp(convertSingleNodeToAlt(node))).toEqual(
  //         "w-16 "
  //       );
  //     });
  //     // todo improve this. Try to set the parent height to be the same as children before h-auto
  //     it("children are higher than node", () => {
  //       const node = figma.createFrame();
  //       node.resize(16, 16);
  //       node.layoutMode = "NONE";
  //       node.counterAxisSizingMode = "FIXED";

  //       const subnode = figma.createFrame();
  //       subnode.resize(32, 32);
  //       subnode.layoutMode = "NONE";
  //       node.appendChild(subnode);

  //       // h-auto
  //       expect(getContainerSizeProp(frameNodeToAlt(node))).toEqual("w-4 h-4 ");
  //     });

  //     it("child is way larger than node", () => {
  //       const node = figma.createFrame();
  //       node.resize(16, 16);
  //       node.layoutMode = "NONE";
  //       node.counterAxisSizingMode = "FIXED";

  //       const subnode = figma.createFrame();
  //       subnode.resize(257, 257);
  //       subnode.layoutMode = "NONE";
  //       node.appendChild(subnode);

  //       // todo this seems wrong
  //       // h-auto
  //       expect(getContainerSizeProp(frameNodeToAlt(node))).toEqual("w-4 h-4 ");
  //     });
  //   });

  //   // todo stroke

  //   // when parent is HORIZONTAL and child is HORIZONTAL, let the child define the size
  // });

  // describe("Complex CustomAutoLayout Tests", () => {
  //   const figma = createFigma({
  //     simulateErrors: true,
  //     isWithoutTimeout: false,
  //   });

  //   // @ts-ignore for some reason, need to override this for figma.mixed to work
  //   global.figma = figma;

  //   it("Frame 73 (black frame with gray rect with two rects inside should become a black frame with a gray autolayout)", () => {
  //     const node = figma.createFrame();
  //     node.resize(200, 200);
  //     node.counterAxisSizingMode = "FIXED";
  //     node.fills = [
  //       {
  //         type: "SOLID",
  //         color: {
  //           r: 0,
  //           g: 0,
  //           b: 0,
  //         },
  //       },
  //     ];

  //     const grayLargeRect = figma.createRectangle();
  //     grayLargeRect.resize(150, 150);
  //     grayLargeRect.x = 0;
  //     grayLargeRect.y = 50;
  //     grayLargeRect.fills = [
  //       {
  //         type: "SOLID",
  //         color: {
  //           r: 0.25,
  //           g: 0.25,
  //           b: 0.25,
  //         },
  //       },
  //     ];

  //     node.appendChild(grayLargeRect);

  //     const redSmallRect = figma.createRectangle();
  //     redSmallRect.resize(100, 50);
  //     redSmallRect.x = 25;
  //     redSmallRect.y = 125;
  //     redSmallRect.fills = [
  //       {
  //         type: "SOLID",
  //         color: {
  //           r: 1,
  //           g: 0,
  //           b: 0,
  //         },
  //       },
  //     ];

  //     node.appendChild(redSmallRect);

  //     const blueSmallRect = figma.createRectangle();
  //     blueSmallRect.resize(100, 50);
  //     blueSmallRect.x = 25;
  //     blueSmallRect.y = 62;
  //     blueSmallRect.fills = [
  //       {
  //         type: "SOLID",
  //         color: {
  //           r: 0,
  //           g: 0,
  //           b: 1,
  //         },
  //       },
  //     ];

  //     node.appendChild(blueSmallRect);

  //     expect(tailwindMain(node.id, [frameNodeToAlt(node)], false, false)).toEqual(
  //       `\n<div className="inline-flex flex-col space-y-4 items-center w-48 h-48 bg-black">
  // <div className="w-3/4 h-40 bg-gray-800"></div>
  // <div className="w-1/2 h-12 bg-red-700"></div>
  // <div className="w-1/2 h-12 bg-indigo-700"></div></div>`
  //     );
  //   });

  //   // imagine a Rect, Text and Frame. Rect will be changed to become the Frame.
  //   // The parent of Rect is the Frame, and the parent of Text will be Rect.
  //   it("Test rect becoming Frame", () => {
  //     const node = figma.createFrame();
  //     node.resize(100, 50);
  //     node.x = 0;
  //     node.y = 0;
  //     node.counterAxisSizingMode = "FIXED";
  //     node.layoutMode = "NONE";

  //     const grayLargeRect = figma.createRectangle();
  //     grayLargeRect.resize(80, 40);
  //     grayLargeRect.x = 0;
  //     grayLargeRect.y = 0;
  //     grayLargeRect.fills = [
  //       {
  //         type: "SOLID",
  //         color: {
  //           r: 0.25,
  //           g: 0.25,
  //           b: 0.25,
  //         },
  //       },
  //     ];

  //     node.appendChild(grayLargeRect);

  //     const blueSmallRect = figma.createRectangle();
  //     blueSmallRect.resize(50, 20);
  //     blueSmallRect.x = 20;
  //     blueSmallRect.y = 20;
  //     blueSmallRect.fills = [
  //       {
  //         type: "SOLID",
  //         color: {
  //           r: 0,
  //           g: 0,
  //           b: 1,
  //         },
  //       },
  //     ];
  //     node.appendChild(blueSmallRect);

  //     const superNode = figma.createFrame();
  //     superNode.resize(100, 50);
  //     superNode.x = 0;
  //     superNode.y = 0;
  //     superNode.counterAxisSizingMode = "FIXED";
  //     superNode.layoutMode = "NONE";

  //     superNode.appendChild(node);

  //     expect(tailwindMain(superNode.parent?.id ?? "", [superNode])).toEqual(
  //       `\n<div className="inline-flex items-center justify-center pt-5 pl-5 pr-2 mr-2 mb-1 w-20 h-10 bg-gray-800">
  // <div className="self-start w-12 h-5 bg-indigo-700"></div></div>`
  //     );
  //   });

  //   it("Test rect becoming Frame in a Group", () => {
  //     const node = figma.createFrame();
  //     node.resize(100, 50);
  //     node.x = 0;
  //     node.y = 0;
  //     node.counterAxisSizingMode = "FIXED";
  //     node.layoutMode = "NONE";

  //     const grayLargeRect = figma.createRectangle();
  //     grayLargeRect.resize(80, 40);
  //     grayLargeRect.x = 0;
  //     grayLargeRect.y = 0;
  //     grayLargeRect.fills = [
  //       {
  //         type: "SOLID",
  //         color: {
  //           r: 0.25,
  //           g: 0.25,
  //           b: 0.25,
  //         },
  //       },
  //     ];

  //     const blueSmallRect = figma.createRectangle();
  //     blueSmallRect.resize(50, 20);
  //     blueSmallRect.x = 20;
  //     blueSmallRect.y = 20;
  //     blueSmallRect.fills = [
  //       {
  //         type: "SOLID",
  //         color: {
  //           r: 0,
  //           g: 0,
  //           b: 1,
  //         },
  //       },
  //     ];

  //     const group = figma.group([grayLargeRect, blueSmallRect], node);

  //     expect(tailwindMain(node.id, [group])).toEqual(
  //       `\n<div className="inline-flex items-center justify-center pt-5 pl-5 pr-2 w-20 h-10 bg-gray-800">
  // <div className="self-start w-12 h-5 bg-indigo-700"></div></div>`
  //     );
  //   });
});
