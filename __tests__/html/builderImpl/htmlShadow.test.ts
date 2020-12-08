import { htmlShadow } from "./../../../src/html/builderImpl/htmlShadow";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";
describe("HTML Shadow", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("drop shadow", () => {
    const node = new AltRectangleNode();

    // no shadow
    expect(htmlShadow(node)).toEqual("");

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

    expect(htmlShadow(node)).toEqual("0px 4px 4px rgba(0, 0, 0, 0.25)");
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

    expect(htmlShadow(node)).toEqual("0px 4px 4px rgba(0, 0, 0, 0.25) inset");
  });
});
