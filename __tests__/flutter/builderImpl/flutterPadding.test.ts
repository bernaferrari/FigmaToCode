import { AltRectangleNode } from "../../../src/altNodes/altMixins";
import { flutterPadding } from "../../../src/flutter/builderImpl/flutterPadding";
import { AltFrameNode } from "../../../src/altNodes/altMixins";

describe("Flutter Padding", () => {
  it("test padding", () => {
    const frameNode = new AltFrameNode();
    expect(flutterPadding(frameNode)).toEqual("");

    frameNode.layoutMode = "NONE";
    expect(flutterPadding(frameNode)).toEqual("");

    frameNode.layoutMode = "VERTICAL";

    frameNode.paddingLeft = 2;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 2;
    frameNode.paddingBottom = 2;
    expect(flutterPadding(frameNode)).toEqual(
      "padding: const EdgeInsets.all(2), "
    );

    frameNode.paddingLeft = 1;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 3;
    frameNode.paddingBottom = 4;
    expect(flutterPadding(frameNode)).toEqual(
      "padding: const EdgeInsets.only(left: 1, right: 2, top: 3, bottom: 4, ), "
    );

    frameNode.paddingLeft = 2;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 4;
    frameNode.paddingBottom = 4;
    expect(flutterPadding(frameNode)).toEqual(
      "padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4, ), "
    );

    frameNode.paddingLeft = 2;
    frameNode.paddingRight = 2;
    frameNode.paddingTop = 0;
    frameNode.paddingBottom = 0;
    expect(flutterPadding(frameNode)).toEqual(
      "padding: const EdgeInsets.symmetric(horizontal: 2, ), "
    );

    frameNode.paddingLeft = 0;
    frameNode.paddingRight = 0;
    frameNode.paddingTop = 2;
    frameNode.paddingBottom = 2;
    expect(flutterPadding(frameNode)).toEqual(
      "padding: const EdgeInsets.symmetric(vertical: 2, ), "
    );

    frameNode.paddingLeft = 0;
    frameNode.paddingRight = 0;
    frameNode.paddingTop = 0;
    frameNode.paddingBottom = 0;
    expect(flutterPadding(frameNode)).toEqual("");

    const notFrame = new AltRectangleNode();
    expect(flutterPadding(notFrame)).toEqual("");
  });
});
