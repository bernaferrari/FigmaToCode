import { htmlPosition } from "./../../../src/html/builderImpl/htmlPosition";
import { AltFrameNode } from "../../../src/altNodes/altMixins";

describe("HTML Position", () => {
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

    // child equals parent
    node.width = 100;
    node.height = 100;
    expect(htmlPosition(node)).toEqual("absoluteManualLayout");
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

    expect(htmlPosition(node)).toEqual("");
  });

  it("No position when parent is root", () => {
    const node = new AltFrameNode();
    node.layoutMode = "NONE";

    const parent = new AltFrameNode();
    parent.id = "root";
    parent.layoutMode = "NONE";

    node.parent = parent;

    expect(htmlPosition(node, parent.id)).toEqual("");
  });
});
