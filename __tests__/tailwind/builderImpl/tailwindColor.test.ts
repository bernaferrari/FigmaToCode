import { tailwindColor } from "../../../src/tailwind/builderImpl/tailwindColor";
import { AltRectangleNode, AltTextNode } from "../../../src/altNodes/altMixins";
describe("Tailwind Shadow", () => {
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

    expect(tailwindColor(node.fills, "text")).toEqual("");
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

    expect(tailwindColor(node.fills, "")).toEqual("");

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
    expect(tailwindColor(node.fills, "bg")).toEqual("bg-black bg-opacity-0 ");
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

    expect(tailwindColor(node.fills, "")).toEqual("");
  });
});
