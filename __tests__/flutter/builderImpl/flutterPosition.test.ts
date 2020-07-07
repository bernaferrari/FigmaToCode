import { convertSingleNodeToAlt } from "../../../src/altNodes/altConversion";
import { AltGroupNode, AltFrameNode } from "../../../src/altNodes/altMixins";
import { createFigma } from "figma-api-stub";
import { flutterPosition } from "../../../src/flutter/builderImpl/flutterPosition";

describe("Flutter Position", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;
  it("Frame AutoLayout Position", () => {
    const parentF = figma.createFrame();
    parentF.resize(100, 100);
    parentF.x = 0;
    parentF.y = 0;
    parentF.layoutMode = "NONE";

    const nodeF = figma.createFrame();
    nodeF.resize(50, 50);
    parentF.appendChild(nodeF);

    // you may wonder: where is the AutoLayout if layoutMode was set to NONE?
    // answer: the auto conversion when AltNodes are generated.
    const parent = convertSingleNodeToAlt(parentF) as AltFrameNode;
    const node = parent.children[0];

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
    const parentF = figma.createFrame();
    parentF.resize(100, 100);
    parentF.x = 0;
    parentF.y = 0;
    parentF.layoutMode = "NONE";

    const nodeF1 = figma.createFrame();
    nodeF1.resize(25, 25);
    parentF.appendChild(nodeF1);

    const nodeF2 = figma.createFrame();
    nodeF2.resize(25, 25);
    parentF.appendChild(nodeF2);

    // you may wonder: where is the AutoLayout if layoutMode was set to NONE?
    // answer: the auto conversion when AltNodes are generated.
    const parent = convertSingleNodeToAlt(parentF) as AltFrameNode;
    const node = parent.children[0];

    // position is set after the conversion to avoid AutoLayout auto converison

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
    const parentF = figma.createFrame();
    parentF.resize(100, 100);
    parentF.layoutMode = "NONE";

    const nodeF1 = figma.createFrame();
    nodeF1.resize(100, 100);

    const nodeF2 = figma.createFrame();
    nodeF2.resize(50, 50);

    parentF.appendChild(nodeF1);
    parentF.appendChild(nodeF2);

    const parent = convertSingleNodeToAlt(parentF) as AltGroupNode;
    const node = parent.children[0];

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
