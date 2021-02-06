import { htmlMain } from "./../../../src/html/htmlMain";
import {
  htmlColorFromFills,
  htmlGradientFromFills,
} from "./../../../src/html/builderImpl/htmlColor";
import { AltRectangleNode, AltTextNode } from "../../../src/altNodes/altMixins";
describe("HTML Color", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("white and black", () => {
    const node = new AltTextNode();
    node.characters = "";
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

    expect(htmlColorFromFills(node.fills)).toEqual("white");

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
    expect(htmlColorFromFills(node.fills)).toEqual("black");
  });

  it("opacity and visibility changes", () => {
    const node = new AltRectangleNode();
    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 1.0,
          g: 0.0,
          b: 0.0,
        },
        opacity: 1.0,
        visible: false,
      },
    ];

    expect(htmlColorFromFills(node.fills)).toEqual("");

    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 1.0,
          g: 0.0,
          b: 0.0,
        },
        opacity: 0.0,
        visible: true,
      },
    ];
    expect(htmlColorFromFills(node.fills)).toEqual("rgba(255, 0, 0, 0)");
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

    expect(htmlGradientFromFills(node.fills)).toEqual(
      "linear-gradient(90deg, black)"
    );

    // topLeft to bottomRight (135)
    Object.assign(gradientFill.gradientTransform, [
      [0.8038461208343506, 0.7035384774208069, -0.2932307720184326],
      [1.3402682542800903, -1.4652644395828247, 0.5407097935676575],
    ]);
    expect(htmlGradientFromFills(node.fills)).toEqual(
      "linear-gradient(131deg, black)"
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

    // width is going be 18 because 10 + 4 + 4 of stroke.
    node.height = 10;
    node.width = 10;
    node.fills = [gradientFill];
    node.strokeWeight = 4;
    node.strokeAlign = "OUTSIDE";
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];
    node.cornerRadius = 16;

    expect(htmlMain([node])).toEqual(
      `<div style="width: 18px; height: 18px; background-image: linear-gradient(131deg, black, rgba(255, 0, 0, 1)); border-radius: 16px; border: 4px solid rgba(63.75, 63.75, 63.75, 1);"></div>`
    );
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

    expect(htmlColorFromFills(node.fills)).toEqual("");
  });
});
