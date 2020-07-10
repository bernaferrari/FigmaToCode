import { tailwindSize } from "./../../src/tailwind/builderImpl/tailwindSize";
import { AltFrameNode } from "../../src/altNodes/altMixins";
import { tailwindMain } from "../../src/tailwind/tailwindMain";
import { AltGroupNode, AltRectangleNode } from "../../src/altNodes/altMixins";
import { convertNodeIfChildIsBigRect } from "../../src/altNodes/convertNodeIfChildIsBigRect";
import { convertToAutoLayout } from "../../src/altNodes/convertToAutoLayout";

describe("convert node if child is big rect ", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("frame with one child (no conversion)", () => {
    const frame = new AltFrameNode();
    frame.width = 100;
    frame.height = 100;

    const rectangle = new AltRectangleNode();
    rectangle.width = 100;
    rectangle.height = 100;
    rectangle.x = 0;
    rectangle.y = 0;
    rectangle.fills = [
      {
        type: "SOLID",
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ];

    rectangle.parent = frame;
    frame.children = [rectangle];

    // it will only work with two or more items.
    const converted = convertToAutoLayout(convertNodeIfChildIsBigRect(frame));

    expect(tailwindSize(converted)).toEqual("w-24 ");

    expect(tailwindMain([converted])).toEqual(
      `<div class="w-24">
<div class="w-full h-24 bg-black"></div></div>`
    );
  });

  it("child is invisible", () => {
    const frame = new AltFrameNode();
    frame.width = 100;
    frame.height = 100;

    const rect1 = new AltRectangleNode();
    rect1.width = 100;
    rect1.height = 100;
    rect1.x = 0;
    rect1.y = 0;
    rect1.fills = [
      {
        type: "SOLID",
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ];

    const rect2 = new AltRectangleNode();
    rect2.width = 50;
    rect2.height = 50;
    rect2.x = 0;
    rect2.y = 0;
    rect2.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    rect1.visible = false;

    rect2.parent = frame;
    rect1.parent = frame;

    frame.children = [rect2, rect1];

    const invisibleConverted = convertNodeIfChildIsBigRect(frame);
    expect(tailwindMain([invisibleConverted])).toEqual(
      `<div class="inline-flex flex-col items-center justify-center w-24 h-24">
<div class="w-1/2 h-12 bg-white"></div></div>`
    );
  });

  it("frame with two children", () => {
    const frame = new AltFrameNode();
    frame.width = 20;
    frame.height = 20;

    const rectangle = new AltRectangleNode();
    rectangle.width = 20;
    rectangle.height = 20;
    rectangle.x = 0;
    rectangle.y = 0;
    rectangle.visible = true;
    rectangle.fills = [
      {
        type: "SOLID",
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ];

    const miniRect = new AltRectangleNode();
    miniRect.width = 10;
    miniRect.height = 10;
    miniRect.x = 5;
    miniRect.y = 5;
    miniRect.visible = true;
    miniRect.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];
    miniRect.parent = frame;
    rectangle.parent = frame;
    frame.children = [rectangle, miniRect];

    // it will only work with two or more items.
    // todo should the conversion happen also when a group has a single rect?
    const converted = convertNodeIfChildIsBigRect(frame);

    expect(tailwindMain([converted])).toEqual(
      `<div class="inline-flex flex-col items-center justify-center w-5 h-5 bg-black">
<div class="w-1/2 h-2 bg-white"></div></div>`
    );
  });

  it("Fail", () => {
    const rect1 = new AltRectangleNode();
    rect1.x = 0;
    rect1.y = 0;
    rect1.width = 100;
    rect1.height = 100;

    const rect2 = new AltRectangleNode();
    rect2.x = 0;
    rect2.y = 0;
    rect2.width = 20;
    rect2.height = 120;

    const group = new AltGroupNode();
    group.x = 0;
    group.y = 0;
    group.width = 120;
    group.height = 20;
    group.children = [rect1, rect2];
    rect1.parent = group;
    rect2.parent = group;

    expect(
      tailwindMain([convertToAutoLayout(convertNodeIfChildIsBigRect(group))])
    ).toEqual(`<div class="relative" style="width: 120px; height: 20px;">
<div class="absolute left-0 top-0 w-24 h-24"></div>
<div class="absolute left-0 top-0 w-5 h-32"></div></div>`);
  });
  it("group with 2 children", () => {
    const group = new AltGroupNode();
    group.width = 20;
    group.height = 20;
    group.x = 0;
    group.y = 0;

    const rectangle = new AltRectangleNode();
    rectangle.width = 20;
    rectangle.height = 20;
    rectangle.x = 0;
    rectangle.y = 0;
    rectangle.visible = true;
    rectangle.fills = [
      {
        type: "SOLID",
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ];

    const miniRect = new AltRectangleNode();
    miniRect.width = 10;
    miniRect.height = 10;
    miniRect.x = 5;
    miniRect.y = 5;
    miniRect.visible = true;
    miniRect.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];
    miniRect.parent = group;
    rectangle.parent = group;
    group.children = [rectangle, miniRect];

    const converted = convertToAutoLayout(convertNodeIfChildIsBigRect(group));

    // counterAxisSizingMode is AUTO, therefore bg-black doesn't contain the size
    // todo should it keep that way?

    expect(tailwindMain([converted])).toEqual(
      `<div class="inline-flex items-center justify-center p-1 w-5 bg-black">
<div class="w-full h-2 bg-white"></div></div>`
    );
  });
});
