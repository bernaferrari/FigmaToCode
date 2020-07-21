import {
  swiftuiShadow,
  swiftuiBlur,
} from "./../../../src/swiftui/builderImpl/swiftuiEffects";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";
describe("SwiftUI Shadow and Blur", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("drop shadow", () => {
    const node = new AltRectangleNode();

    // no shadow
    expect(swiftuiShadow(node)).toEqual("");

    // x is zero (default) y is not zero
    node.effects = [
      {
        type: "DROP_SHADOW",
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        visible: true,
      },
    ];

    expect(swiftuiShadow(node)).toEqual("\n.shadow(radius: 4, y: 4)");

    // x is not zero y is zero (default)
    node.effects = [
      {
        type: "DROP_SHADOW",
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 4, y: 0 },
        radius: 4,
        visible: true,
      },
    ];

    expect(swiftuiShadow(node)).toEqual("\n.shadow(radius: 4, x: 4)");

    // x and y are different and both are not zero (default)
    node.effects = [
      {
        type: "DROP_SHADOW",
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 2, y: 4 },
        radius: 4,
        visible: true,
      },
    ];

    expect(swiftuiShadow(node)).toEqual("\n.shadow(radius: 4, x: 2, y: 4)");

    // x and y are the same, but not zero
    node.effects = [
      {
        type: "DROP_SHADOW",
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 1 },
        offset: { x: 4, y: 4 },
        radius: 4,
        visible: true,
      },
    ];

    expect(swiftuiShadow(node)).toEqual(
      "\n.shadow(color: Color(red: 0, green: 0, blue: 0, opacity: 1), radius: 4)"
    );
  });

  it("blur", () => {
    const node = new AltRectangleNode();

    // no shadow
    expect(swiftuiBlur(node)).toEqual("");

    node.effects = [
      {
        type: "LAYER_BLUR",
        radius: 4,
        visible: true,
      },
    ];

    expect(swiftuiBlur(node)).toEqual("\n.blur(radius: 4)");
  });

  it("inner shadow (invalid)", () => {
    const node = new AltRectangleNode();

    node.effects = [
      {
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        type: "INNER_SHADOW",
        visible: true,
      },
    ];

    expect(swiftuiShadow(node)).toEqual("");
    expect(swiftuiBlur(node)).toEqual("");
  });
});
