import {
  AltRectangleNode,
  AltFrameNode,
} from "../../../src/altNodes/altMixins";
import { htmlSize } from "../../../src/html/builderImpl/htmlSize";

describe("HTML Size", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("size for a rectangle", () => {
    const node = new AltRectangleNode();

    node.width = 16;
    node.height = 16;
    expect(htmlSize(node, false)).toEqual("width: 16px; height: 16px; ");
  });

  it("STRETCH inside AutoLayout", () => {
    const node = new AltFrameNode();
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "FIXED";
    node.primaryAxisSizingMode = "FIXED";
    node.width = 100;
    node.height = 100;
    node.paddingLeft = 0;
    node.paddingRight = 0;
    node.paddingTop = 0;
    node.paddingBottom = 0;

    const child = new AltRectangleNode();
    child.layoutAlign = "STRETCH";
    child.width = 100;
    child.height = 100;

    child.parent = node;
    node.children = [child];

    expect(htmlSize(child, false)).toEqual("width: 100px; height: 100%; ");

    // fail
    node.layoutMode = "VERTICAL";
    child.width = 16;
    child.height = 16;
    expect(htmlSize(child, false)).toEqual("width: 100%; height: 16px; ");
  });

  it("counterAxisSizingMode is AUTO", () => {
    const node = new AltFrameNode();
    node.layoutMode = "HORIZONTAL";
    node.primaryAxisSizingMode = "AUTO";
    node.counterAxisSizingMode = "AUTO";
    node.x = 0;
    node.y = 0;
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    expect(htmlSize(node, false)).toEqual("");

    // responsive
    const parentNode = new AltFrameNode();
    parentNode.counterAxisSizingMode = "AUTO";
    parentNode.primaryAxisSizingMode = "FIXED";
    parentNode.x = 0;
    parentNode.y = 0;
    parentNode.width = 48;
    parentNode.height = 48;
    parentNode.children = [node];
    node.parent = parentNode;
    expect(htmlSize(node, false)).toEqual("");
    expect(htmlSize(parentNode, false)).toEqual("width: 48px; height: 48px; ");
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

    expect(htmlSize(parentNode, false)).toEqual("width: 8px; height: 8px; ");

    parentNode.children = [node];
    node.parent = parentNode;
    expect(htmlSize(parentNode, false)).toEqual("width: 12px; height: 12px; ");

    node.strokeAlign = "OUTSIDE";
    expect(htmlSize(parentNode, false)).toEqual("width: 16px; height: 16px; ");
  });
});
