import { tailwindShadow } from "./../../../tailwind/builderImpl/tailwindShadow";
import { AltRectangleNode } from "../../../altNodes/altMixins";
describe("Tailwind Shadow", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  const node = new AltRectangleNode();
  node.topRightRadius = 0;
  node.bottomLeftRadius = 0;
  node.bottomRightRadius = 0;

  node.strokes = [
    {
      type: "SOLID",
      color: { r: 0, g: 0, b: 0 },
    },
  ];
  it("test", () => {
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
