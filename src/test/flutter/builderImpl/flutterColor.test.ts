import { flutterColor } from "./../../../flutter/builderImpl/flutterColor";
import { AltRectangleNode, AltTextNode } from "../../../altNodes/altMixins";
describe("Flutter Color", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("no text color when black", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 0.0,
          g: 0.0,
          b: 0.0,
        },
        opacity: 1.0,
      },
    ];

    expect(flutterColor(node.fills)).toEqual("color: Color(0xff000000), ");
  });

  it("opacity and visibility changes", () => {
    const node = new AltRectangleNode();
    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 0.0,
          g: 0.0,
          b: 0.0,
        },
        opacity: 1.0,
        visible: false,
      },
    ];

    expect(flutterColor(node.fills)).toEqual("");

    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 0.0,
          g: 0.0,
          b: 0.0,
        },
        opacity: 0.0,
        visible: true,
      },
    ];
    expect(flutterColor(node.fills)).toEqual("color: Color(0x00000000), ");
  });

  it("fail with other fill types", () => {
    const node = new AltRectangleNode();
    node.fills = [
      {
        type: "GRADIENT_LINEAR",
        gradientTransform: [
          [0, 0, 0],
          [0, 0, 0],
        ],
        gradientStops: [],
      },
    ];

    expect(flutterColor(node.fills)).toEqual("");
  });
});
