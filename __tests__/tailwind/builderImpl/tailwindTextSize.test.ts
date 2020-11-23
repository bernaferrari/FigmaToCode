import { tailwindTextSize } from "../../../src/tailwind/builderImpl/tailwindTextSize";
import { AltFrameNode, AltTextNode } from "../../../src/altNodes/altMixins";

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
    parentNode.paddingLeft = 0;
    parentNode.paddingRight = 0;
    parentNode.paddingTop = 0;
    parentNode.paddingBottom = 0;
    parentNode.primaryAxisAlignItems = "CENTER";
    parentNode.counterAxisAlignItems = "CENTER";
    parentNode.counterAxisSizingMode = "FIXED";
    parentNode.primaryAxisSizingMode = "FIXED";

    const node = new AltTextNode();
    node.characters = "";
    node.width = 120;
    node.height = 12;
    node.x = 0;
    node.y = 0;
    node.textAutoResize = "NONE";

    parentNode.children = [node];
    node.parent = parentNode;

    // todo verify if this is correct
    expect(tailwindTextSize(node)).toEqual("w-full h-full ");

    node.width = 100;
    expect(tailwindTextSize(node)).toEqual("w-5/6 h-full ");

    node.textAutoResize = "HEIGHT";
    expect(tailwindTextSize(node)).toEqual("w-5/6 ");
  });
});
