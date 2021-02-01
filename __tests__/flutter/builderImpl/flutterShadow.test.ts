import {
  flutterBoxShadow,
  flutterElevationAndShadowColor,
} from "../../../src/flutter/builderImpl/flutterShadow";
import { AltFrameNode } from "../../../src/altNodes/altMixins";

describe("Flutter Shadow", () => {
  it("drop shadow", () => {
    const node = new AltFrameNode();

    node.effects = [];
    expect(flutterBoxShadow(node)).toEqual("");

    node.effects = [
      {
        type: "DROP_SHADOW",
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        visible: true,
      },
      {
        type: "DROP_SHADOW",
        blendMode: "NORMAL",
        color: { r: 1, g: 1, b: 0, a: 0.25 },
        offset: { x: 4, y: 4 },
        radius: 8,
        visible: true,
      },
    ];

    expect(flutterBoxShadow(node)).toEqual(
      `\nboxShadow: [
    BoxShadow(
        color: Color(0x3f000000),
        blurRadius: 4,
        offset: Offset(0, 4),
    ),
    BoxShadow(
        color: Color(0x3fffff00),
        blurRadius: 8,
        offset: Offset(4, 4),
    ),
],`
    );

    const [elev, color] = flutterElevationAndShadowColor(node);
    expect(elev).toEqual("\nelevation: 4, ");
    expect(color).toEqual("\ncolor: Color(0x3f000000), ");
  });

  it("inner shadow", () => {
    const node = new AltFrameNode();

    node.effects = [];
    const [elev1, color1] = flutterElevationAndShadowColor(node);
    expect(elev1).toEqual("");
    expect(color1).toEqual("");

    node.effects = [
      {
        type: "INNER_SHADOW",
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        visible: true,
      },
    ];

    expect(flutterBoxShadow(node)).toEqual("");

    const [elev2, color2] = flutterElevationAndShadowColor(node);
    expect(elev2).toEqual("");
    expect(color2).toEqual("");
  });
});
