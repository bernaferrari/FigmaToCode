import {
  AltRectangleNode,
  AltFrameNode,
} from "../../../src/altNodes/altMixins";
import { swiftuiSize } from "../../../src/swiftui/builderImpl/swiftuiSize";

describe("swiftui Builder", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("size for a rectangle", () => {
    const node = new AltRectangleNode();

    node.width = 16;
    node.height = 16;
    expect(swiftuiSize(node)).toEqual("\n.frame(width: 16, height: 16)");
  });

  it("STRETCH inside AutoLayout", () => {
    const node = new AltFrameNode();
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "FIXED";
    node.primaryAxisSizingMode = "FIXED";
    node.paddingLeft = 0;
    node.paddingRight = 0;
    node.paddingTop = 0;
    node.paddingBottom = 0;
    node.width = 100;
    node.height = 100;

    const child = new AltRectangleNode();
    child.layoutAlign = "STRETCH";
    child.layoutGrow = 1;
    child.width = 100;
    child.height = 100;

    child.parent = node;
    node.children = [child];

    expect(swiftuiSize(child)).toEqual(
      "\n.frame(maxWidth: .infinity, maxHeight: .infinity)"
    );

    child.layoutGrow = 0;
    expect(swiftuiSize(child)).toEqual(
      "\n.frame(maxWidth: 100, maxHeight: .infinity)"
    );

    child.layoutGrow = 1;
    child.layoutAlign = "INHERIT";
    expect(swiftuiSize(child)).toEqual(
      "\n.frame(maxWidth: .infinity, maxHeight: 100)"
    );

    // fail
    node.layoutMode = "VERTICAL";
    child.layoutAlign = "INHERIT";
    child.layoutGrow = 0;
    child.width = 16;
    child.height = 16;
    expect(swiftuiSize(child)).toEqual("\n.frame(width: 16, height: 16)");

    // child is relative, therefore it must have a value
    expect(swiftuiSize(node)).toEqual("\n.frame(width: 100, height: 100)");
  });

  it("Vertical layout with FIXED counterAxis", () => {
    const node = new AltFrameNode();
    node.layoutMode = "VERTICAL";
    node.counterAxisSizingMode = "FIXED";
    node.width = 16;
    node.height = 16;

    const child = new AltRectangleNode();
    child.width = 8;
    child.height = 8;

    child.parent = node;
    node.children = [child];

    expect(swiftuiSize(node)).toEqual("\n.frame(width: 16)");
  });

  it("Children are rectangles, size shouldn't be relative", () => {
    const node = new AltFrameNode();
    node.layoutMode = "NONE";
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    expect(swiftuiSize(node)).toEqual("\n.frame(width: 48, height: 48)");
  });

  it("counterAxisSizingMode is FIXED", () => {
    const node = new AltFrameNode();
    node.counterAxisSizingMode = "FIXED";
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    node.layoutMode = "HORIZONTAL";
    expect(swiftuiSize(node)).toEqual("\n.frame(height: 48)");

    node.layoutMode = "VERTICAL";
    expect(swiftuiSize(node)).toEqual("\n.frame(width: 48)");

    node.layoutMode = "NONE";
    expect(swiftuiSize(node)).toEqual("\n.frame(width: 48, height: 48)");
  });

  it("counterAxisSizingMode is AUTO", () => {
    const node = new AltFrameNode();
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "FIXED";
    node.primaryAxisSizingMode = "FIXED";
    node.x = 0;
    node.y = 0;
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    expect(swiftuiSize(node)).toEqual("\n.frame(width: 48, height: 48)");

    // responsive
    const parentNode = new AltFrameNode();
    parentNode.counterAxisSizingMode = "AUTO";
    parentNode.primaryAxisSizingMode = "AUTO";
    parentNode.x = 0;
    parentNode.y = 0;
    parentNode.width = 48;
    parentNode.height = 48;
    parentNode.children = [node];
    node.parent = parentNode;
    expect(swiftuiSize(node)).toEqual("\n.frame(width: 48, height: 48)");
    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 48, height: 48)");
  });

  it("width changes when there are strokes", () => {
    const node = new AltRectangleNode();
    node.x = 0;
    node.y = 0;
    node.width = 8;
    node.height = 8;

    expect(swiftuiSize(node)).toEqual("\n.frame(width: 8, height: 8)");

    node.strokeWeight = 4;
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];

    node.strokeAlign = "CENTER";
    expect(swiftuiSize(node)).toEqual("\n.frame(width: 12, height: 12)");

    node.strokeAlign = "OUTSIDE";
    expect(swiftuiSize(node)).toEqual("\n.frame(width: 16, height: 16)");
  });

  it("adjust parent if children's size + stroke > parent size", () => {
    const parentNode = new AltFrameNode();
    parentNode.width = 8;
    parentNode.height = 8;

    const node = new AltRectangleNode();
    node.width = 8;
    node.height = 8;

    node.strokeWeight = 4;
    node.strokeAlign = "CENTER";
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];

    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 8, height: 8)");

    parentNode.children = [node];
    node.parent = parentNode;
    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 12, height: 12)");

    node.strokeAlign = "OUTSIDE";
    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 16, height: 16)");
  });

  it("all branches with children's size + stroke < children's size", () => {
    const parentNode = new AltFrameNode();
    parentNode.width = 8;
    parentNode.height = 8;

    const node = new AltRectangleNode();
    node.width = 4;
    node.height = 4;

    node.strokeWeight = 2;
    node.strokeAlign = "CENTER";
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];

    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 8, height: 8)");

    parentNode.children = [node];
    node.parent = parentNode;
    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 8, height: 8)");

    node.strokeAlign = "OUTSIDE";
    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 8, height: 8)");

    node.strokeAlign = "INSIDE";
    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 8, height: 8)");
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

    expect(swiftuiSize(parentNode)).toEqual("\n.frame(width: 12, height: 12)");
    expect(swiftuiSize(node)).toEqual("\n.frame(width: 12, height: 12)");
  });

  it("set the width to max if the view is near the corner", () => {
    const node = new AltFrameNode();
    node.width = 100;
    node.height = 100;
    node.x = 0;
    node.y = 0;

    const parentNode = new AltFrameNode();
    parentNode.layoutMode = "NONE";
    parentNode.width = 120;
    parentNode.height = 120;

    parentNode.children = [node];
    node.parent = parentNode;

    expect(swiftuiSize(node)).toEqual("\n.frame(width: 100, height: 100)");
  });
});
