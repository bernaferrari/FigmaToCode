import { swiftuiColor } from "../../../src/swiftui/builderImpl/swiftuiColor";
import { AltRectangleNode, AltTextNode } from "../../../src/altNodes/altMixins";
describe("SwiftUI Color", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("standard set color", () => {
    const node = new AltRectangleNode();
    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 0.941,
          g: 0.318,
          b: 0.22,
        },
        opacity: 1.0,
      },
    ];

    expect(swiftuiColor(node.fills)).toEqual(
      "Color(red: 0.94, green: 0.32, blue: 0.22)"
    );
  });

  it("check for black and white on Text", () => {
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

    expect(swiftuiColor(node.fills)).toEqual("Color.black");

    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 1.0,
          g: 1.0,
          b: 1.0,
        },
        opacity: 1.0,
      },
    ];

    expect(swiftuiColor(node.fills)).toEqual("Color.white");
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

    expect(swiftuiColor(node.fills)).toEqual("");

    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 0.0,
          g: 0.0,
          b: 0.0,
        },
        opacity: undefined,
        visible: true,
      },
    ];

    // this scenario should never happen in real life; figma allows undefined to be set, but not to be get.
    expect(swiftuiColor(node.fills)).toEqual("Color.black");

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
    expect(swiftuiColor(node.fills)).toEqual(
      "Color(red: 0, green: 0, blue: 0, opacity: 0)"
    );
  });

  it("Gradient Linear", () => {
    const node = new AltRectangleNode();
    node.fills = [
      {
        type: "GRADIENT_LINEAR",
        gradientTransform: [
          [0, 0, 0],
          [0, 0, 0],
        ],
        gradientStops: [
          {
            position: 0,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            },
          },
        ],
      },
    ];

    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .top, endPoint: .bottom)"
    );
  });

  it("fail with other types", () => {
    const node = new AltRectangleNode();
    node.fills = [
      {
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash: null,
      },
    ];

    expect(swiftuiColor(node.fills)).toEqual("");
  });
});
