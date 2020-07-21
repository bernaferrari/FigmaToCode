import { tailwindShadow } from "../../../src/tailwind/builderImpl/tailwindShadow";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";
describe("Tailwind Shadow", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("drop shadow", () => {
    const node = new AltRectangleNode();

    // no shadow
    expect(tailwindShadow(node)).toEqual("");

    node.effects = [
      {
        type: "DROP_SHADOW",
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        visible: true,
      },
    ];

    expect(tailwindShadow(node)).toEqual("shadow ");
  });

  it("inner shadow", () => {
    const node = new AltRectangleNode();

    node.effects = [
      {
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        type: "INNER_SHADOW",
        visible: true,
      },
    ];

    expect(tailwindShadow(node)).toEqual("shadow-inner ");
  });
});
