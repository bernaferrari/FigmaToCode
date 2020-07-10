import { convertSingleNodeToAlt } from "../../../src/altNodes/altConversion";
import { tailwindPosition } from "../../../src/tailwind/builderImpl/tailwindPosition";
import { AltGroupNode, AltFrameNode } from "../../../src/altNodes/altMixins";
import { createFigma } from "figma-api-stub";

describe("Tailwind Position", () => {
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
    expect(tailwindPosition(node, parent.id)).toEqual("");

    node.layoutAlign = "MIN";
    expect(tailwindPosition(node, "")).toEqual("self-start ");

    node.layoutAlign = "MAX";
    expect(tailwindPosition(node, "")).toEqual("self-end ");

    node.layoutAlign = "CENTER";
    expect(tailwindPosition(node, "")).toEqual("");
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
    // expect(tailwindPosition(node, "")).toEqual("absolute m-auto inset-0 ");
    expect(tailwindPosition(node, "")).toEqual("absoluteManualLayout");

    // top-left
    node.x = 0;
    node.y = 0;
    expect(tailwindPosition(node, "")).toEqual("absolute left-0 top-0 ");

    // top-right
    node.x = 75;
    node.y = 0;
    expect(tailwindPosition(node, "")).toEqual("absolute right-0 top-0 ");

    // bottom-left
    node.x = 0;
    node.y = 75;
    expect(tailwindPosition(node, "")).toEqual("absolute left-0 bottom-0 ");

    // bottom-right
    node.x = 75;
    node.y = 75;
    expect(tailwindPosition(node, "")).toEqual("absolute right-0 bottom-0 ");

    // top-center
    node.x = 37;
    node.y = 0;
    // expect(tailwindPosition(node, "")).toEqual(
    //   "absolute inset-x-0 top-0 mx-auto "
    // );
    expect(tailwindPosition(node, "")).toEqual("absoluteManualLayout");

    // left-center
    node.x = 0;
    node.y = 37;
    // expect(tailwindPosition(node, "")).toEqual(
    //   "absolute inset-y-0 left-0 my-auto "
    // );
    expect(tailwindPosition(node, "")).toEqual("absoluteManualLayout");

    // bottom-center
    node.x = 37;
    node.y = 75;
    // expect(tailwindPosition(node, "")).toEqual(
    //   "absolute inset-x-0 bottom-0 mx-auto "
    // );
    expect(tailwindPosition(node, "")).toEqual("absoluteManualLayout");

    // right-center
    node.x = 75;
    node.y = 37;
    // expect(tailwindPosition(node, "")).toEqual(
    //   "absolute inset-y-0 right-0 my-auto "
    // );
    expect(tailwindPosition(node, "")).toEqual("absoluteManualLayout");

    // center Y, random X
    node.x = 22;
    node.y = 37;
    expect(tailwindPosition(node, "")).toEqual("absoluteManualLayout");

    // center X, random Y
    node.x = 37;
    node.y = 22;
    expect(tailwindPosition(node, "")).toEqual("absoluteManualLayout");

    // without position
    node.x = 45;
    node.y = 88;
    expect(tailwindPosition(node, "")).toEqual("absoluteManualLayout");
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

    expect(tailwindPosition(node, "")).toEqual("");
  });

  it("No position when parent is root", () => {
    const node = new AltFrameNode();
    node.layoutMode = "NONE";

    const parent = new AltFrameNode();
    parent.id = "root";
    parent.layoutMode = "NONE";

    node.parent = parent;

    expect(tailwindPosition(node, parent.id)).toEqual("");
  });
});
