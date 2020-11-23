import { swiftuiMain } from "./../../../src/swiftui/swiftuiMain";
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
    const gradientFill: GradientPaint = {
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
    };

    node.fills = [gradientFill];

    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .leading, endPoint: .trailing)"
    );

    // topLeft to bottomRight (135)
    Object.assign(gradientFill.gradientTransform, [
      [0.8038461208343506, 0.7035384774208069, -0.2932307720184326],
      [1.3402682542800903, -1.4652644395828247, 0.5407097935676575],
    ]);
    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .topLeading, endPoint: .bottomTrailing)"
    );

    // bottom to top (-90)
    Object.assign(gradientFill.gradientTransform, [
      [7.734507789791678e-8, -1.2339448928833008, 1.1376146078109741],
      [-2.3507132530212402, -1.0997783306265774e-7, 1.6796307563781738],
    ]);
    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .bottom, endPoint: .top)"
    );

    // top to bottom (90)
    Object.assign(gradientFill.gradientTransform, [
      [6.851496436866e-8, 2.085271120071411, -0.6976743936538696],
      [3.9725232124328613, -1.4210854715202004e-14, -0.8289895057678223],
    ]);
    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .top, endPoint: .bottom)"
    );

    // left to right (0)
    Object.assign(gradientFill.gradientTransform, [
      [1.845637559890747, 1.9779233184635814e-7, -0.45637592673301697],
      [6.030897026221282e-8, -3.364259719848633, 2.188383102416992],
    ]);
    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .leading, endPoint: .trailing)"
    );

    // right to left (180)
    Object.assign(gradientFill.gradientTransform, [
      [-2.3905811309814453, 0.04066795855760574, 1.707460880279541],
      [0.07747448235750198, 4.357592582702637, -1.0299113988876343],
    ]);
    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .trailing, endPoint: .leading)"
    );

    // bottom left to top right (-135)
    Object.assign(gradientFill.gradientTransform, [
      [-1.2678464651107788, -1.9602917432785034, 1.6415824890136719],
      [-3.7344324588775635, 2.3110527992248535, 0.4661891460418701],
    ]);
    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .bottomTrailing, endPoint: .topLeading)"
    );

    // bottom left to top right (-45)
    Object.assign(gradientFill.gradientTransform, [
      [0.7420053482055664, -0.6850813031196594, 0.4412658214569092],
      [-1.3051068782806396, -1.3525396585464478, 1.8345310688018799],
    ]);
    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .bottomLeading, endPoint: .topTrailing)"
    );

    // top right to bottom left (-45)
    Object.assign(gradientFill.gradientTransform, [
      [-0.7061997652053833, 0.7888921499252319, 0.5180976986885071],
      [1.5028705596923828, 1.2872726917266846, -1.0877336263656616],
    ]);
    expect(swiftuiColor(node.fills)).toEqual(
      "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .topTrailing, endPoint: .bottomLeading)"
    );
  });

  it("Execute Main with Linear Gradient, corners and stroke", () => {
    const node = new AltRectangleNode();
    const gradientFill: GradientPaint = {
      type: "GRADIENT_LINEAR",
      gradientTransform: [
        [0.8038461208343506, 0.7035384774208069, -0.2932307720184326],
        [1.3402682542800903, -1.4652644395828247, 0.5407097935676575],
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
        {
          position: 1,
          color: {
            r: 1,
            g: 0,
            b: 0,
            a: 1,
          },
        },
      ],
    };

    node.fills = [gradientFill];
    node.width = 10;
    node.height = 10;
    node.strokeWeight = 4;
    node.strokeAlign = "OUTSIDE";
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];
    node.cornerRadius = 16;

    expect(swiftuiMain([node])).toEqual(
      `RoundedRectangle(cornerRadius: 16)
.fill(LinearGradient(gradient: Gradient(colors: [Color.black, Color(red: 1, green: 0, blue: 0)]), startPoint: .topLeading, endPoint: .bottomTrailing))
.frame(width: 18, height: 18)
.overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(red: 0.25, green: 0.25, blue: 0.25), lineWidth: 4))`
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
