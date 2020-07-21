import { swiftuiPosition } from "../../../src/swiftui/builderImpl/swiftuiPosition";
import { AltFrameNode } from "../../../src/altNodes/altMixins";

describe("SwiftUI Position", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("Frame Absolute Position", () => {
    const parent = new AltFrameNode();
    parent.width = 100;
    parent.height = 100;
    parent.x = 0;
    parent.y = 0;
    parent.id = "root";
    parent.layoutMode = "NONE";
    parent.isRelative = true;

    const node = new AltFrameNode();
    parent.id = "node";
    node.parent = parent;
    node.x = 0;
    node.y = 0;

    // child equals parent
    node.width = 100;
    node.height = 100;
    expect(swiftuiPosition(node)).toEqual("");

    node.width = 25;
    node.height = 25;

    const nodeF2 = new AltFrameNode();
    nodeF2.width = 25;
    nodeF2.height = 25;
    nodeF2.parent = parent;

    parent.children = [node, nodeF2];

    // position is set after the conversion to avoid AutoLayout auto converison

    // center
    node.x = 37;
    node.y = 37;
    expect(swiftuiPosition(node)).toEqual("");

    // top-left
    node.x = 0;
    node.y = 0;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: -37.50, y: -37.50)");

    // top-right
    node.x = 75;
    node.y = 0;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: 37.50, y: -37.50)");

    // bottom-left
    node.x = 0;
    node.y = 75;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: -37.50, y: 37.50)");

    // bottom-right
    node.x = 75;
    node.y = 75;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: 37.50, y: 37.50)");

    // top-center
    node.x = 37;
    node.y = 0;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: -0.50, y: -37.50)");

    // left-center
    node.x = 0;
    node.y = 37;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: -37.50, y: -0.50)");

    // bottom-center
    node.x = 37;
    node.y = 75;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: -0.50, y: 37.50)");

    // right-center
    node.x = 75;
    node.y = 37;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: 37.50, y: -0.50)");

    // center Y, random X
    node.x = 22;
    node.y = 37;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: -15.50, y: -0.50)");

    // center X, random Y
    node.x = 37;
    node.y = 22;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: -0.50, y: -15.50)");

    // without position
    node.x = 45;
    node.y = 88;
    expect(swiftuiPosition(node)).toEqual("\n.offset(x: 7.50, y: 50.50)");
  });

  it("Position: node has same size as parent", () => {
    const parent = new AltFrameNode();
    parent.width = 100;
    parent.height = 100;
    parent.layoutMode = "NONE";

    const node = new AltFrameNode();
    node.width = 100;
    node.height = 100;
    node.parent = parent;

    const nodeF2 = new AltFrameNode();
    nodeF2.width = 100;
    nodeF2.height = 100;
    nodeF2.parent = parent;

    parent.children = [node, nodeF2];

    expect(swiftuiPosition(node, "")).toEqual("");
  });

  it("No position when parent is root", () => {
    const node = new AltFrameNode();
    node.layoutMode = "NONE";

    const parent = new AltFrameNode();
    parent.id = "root";
    parent.layoutMode = "NONE";

    node.parent = parent;

    expect(swiftuiPosition(node, parent.id)).toEqual("");
  });
});
