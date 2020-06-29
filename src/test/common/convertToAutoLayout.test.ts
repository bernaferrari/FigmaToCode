import { AltFrameNode } from "./../../common/altMixins";
import { tailwindMain } from "../../tailwind/tailwindMain";
import { AltGroupNode, AltRectangleNode } from "../../common/altMixins";
import { convertGroupToFrame } from "../../common/convertGroupToFrame";
import { createFigma } from "figma-api-stub";
import { convertToAutoLayout } from "../../common/convertToAutoLayout";

describe("Convert to AutoLayout", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;
  it("Simple conversion", () => {
    const frame = new AltFrameNode();
    frame.x = 0;
    frame.y = 0;
    frame.width = 50;
    frame.height = 50;
    frame.layoutMode = "NONE";

    const node1 = new AltRectangleNode();
    node1.x = 0;
    node1.y = 0;
    node1.width = 20;
    node1.height = 20;
    node1.parent = frame;
    node1.fills = [
      {
        type: "SOLID",
        color: {
          r: 1.0,
          g: 0.0,
          b: 0.0,
        },
      },
    ];

    const node2 = new AltRectangleNode();
    node2.x = 20;
    node2.y = 0;
    node2.width = 20;
    node2.height = 20;
    node2.parent = frame;
    node2.fills = [
      {
        type: "SOLID",
        color: {
          r: 0.0,
          g: 1.0,
          b: 0.0,
        },
      },
    ];

    // initially they are not ordered. ConvertToAutoLayout will also order them.
    frame.children = [node2, node1];

    // output should be HORIZONTAL
    expect(
      tailwindMain("", [convertToAutoLayout(frame)], false, false)
    ).toEqual(
      `<div class="inline-flex items-center justify-center">
<div class="self-start w-5 h-5 bg-red-700"></div>
<div class="self-start w-5 h-5 bg-green-600"></div></div>`
    );

    // output should be VERTICAL
    node2.x = 0;
    node2.y = 20;
    frame.layoutMode = "NONE";
    frame.children = [node2, node1];

    expect(
      tailwindMain("", [convertToAutoLayout(frame)], false, false)
    ).toEqual(
      `<div class="inline-flex flex-col items-center justify-center">
<div class="self-start w-5 h-5 bg-red-700"></div>
<div class="self-start w-5 h-5 bg-green-600"></div></div>`
    );

    // horizontally align while vertical
    node1.width = 50;

    node2.x = 25;
    node2.y = 20;
    frame.layoutMode = "NONE";
    frame.children = [node2, node1];

    expect(
      tailwindMain("", [convertToAutoLayout(frame)], false, false)
    ).toEqual(
      `<div class="inline-flex flex-col items-center justify-center">
<div class="w-full h-5 bg-red-700"></div>
<div class="self-end w-5 h-5 bg-green-600"></div></div>`
    );

    // vertically align while horizontal
    node1.width = 20;
    node1.height = 50;

    node2.x = 20;
    node2.y = 20;
    frame.layoutMode = "NONE";
    frame.children = [node2, node1];

    expect(
      tailwindMain("", [convertToAutoLayout(frame)], false, false)
    ).toEqual(
      `<div class="inline-flex items-center justify-center">
<div class="w-5 h-12 bg-red-700"></div>
<div class="self-end w-5 h-5 bg-green-600"></div></div>`
    );

    node1.height = 20;

    // output should be NOTHING
    node2.x = 10;
    node2.y = 10;
    frame.layoutMode = "NONE";
    frame.children = [node2, node1];

    expect(
      tailwindMain("", [convertToAutoLayout(frame)], false, false)
    ).toEqual(
      `<div class="relative w-12 h-12">
<div class="absolute w-5 h-5 bg-green-600" style="left:10; top:10;"></div>
<div class="absolute left-0 top-0 w-5 h-5 bg-red-700"></div></div>`
    );

    // error handling with no children
    frame.layoutMode = "NONE";
    frame.children = [];

    expect(
      tailwindMain("", [convertToAutoLayout(frame)], false, false)
    ).toEqual(`<div class="w-12 h-12"></div>`);
  });

  it("Correctly position the children", () => {
    const rect0 = new AltRectangleNode();
    rect0.x = 200;
    rect0.y = 200;
    rect0.width = 20;
    rect0.height = 20;

    const rect1 = new AltRectangleNode();
    rect1.x = 220;
    rect1.y = 220;
    rect1.width = 20;
    rect1.height = 20;

    const rect2 = new AltRectangleNode();
    rect2.x = 240;
    rect2.y = 240;
    rect2.width = 20;
    rect2.height = 20;

    const group = new AltGroupNode();
    group.x = 200;
    group.y = 200;
    group.width = 260;
    group.height = 260;
    group.children = [rect0, rect1, rect2];

    const newFrame = convertToAutoLayout(group);

    expect(newFrame.children[0].x).toEqual(0);
    expect(newFrame.children[0].y).toEqual(0);

    expect(newFrame.children[1].x).toEqual(20);
    expect(newFrame.children[1].x).toEqual(20);

    expect(newFrame.children[2].x).toEqual(40);
    expect(newFrame.children[2].x).toEqual(40);
  });
});
