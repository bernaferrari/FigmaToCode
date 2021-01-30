import { htmlPadding } from "./../../../src/html/builderImpl/htmlPadding";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";
import { AltFrameNode } from "../../../src/altNodes/altMixins";

describe("HTML padding", () => {
  it("test html padding", () => {
    const frameNode = new AltFrameNode();
    expect(htmlPadding(frameNode, false)).toEqual("");

    frameNode.layoutMode = "NONE";
    expect(htmlPadding(frameNode, false)).toEqual("");

    frameNode.layoutMode = "VERTICAL";

    frameNode.paddingLeft = 4;
    frameNode.paddingRight = 4;
    frameNode.paddingTop = 4;
    frameNode.paddingBottom = 4;
    expect(htmlPadding(frameNode, false)).toEqual("padding: 4px; ");

    frameNode.paddingLeft = 1;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 3;
    frameNode.paddingBottom = 4;
    expect(htmlPadding(frameNode, false)).toEqual(
      "padding-top: 3px; padding-bottom: 4px; padding-left: 1px; padding-right: 2px; "
    );

    frameNode.paddingLeft = 4;
    frameNode.paddingRight = 4;
    frameNode.paddingTop = 8;
    frameNode.paddingBottom = 8;
    expect(htmlPadding(frameNode, false)).toEqual(
      "padding-left: 4px; padding-right: 4px; padding-top: 8px; padding-bottom: 8px; "
    );

    frameNode.paddingLeft = 0;
    frameNode.paddingRight = 0;
    frameNode.paddingTop = 0;
    frameNode.paddingBottom = 0;
    expect(htmlPadding(frameNode, false)).toEqual("");

    const notFrame = new AltRectangleNode();
    expect(htmlPadding(notFrame, false)).toEqual("");
  });
});
