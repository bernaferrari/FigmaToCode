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

    frameNode.horizontalPadding = 2;
    frameNode.verticalPadding = 0;
    expect(flutterPadding(frameNode)).toEqual(
      "padding: const EdgeInsets.symmetric(horizontal: 2, ),"
    );

    frameNode.horizontalPadding = 0;
    frameNode.verticalPadding = 2;
    expect(flutterPadding(frameNode)).toEqual(
      "padding: const EdgeInsets.symmetric(vertical: 2, ),"
    );

    frameNode.horizontalPadding = 2;
    frameNode.verticalPadding = 2;
    expect(flutterPadding(frameNode)).toEqual(
      "padding: const EdgeInsets.all(2), "
    );

    frameNode.horizontalPadding = 0;
    frameNode.verticalPadding = 0;
    expect(flutterPadding(frameNode)).toEqual("");

    const notFrame = new AltRectangleNode();
    expect(flutterPadding(notFrame)).toEqual("");
  });
});
