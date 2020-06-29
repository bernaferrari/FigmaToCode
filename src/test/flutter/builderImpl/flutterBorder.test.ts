import {
  AltRectangleNode,
  AltEllipseNode,
  AltGroupNode,
} from "./../../../common/altMixins";
import {
  flutterBorderRadius,
  flutterBorder,
  flutterShape,
} from "../../../flutter/builderImpl/flutterBorder";

describe("Flutter Border", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  const node = new AltRectangleNode();

  it("flutterBorderRadius", () => {
    expect(flutterBorderRadius(node)).toEqual("");

    node.cornerRadius = 2;
    expect(flutterBorderRadius(node)).toEqual(
      "borderRadius: BorderRadius.circular(2), "
    );

    node.cornerRadius = figma.mixed;
    node.topLeftRadius = 2;
    node.topRightRadius = 0;
    node.bottomLeftRadius = 0;
    node.bottomRightRadius = 0;
    expect(flutterBorderRadius(node)).toEqual(
      "borderRadius: BorderRadius.only(topLeft: 2, topRight: 0, bottomLeft: 0, bottomRight: 0), "
    );

    const ellipseNode = new AltEllipseNode();
    expect(flutterBorderRadius(ellipseNode)).toEqual("");
  });

  it("flutterBorder", () => {
    node.strokeWeight = 2;
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0, g: 0, b: 0 },
      },
    ];
    expect(flutterBorder(node)).toEqual(
      "border: Border.all(color: Color(0xff000000),width: 2,),"
    );

    node.strokeWeight = 0;
    expect(flutterBorder(node)).toEqual("");

    expect(flutterBorder(new AltGroupNode())).toEqual("");
  });

  it("flutterShape", () => {
    node.cornerRadius = figma.mixed;
    node.topLeftRadius = 4;
    expect(flutterShape(node)).toEqual(
      "shape: RoundedRectangleBorder(side: BorderSide(width: 0, color: Color(0xff000000),), borderRadius: BorderRadius.only(topLeft: 4, topRight: 0, bottomLeft: 0, bottomRight: 0), ),"
    );

    const ellipseNode = new AltEllipseNode();
    ellipseNode.strokeWeight = 4;
    expect(flutterShape(ellipseNode)).toEqual(
      "shape: CircleBorder(side: BorderSide(width: 4, ), )"
    );
  });
});
