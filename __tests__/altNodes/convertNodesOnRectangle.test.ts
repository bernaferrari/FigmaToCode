import { AltSceneNode, AltTextNode } from "./../../src/altNodes/altMixins";
import { tailwindSize } from "../../src/tailwind/builderImpl/tailwindSize";
import { AltFrameNode } from "../../src/altNodes/altMixins";
import { tailwindMain } from "../../src/tailwind/tailwindMain";
import { AltGroupNode, AltRectangleNode } from "../../src/altNodes/altMixins";
import { convertNodesOnRectangle } from "../../src/altNodes/convertNodesOnRectangle";

describe("convert node if child is big rect", () => {
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
    const converted = convertNodesOnRectangle(frame);

    expect(tailwindSize(converted)).toEqual("w-24 h-24 ");

    expect(tailwindMain([converted])).toEqual(
      `<div class="w-24 h-24">
<div class="w-full h-full bg-black"></div></div>`
    );
  });

  it("child is invisible", () => {
    const frame = new AltFrameNode();
    frame.width = 100;
    frame.height = 100;
    frame.id = "frame";

    const rect1 = new AltRectangleNode();
    rect1.id = "rect 1";
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
    rect2.id = "rect 2";
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

    frame.children = [rect1, rect2];

    const invisibleConverted = convertNodesOnRectangle(frame);

    expect(tailwindMain([invisibleConverted])).toEqual(
      `<div class="w-24 h-24">
<div class="inline-flex items-start justify-start pr-12 pb-12 w-full h-full">
<div class="w-full h-full bg-white"></div></div></div>`
    );
  });

  it("frame with two children", () => {
    const frame = new AltFrameNode();
    frame.id = "frame";
    frame.width = 20;
    frame.height = 20;

    const rectangle = new AltRectangleNode();
    rectangle.id = "rectangle";
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
    miniRect.id = "miniRect";
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
    const converted = convertNodesOnRectangle(frame);

    expect(tailwindMain([converted])).toEqual(
      `<div class="w-5 h-5">
<div class="inline-flex items-center justify-center p-1 w-full h-full bg-black">
<div class="w-full h-full bg-white"></div></div></div>`
    );
  });

  it("Fail", () => {
    const rect1 = new AltRectangleNode();
    rect1.id = "rect 1";
    rect1.x = 0;
    rect1.y = 0;
    rect1.width = 100;
    rect1.height = 100;

    const rect2 = new AltRectangleNode();
    rect2.id = "rect 2";
    rect2.x = 0;
    rect2.y = 0;
    rect2.width = 20;
    rect2.height = 120;

    const group = new AltGroupNode();
    group.id = "group";
    group.x = 0;
    group.y = 0;
    group.width = 120;
    group.height = 20;
    group.children = [rect1, rect2];
    rect1.parent = group;
    rect2.parent = group;

    expect(tailwindMain([convertNodesOnRectangle(group)]))
      .toEqual(`<div class="relative" style="width: 120px; height: 20px;">
<div class="w-24 h-24 absolute left-0 top-0"></div>
<div class="w-5 h-28 absolute left-0 top-0"></div></div>`);
  });
  it("group with 2 children", () => {
    const group = new AltGroupNode();
    group.id = "group";
    group.width = 20;
    group.height = 20;
    group.x = 0;
    group.y = 0;

    const rectangle = new AltRectangleNode();
    rectangle.id = "rect 1";
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
    miniRect.id = "rect 2";
    miniRect.width = 8;
    miniRect.height = 8;
    miniRect.x = 0;
    miniRect.y = 0;
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

    const pre_conv = convertNodesOnRectangle(group);

    // force Group removal. This is done automatically in AltConversion when executed in Figma.
    const conv = pre_conv.children[0] as AltSceneNode;
    conv.parent = null;

    console.log("converted is ", conv);
    // counterAxisSizingMode is AUTO, therefore bg-black doesn't contain the size

    expect(tailwindMain([conv])).toEqual(
      `<div class="inline-flex items-start justify-start pr-3 pb-3 w-5 h-5 bg-black">
<div class="w-full h-full bg-white"></div></div>`
    );
  });

  it("simple example", () => {
    const node = new AltFrameNode();
    node.id = "FRAME";
    node.width = 400;
    node.height = 400;

    const child0 = new AltRectangleNode();
    child0.id = "MAIN";
    child0.width = 100;
    child0.height = 100;
    child0.x = 0;
    child0.y = 0;

    const child1 = new AltRectangleNode();
    child1.id = "RECT 1";
    child1.width = 20;
    child1.height = 20;
    child1.x = 0;
    child1.y = 0;

    const child2 = new AltRectangleNode();
    child2.id = "RECT 2";
    child2.width = 30;
    child2.height = 30;
    child2.x = 10;
    child2.y = 10;

    const child3 = new AltRectangleNode();
    child3.id = "RECT 3";
    child3.width = 60;
    child3.height = 60;
    child3.x = 10;
    child3.y = 10;

    // from most background to most foreground
    node.children = [child0, child1, child2, child3];

    const convert = convertNodesOnRectangle(node);

    expect(convert.children.length).toEqual(1);
  });

  it("multiple rectangles on top of each other", () => {
    const node = new AltFrameNode();
    node.id = "FRAME";
    node.width = 400;
    node.height = 400;

    const child0 = new AltRectangleNode();
    child0.id = "MAIN 1";
    child0.width = 30;
    child0.height = 30;
    child0.x = 0;
    child0.y = 0;

    const child1 = new AltRectangleNode();
    child1.id = "RECT 1 M1";
    child1.width = 20;
    child1.height = 20;
    child1.x = 10;
    child1.y = 10;

    const child2 = new AltRectangleNode();
    child2.id = "RECT 2 M1";
    child2.width = 10;
    child2.height = 10;
    child2.x = 20;
    child2.y = 20;

    const child3 = new AltRectangleNode();
    child3.id = "MAIN 2";
    child3.width = 40;
    child3.height = 40;
    child3.x = 40;
    child3.y = 40;

    const child4 = new AltRectangleNode();
    child4.id = "RECT 1 M2";
    child4.width = 10;
    child4.height = 20;
    child4.x = 50;
    child4.y = 50;

    const child5 = new AltRectangleNode();
    child5.id = "RECT 2 M2";
    child5.width = 45;
    child5.height = 20;
    child5.x = 40;
    child5.y = 30;

    const childIgnored = new AltTextNode();
    childIgnored.id = "RECT 2 M2";
    childIgnored.width = 100;
    childIgnored.height = 100;
    childIgnored.x = 0;
    childIgnored.y = 0;

    // from most background to most foreground
    node.children = [
      child0,
      child3,
      childIgnored,
      child1,
      child2,
      child4,
      child5,
    ];

    const convert = convertNodesOnRectangle(node);

    // 4, because it should include even those that are not converted.
    expect(convert.children.length).toEqual(4);
  });

  it("invalid when testing without id", () => {
    const node = new AltFrameNode();
    node.width = 400;
    node.height = 400;

    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    expect(() => convertNodesOnRectangle(node)).toThrow();
  });
});
