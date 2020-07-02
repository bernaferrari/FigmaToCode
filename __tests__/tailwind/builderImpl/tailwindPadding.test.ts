import { tailwindPadding } from "../../../src/tailwind/builderImpl/tailwindPadding";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";
import { AltFrameNode } from "../../../src/altNodes/altMixins";

describe("Tailwind padding", () => {
  it("test tailwind padding", () => {
    const frameNode = new AltFrameNode();
    expect(tailwindPadding(frameNode)).toEqual("");

    frameNode.layoutMode = "NONE";
    expect(tailwindPadding(frameNode)).toEqual("");

    frameNode.layoutMode = "VERTICAL";

    frameNode.horizontalPadding = 2;
    frameNode.verticalPadding = 0;
    expect(tailwindPadding(frameNode)).toEqual("px-1 ");

    frameNode.horizontalPadding = 0;
    frameNode.verticalPadding = 2;
    expect(tailwindPadding(frameNode)).toEqual("py-1 ");

    frameNode.horizontalPadding = 2;
    frameNode.verticalPadding = 2;
    expect(tailwindPadding(frameNode)).toEqual("p-1 ");

    frameNode.horizontalPadding = 0;
    frameNode.verticalPadding = 0;
    expect(tailwindPadding(frameNode)).toEqual("");

    const notFrame = new AltRectangleNode();
    expect(tailwindPadding(notFrame)).toEqual("");
  });
});
