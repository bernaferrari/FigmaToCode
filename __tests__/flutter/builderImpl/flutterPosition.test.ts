import { AltFrameNode } from "../../../src/altNodes/altMixins";
import { flutterPosition } from "../../../src/flutter/builderImpl/flutterPosition";

describe("Flutter Position", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("Frame AutoLayout Position", () => {
    const parent = new AltFrameNode();
    parent.width = 100;
    parent.height = 100;
    parent.x = 0;
    parent.y = 0;
    parent.layoutMode = "NONE";

    const node = new AltFrameNode();
    node.width = 100;
    node.height = 100;
    node.parent = parent;

    parent.children = [node];

    // node.parent.id === parent.id, so return ""
    expect(flutterPosition(node, "", parent.id)).toEqual("");

    // todo improve this?

    node.layoutAlign = "MIN";
    expect(flutterPosition(node, "")).toEqual("");

    node.layoutAlign = "MAX";
    expect(flutterPosition(node, "")).toEqual("");

    node.layoutAlign = "CENTER";
    expect(flutterPosition(node, "")).toEqual("");
  });

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
    expect(flutterPosition(node, "child")).toEqual("child");

    node.width = 25;
    node.height = 25;

    const nodeF2 = new AltFrameNode();
    nodeF2.width = 25;
    nodeF2.height = 25;
    nodeF2.parent = parent;

    parent.children = [node, nodeF2];

    // center
    node.x = 37;
    node.y = 37;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.center, child: child),),"
    );

    // top-left
    node.x = 0;
    node.y = 0;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.topLeft, child: child),),"
    );

    // top-right
    node.x = 75;
    node.y = 0;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.topRight, child: child),),"
    );

    // bottom-left
    node.x = 0;
    node.y = 75;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.bottomLeft, child: child),),"
    );

    // bottom-right
    node.x = 75;
    node.y = 75;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.bottomRight, child: child),),"
    );

    // top-center
    node.x = 37;
    node.y = 0;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.topCenter, child: child),),"
    );

    // left-center
    node.x = 0;
    node.y = 37;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.centerLeft, child: child),),"
    );

    // bottom-center
    node.x = 37;
    node.y = 75;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.bottomCenter, child: child),),"
    );

    // right-center
    node.x = 75;
    node.y = 37;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned.fill(child: Align(alingment: Alingment.centerRight, child: child),),"
    );

    // center Y, random X
    node.x = 22;
    node.y = 37;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned(left: 22, top: 37, child: child),"
    );

    // center X, random Y
    node.x = 37;
    node.y = 22;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned(left: 37, top: 22, child: child),"
    );

    // without position
    node.x = 45;
    node.y = 88;
    expect(flutterPosition(node, "child")).toEqual(
      "Positioned(left: 45, top: 88, child: child),"
    );
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

    expect(flutterPosition(node, "")).toEqual("");
  });

  it("No position when parent is root", () => {
    const node = new AltFrameNode();
    node.layoutMode = "NONE";

    const parent = new AltFrameNode();
    parent.id = "root";
    parent.layoutMode = "NONE";

    node.parent = parent;

    expect(flutterPosition(node, "", parent.id)).toEqual("");
  });
});
