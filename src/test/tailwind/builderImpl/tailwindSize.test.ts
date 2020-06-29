import { AltRectangleNode, AltFrameNode } from "../../../altNodes/altMixins";
import { tailwindSize } from "./../../../tailwind/builderImpl/tailwindSize";

describe("Tailwind Builder", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("size for a rectangle", () => {
    const node = new AltRectangleNode();

    node.width = 16;
    node.height = 16;
    expect(tailwindSize(node)).toEqual("w-4 h-4 ");

    node.width = 100;
    node.height = 200;
    expect(tailwindSize(node)).toEqual("w-24 h-48 ");

    node.width = 300;
    node.height = 300;
    expect(tailwindSize(node)).toEqual("w-full h-64 ");
  });

  it("STRETCH inside AutoLayout", () => {
    const node = new AltFrameNode();
    node.layoutMode = "HORIZONTAL";

    const child = new AltRectangleNode();
    child.parent = node;
    child.layoutAlign = "STRETCH";

    expect(tailwindSize(child)).toEqual("w-full ");
  });

  it("Fixed size when children are absolute", () => {
    const node = new AltFrameNode();
    node.layoutMode = "NONE";
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    expect(tailwindSize(node)).toEqual("w-12 h-12 ");
  });

  it("counterAxisSizingMode is FIXED", () => {
    const node = new AltFrameNode();
    node.counterAxisSizingMode = "FIXED";
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    node.layoutMode = "HORIZONTAL";
    expect(tailwindSize(node)).toEqual("h-12 ");

    node.layoutMode = "VERTICAL";
    expect(tailwindSize(node)).toEqual("w-12 ");

    node.layoutMode = "NONE";
    expect(tailwindSize(node)).toEqual("w-12 h-12 ");
  });

  it("counterAxisSizingMode is AUTO", () => {
    const node = new AltFrameNode();
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "AUTO";
    node.x = 0;
    node.y = 0;
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    expect(tailwindSize(node)).toEqual("");

    // responsive
    const parentNode = new AltFrameNode();
    parentNode.counterAxisSizingMode = "FIXED";
    parentNode.x = 0;
    parentNode.y = 0;
    parentNode.width = 48;
    parentNode.height = 48;
    parentNode.children = [node];
    node.parent = parentNode;
    expect(tailwindSize(node)).toEqual("");
    expect(tailwindSize(parentNode)).toEqual("");
  });

  it("width changes when there are strokes", () => {
    const node = new AltRectangleNode();
    node.x = 0;
    node.y = 0;
    node.width = 8;
    node.height = 8;

    expect(tailwindSize(node)).toEqual("w-2 h-2 ");

    node.strokeWeight = 4;
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];

    node.strokeAlign = "CENTER";
    expect(tailwindSize(node)).toEqual("w-3 h-3 ");

    node.strokeAlign = "OUTSIDE";
    expect(tailwindSize(node)).toEqual("w-4 h-4 ");
  });

  it("adjust parent if children's size + stroke > parent size", () => {
    const node = new AltRectangleNode();
    node.width = 12;
    node.height = 12;

    node.strokeWeight = 4;
    node.strokeAlign = "OUTSIDE";
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];

    const parentNode = new AltFrameNode();
    parentNode.width = 8;
    parentNode.height = 8;
    parentNode.children = [node];
    node.parent = parentNode;

    expect(tailwindSize(parentNode)).toEqual("w-4 h-4 ");

    node.strokeAlign = "CENTER";
    expect(tailwindSize(parentNode)).toEqual("w-2 h-2 ");
  });

  it("full width when width is same to the parent", () => {
    const node = new AltFrameNode();
    node.width = 12;
    node.height = 12;

    const parentNode = new AltFrameNode();
    parentNode.layoutMode = "NONE";
    parentNode.width = 12;
    parentNode.height = 12;
    parentNode.children = [node];
    node.parent = parentNode;

    expect(tailwindSize(parentNode)).toEqual("");
    expect(tailwindSize(node)).toEqual("w-full h-3 ");
  });

  it("responsive width", () => {
    const node = new AltFrameNode();
    node.width = 20;
    node.height = 20;

    const parentNode = new AltFrameNode();
    parentNode.layoutMode = "NONE";
    parentNode.width = 20;
    parentNode.height = 20;
    parentNode.children = [node];
    node.parent = parentNode;

    expect(tailwindSize(node)).toEqual("w-full h-5 ");

    node.width = 10;
    expect(tailwindSize(node)).toEqual("w-1/2 h-5 ");

    node.width = 20 / 3;
    expect(tailwindSize(node)).toEqual("w-1/3 h-5 ");

    node.width = 40 / 3;
    expect(tailwindSize(node)).toEqual("w-2/3 h-5 ");

    node.width = 5;
    expect(tailwindSize(node)).toEqual("w-1/4 h-5 ");

    node.width = 15;
    expect(tailwindSize(node)).toEqual("w-3/4 h-5 ");

    node.width = 4;
    expect(tailwindSize(node)).toEqual("w-1/5 h-5 ");

    node.width = 10 / 3;
    expect(tailwindSize(node)).toEqual("w-1/6 h-5 ");

    node.width = 50 / 3;
    expect(tailwindSize(node)).toEqual("w-5/6 h-5 ");

    node.width = 20 / 12;
    expect(tailwindSize(node)).toEqual("w-1/12 h-5 ");
  });
});
