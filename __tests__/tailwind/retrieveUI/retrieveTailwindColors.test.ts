import { retrieveGenericSolidUIColors } from "./../../../src/common/retrieveUI/retrieveColors";
import {
  AltFrameNode,
  AltRectangleNode,
} from "../../../src/altNodes/altMixins";

describe("Retrieve Tailwind Colors for UI", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };
  it("retrieve", () => {
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

    const child0 = new AltFrameNode();

    const child1 = new AltRectangleNode();
    child1.fills = fills1;
    child1.parent = child0;

    const child2 = new AltFrameNode();
    child2.parent = child0;

    const child3 = new AltRectangleNode();
    child3.fills = fills2;
    child3.strokes = fills1;
    child3.parent = child2;

    child2.children = [child3];

    const child4 = new AltRectangleNode();
    child4.fills = [];
    child4.strokes = [];
    child4.parent = child0;

    child0.children = [child1, child2, child4];

    expect(retrieveGenericSolidUIColors([child0], "tailwind")).toEqual([
      {
        colorName: "black",
        contrastBlack: 0,
        contrastWhite: 0,
        exported: "bg-black ",
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
  });
});
