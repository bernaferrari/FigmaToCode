import { tailwindTextSize } from "./../../../tailwind/builderImpl/tailwindTextSize";
import { AltFrameNode, AltTextNode } from "../../../altNodes/altMixins";

describe("TextSize", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("full text width when width is same to the parent", () => {
    const parentNode = new AltFrameNode();
    parentNode.layoutMode = "HORIZONTAL";
    parentNode.width = 120;
    parentNode.height = 12;

    const node = new AltTextNode();
    node.characters = "";
    node.width = 100;
    node.height = 12;
    node.x = 0;
    node.y = 0;
    node.textAutoResize = "NONE";

    parentNode.children = [node];
    node.parent = parentNode;

    expect(tailwindTextSize(node)).toEqual("w-full h-3 ");

    node.textAutoResize = "HEIGHT";
    expect(tailwindTextSize(node)).toEqual("w-full ");
  });
});
