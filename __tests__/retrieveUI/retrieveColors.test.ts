import { AltTextNode } from "./../../src/altNodes/altMixins";
import {
  retrieveGenericLinearGradients,
  retrieveGenericSolidUIColors,
} from "../../src/common/retrieveUI/retrieveColors";
import { AltFrameNode, AltRectangleNode } from "../../src/altNodes/altMixins";

describe("Retrieve Colors for UI", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  const child0 = new AltFrameNode();

  const child1 = new AltRectangleNode();
  child1.parent = child0;

  const child2 = new AltFrameNode();
  child2.parent = child0;

  const child3 = new AltTextNode();
  child3.parent = child2;

  child2.children = [child3];

  const child4 = new AltRectangleNode();
  child4.fills = [];
  child4.strokes = [];
  child4.parent = child0;

  child0.children = [child1, child2, child4];
  it("Solid Colors", () => {
    const fills1: ReadonlyArray<Paint> = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    const fills2: ReadonlyArray<Paint> = [
      {
        type: "SOLID",
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ];

    child1.fills = fills1;
    child3.fills = fills2;
    child3.strokes = fills1;

    expect(retrieveGenericSolidUIColors([child0], "html")).toEqual([
      {
        colorName: "",
        contrastBlack: 0,
        contrastWhite: 0,
        exported: "black",
        hex: "000000",
      },
      {
        colorName: "",
        contrastBlack: 0,
        contrastWhite: 0,
        exported: "white",
        hex: "ffffff",
      },
    ]);

    expect(retrieveGenericSolidUIColors([child0], "tailwind")).toEqual([
      {
        colorName: "black",
        contrastBlack: 0,
        contrastWhite: 0,
        exported: "text-black ",
        hex: "000000",
      },
      {
        colorName: "white",
        contrastBlack: 0,
        contrastWhite: 0,
        exported: "bg-white ",
        hex: "ffffff",
      },
    ]);

    expect(retrieveGenericSolidUIColors([child0], "flutter")).toEqual([
      {
        colorName: "",
        contrastBlack: 1,
        contrastWhite: 21,
        exported: "Colors.black",
        hex: "000000",
      },
      {
        colorName: "",
        contrastBlack: 21,
        contrastWhite: 1,
        exported: "Colors.white",
        hex: "ffffff",
      },
    ]);

    expect(retrieveGenericSolidUIColors([child0], "swiftui")).toEqual([
      {
        colorName: "",
        contrastBlack: 0,
        contrastWhite: 0,
        exported: "Color.black",
        hex: "000000",
      },
      {
        colorName: "",
        contrastBlack: 0,
        contrastWhite: 0,
        exported: "Color.white",
        hex: "ffffff",
      },
    ]);

    // Wrong
    expect(retrieveGenericLinearGradients([child0], "swiftui")).toEqual([]);
  });

  it("Linear Gradients", () => {
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
    child1.fills = [gradientFill];
    child3.fills = [gradientFill];
    child3.strokes = [gradientFill];

    expect(retrieveGenericLinearGradients([child0], "html")).toEqual([
      {
        css: "linear-gradient(90deg, black)",
        exported: "linear-gradient(90deg, black)",
      },
    ]);

    expect(retrieveGenericLinearGradients([child0], "tailwind")).toEqual([
      {
        css: "linear-gradient(90deg, black)",
        exported: "bg-gradient-to-r from-black ",
      },
    ]);

    expect(retrieveGenericLinearGradients([child0], "flutter")).toEqual([
      {
        css: "linear-gradient(90deg, black)",
        exported:
          "LinearGradient(begin: Alignment.centerLeft, end: Alignment.centerRight, colors: [Colors.black], )",
      },
    ]);

    expect(retrieveGenericLinearGradients([child0], "swiftui")).toEqual([
      {
        css: "linear-gradient(90deg, black)",
        exported:
          "LinearGradient(gradient: Gradient(colors: [Color.black]), startPoint: .leading, endPoint: .trailing)",
      },
    ]);

    // Wrong
    expect(retrieveGenericSolidUIColors([child0], "swiftui")).toEqual([]);
  });
});
