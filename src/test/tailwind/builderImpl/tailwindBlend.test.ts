import {
  flutterOpacity,
  flutterRotation,
  flutterVisibility,
} from "./../../../flutter/builderImpl/flutterBlend";
import { AltRectangleNode } from "../../../common/altMixins";

describe("Tailwind Blend", () => {
  const node = new AltRectangleNode();

  it("opacity", () => {
    // undefined (unitialized, only happen on tests)
    expect(flutterOpacity(node, "")).toEqual("");

    node.opacity = 0.5;
    expect(flutterOpacity(node, "test")).toEqual(
      "Opacity(opacity: 0.5, child: test),"
    );

    node.opacity = 1.0;
    expect(flutterOpacity(node, "")).toEqual("");
  });

  it("visibility", () => {
    // undefined (unitialized, only happen on tests)
    expect(flutterVisibility(node, "")).toEqual("");

    node.visible = false;
    expect(flutterVisibility(node, "test")).toEqual(
      "Visibility(visible: false, child: test),"
    );

    node.visible = true;
    expect(flutterVisibility(node, "test")).toEqual("test");
  });

  it("rotation", () => {
    // undefined (unitialized, only happen on tests)
    expect(flutterRotation(node, "")).toEqual("");

    node.rotation = 45;
    expect(flutterRotation(node, "test")).toEqual(
      "Transform.rotate(angle: -0.7853975, child: test)"
    );

    node.rotation = 90;
    expect(flutterRotation(node, "test")).toEqual(
      "Transform.rotate(angle: -1.570795, child: test)"
    );
  });
});
