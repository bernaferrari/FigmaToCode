import { swiftuiBlendMode } from "./../../../src/swiftui/builderImpl/swiftuiBlend";
import { swiftuiVisibility } from "../../../src/swiftui/builderImpl/swiftuiBlend";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";

import {
  swiftuiOpacity,
  swiftuiRotation,
} from "../../../src/swiftui/builderImpl/swiftuiBlend";

describe("SwiftUI Blend", () => {
  const node = new AltRectangleNode();

  it("opacity", () => {
    node.opacity = 0.1;
    expect(swiftuiOpacity(node)).toEqual("\n.opacity(0.10)");

    node.opacity = 0.45;
    expect(swiftuiOpacity(node)).toEqual("\n.opacity(0.45)");

    node.opacity = 0.0;
    expect(swiftuiOpacity(node)).toEqual("\n.opacity(0)");
  });

  it("visibility", () => {
    // undefined (unitialized, only happen on tests)
    expect(swiftuiVisibility(node)).toEqual("");

    node.visible = false;
    expect(swiftuiVisibility(node)).toEqual("\n.hidden()");

    node.visible = true;
    expect(swiftuiVisibility(node)).toEqual("");
  });

  it("rotation", () => {
    // avoid rounding errors
    node.rotation = -7.0167096047110005e-15;
    expect(swiftuiRotation(node)).toEqual("");

    node.rotation = 45;
    expect(swiftuiRotation(node)).toEqual(".rotationEffect(.degrees(45))");

    node.rotation = -45;
    expect(swiftuiRotation(node)).toEqual(".rotationEffect(.degrees(-45))");

    node.rotation = -180;
    expect(swiftuiRotation(node)).toEqual(".rotationEffect(.degrees(-180))");
  });

  it("blend modes", () => {
    node.blendMode = "PASS_THROUGH";
    expect(swiftuiBlendMode(node)).toEqual("");

    node.blendMode = "COLOR";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.color)");

    node.blendMode = "COLOR_BURN";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.colorBurn)");

    node.blendMode = "COLOR_DODGE";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.colorDodge)");

    node.blendMode = "DIFFERENCE";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.difference)");

    node.blendMode = "EXCLUSION";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.exclusion)");

    node.blendMode = "HARD_LIGHT";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.hardLight)");

    node.blendMode = "HUE";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.hue)");

    node.blendMode = "LIGHTEN";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.lighten)");

    node.blendMode = "LIGHTEN";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.lighten)");

    node.blendMode = "LUMINOSITY";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.luminosity)");

    node.blendMode = "MULTIPLY";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.multiply)");

    node.blendMode = "OVERLAY";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.overlay)");

    node.blendMode = "SATURATION";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.saturation)");

    node.blendMode = "SCREEN";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.screen)");

    node.blendMode = "SOFT_LIGHT";
    expect(swiftuiBlendMode(node)).toEqual("\n.blendMode(.softLight)");
  });
});
