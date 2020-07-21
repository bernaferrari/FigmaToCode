import { swiftuiPadding } from "../../../src/swiftui/builderImpl/swiftuiPadding";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";
import { AltFrameNode } from "../../../src/altNodes/altMixins";

describe("SwiftUI padding", () => {
  it("test all possible variations", () => {
    const frameNode = new AltFrameNode();
    expect(swiftuiPadding(frameNode)).toEqual("");

    frameNode.layoutMode = "NONE";
    expect(swiftuiPadding(frameNode)).toEqual("");

    frameNode.layoutMode = "VERTICAL";

    frameNode.paddingLeft = 2;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 0;
    frameNode.paddingBottom = 0;
    expect(swiftuiPadding(frameNode)).toEqual("\n.padding(.horizontal, 2)");

    frameNode.paddingLeft = 0;
    frameNode.paddingRight = 0;
    frameNode.paddingTop = 2;
    frameNode.paddingBottom = 2;
    expect(swiftuiPadding(frameNode)).toEqual("\n.padding(.vertical, 2)");

    frameNode.paddingLeft = 2;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 2;
    frameNode.paddingBottom = 2;
    expect(swiftuiPadding(frameNode)).toEqual("\n.padding(2)");

    frameNode.paddingLeft = 0;
    frameNode.paddingRight = 0;
    frameNode.paddingTop = 0;
    frameNode.paddingBottom = 0;
    expect(swiftuiPadding(frameNode)).toEqual("");

    frameNode.paddingLeft = 2;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 3;
    frameNode.paddingBottom = 2;
    expect(swiftuiPadding(frameNode)).toEqual(`\n.padding(.horizontal, 2)
.padding(.top, 3)
.padding(.bottom, 2)`);

    frameNode.paddingLeft = 3;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 2;
    frameNode.paddingBottom = 2;
    expect(swiftuiPadding(frameNode)).toEqual(`\n.padding(.vertical, 2)
.padding(.leading, 3)
.padding(.trailing, 2)`);

    frameNode.paddingLeft = 1;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 3;
    frameNode.paddingBottom = 4;
    expect(swiftuiPadding(frameNode)).toEqual(
      `\n.padding(.leading, 1)
.padding(.trailing, 2)
.padding(.top, 3)
.padding(.bottom, 4)`
    );

    const notFrame = new AltRectangleNode();
    expect(swiftuiPadding(notFrame)).toEqual("");
  });
});
