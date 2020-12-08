import { tailwindPosition } from "../../../src/tailwind/builderImpl/tailwindPosition";
import { AltFrameNode } from "../../../src/altNodes/altMixins";

describe("Tailwind Position", () => {
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
    expect(tailwindPosition(node)).toEqual("");

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
    expect(tailwindPosition(node, "", true)).toEqual(
      "absolute m-auto inset-0 "
    );
    expect(tailwindPosition(node, "", false)).toEqual("absoluteManualLayout");

    // top-left
    node.x = 0;
    node.y = 0;
    expect(tailwindPosition(node)).toEqual("absolute left-0 top-0 ");

    // top-right
    node.x = 75;
    node.y = 0;
    expect(tailwindPosition(node)).toEqual("absolute right-0 top-0 ");

    // bottom-left
    node.x = 0;
    node.y = 75;
    expect(tailwindPosition(node)).toEqual("absolute left-0 bottom-0 ");

    // bottom-right
    node.x = 75;
    node.y = 75;
    expect(tailwindPosition(node)).toEqual("absolute right-0 bottom-0 ");

    // top-center
    node.x = 37;
    node.y = 0;
    expect(tailwindPosition(node, "", true)).toEqual(
      "absolute inset-x-0 top-0 mx-auto "
    );
    expect(tailwindPosition(node)).toEqual("absoluteManualLayout");

    // left-center
    node.x = 0;
    node.y = 37;
    expect(tailwindPosition(node, "", true)).toEqual(
      "absolute inset-y-0 left-0 my-auto "
    );
    expect(tailwindPosition(node)).toEqual("absoluteManualLayout");

    // bottom-center
    node.x = 37;
    node.y = 75;
    expect(tailwindPosition(node, "", true)).toEqual(
      "absolute inset-x-0 bottom-0 mx-auto "
    );
    expect(tailwindPosition(node)).toEqual("absoluteManualLayout");

    // right-center
    node.x = 75;
    node.y = 37;
    expect(tailwindPosition(node, "", true)).toEqual(
      "absolute inset-y-0 right-0 my-auto "
    );
    expect(tailwindPosition(node)).toEqual("absoluteManualLayout");

    // center Y, random X
    node.x = 22;
    node.y = 37;
    expect(tailwindPosition(node)).toEqual("absoluteManualLayout");

    // center X, random Y
    node.x = 37;
    node.y = 22;
    expect(tailwindPosition(node)).toEqual("absoluteManualLayout");

    // without position
    node.x = 45;
    node.y = 88;
    expect(tailwindPosition(node)).toEqual("absoluteManualLayout");
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
