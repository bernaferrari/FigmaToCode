import { tailwindShadow } from "./../../../tailwind/builderImpl/tailwindShadow";
import {
  AltRectangleNode,
  AltTextNode,
  AltEllipseNode,
} from "../../../common/altMixins";
import { createFigma } from "figma-api-stub";
import {
  tailwindBorderWidth,
  tailwindBorderRadius,
} from "../../../tailwind/builderImpl/tailwindBorder";
describe("Tailwind Shadow", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;

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
