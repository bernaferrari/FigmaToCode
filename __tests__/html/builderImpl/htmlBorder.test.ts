import {
  AltRectangleNode,
  AltTextNode,
  AltEllipseNode,
} from "../../../src/altNodes/altMixins";
import { htmlBorderRadius } from "../../../src/html/builderImpl/htmlBorderRadius";
describe("HTML Border", () => {
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

  it("standard corner radius", () => {
    node.cornerRadius = 0;
    expect(htmlBorderRadius(node, false)).toEqual("");

    node.height = 90;
    node.cornerRadius = 45;
    expect(htmlBorderRadius(node, false)).toEqual("border-radius: 45px; ");

    node.topLeftRadius = 0;
    node.cornerRadius = 0;
    expect(htmlBorderRadius(node, false)).toEqual("");

    node.cornerRadius = 10;
    expect(htmlBorderRadius(node, false)).toEqual("border-radius: 10px; ");
  });

  it("custom corner radius", () => {
    node.cornerRadius = figma.mixed;
    node.topLeftRadius = 4;
    expect(htmlBorderRadius(node, false)).toEqual(
      "border-top-left-radius: 4px; "
    );

    node.topLeftRadius = 0;
    node.topRightRadius = 4;
    expect(htmlBorderRadius(node, false)).toEqual(
      "border-top-right-radius: 4px; "
    );

    node.topRightRadius = 0;
    node.bottomLeftRadius = 4;
    expect(htmlBorderRadius(node, false)).toEqual(
      "border-bottom-left-radius: 4px; "
    );

    node.bottomLeftRadius = 0;
    node.bottomRightRadius = 4;
    expect(htmlBorderRadius(node, false)).toEqual(
      "border-bottom-right-radius: 4px; "
    );
  });

  it("other nodes", () => {
    // Ellipses are always round
    expect(htmlBorderRadius(new AltEllipseNode(), false)).toEqual(
      "border-radius: 9999px; "
    );

    // Text is unsupported
    expect(htmlBorderRadius(new AltTextNode(), false)).toEqual("");
  });
});
