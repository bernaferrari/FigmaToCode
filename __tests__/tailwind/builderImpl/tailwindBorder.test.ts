import {
  AltRectangleNode,
  AltTextNode,
  AltEllipseNode,
} from "../../../src/altNodes/altMixins";
import {
  tailwindBorderWidth,
  tailwindBorderRadius,
} from "../../../src/tailwind/builderImpl/tailwindBorder";
describe("Tailwind Border", () => {
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
  it("borderWidth", () => {
    node.strokeWeight = 1;
    expect(tailwindBorderWidth(node)).toEqual("border ");

    node.strokeWeight = 2;
    expect(tailwindBorderWidth(node)).toEqual("border-2 ");

    node.strokeWeight = 4;
    expect(tailwindBorderWidth(node)).toEqual("border-4 ");

    node.strokeWeight = 8;
    expect(tailwindBorderWidth(node)).toEqual("border-8 ");

    // random large value to show the limit
    node.strokeWeight = 22;
    expect(tailwindBorderWidth(node)).toEqual("border-8 ");
  });

  it("standard corner radius", () => {
    node.cornerRadius = 0;
    expect(tailwindBorderRadius(node)).toEqual("");

    node.height = 90;
    node.cornerRadius = 45;
    expect(tailwindBorderRadius(node)).toEqual("rounded-full ");

    node.topLeftRadius = 0;
    node.cornerRadius = 0;
    expect(tailwindBorderRadius(node)).toEqual("");

    node.cornerRadius = 10;
    expect(tailwindBorderRadius(node)).toEqual("rounded-lg ");
  });

  it("custom corner radius", () => {
    node.cornerRadius = figma.mixed;
    node.topLeftRadius = 4;
    expect(tailwindBorderRadius(node)).toEqual("rounded-tl ");

    node.topLeftRadius = 0;
    node.topRightRadius = 4;
    expect(tailwindBorderRadius(node)).toEqual("rounded-tr ");

    node.topRightRadius = 0;
    node.bottomLeftRadius = 4;
    expect(tailwindBorderRadius(node)).toEqual("rounded-bl ");

    node.bottomLeftRadius = 0;
    node.bottomRightRadius = 4;
    expect(tailwindBorderRadius(node)).toEqual("rounded-br ");
  });

  it("other nodes", () => {
    // Ellipses are always round
    expect(tailwindBorderRadius(new AltEllipseNode())).toEqual("rounded-full ");

    // Text is unsupported
    expect(tailwindBorderRadius(new AltTextNode())).toEqual("");
  });
});
