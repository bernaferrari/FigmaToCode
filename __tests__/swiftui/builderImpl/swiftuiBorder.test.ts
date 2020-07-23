import { AltEllipseNode } from "./../../../src/altNodes/altMixins";
import {
  swiftuiBorder,
  swiftuiShapeStroke,
} from "../../../src/swiftui/builderImpl/swiftuiBorder";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";
describe("SwiftUI Border", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  const blackFill: Paint = {
    type: "SOLID",
    color: { r: 0, g: 0, b: 0 },
    opacity: 1,
  };

  it("border without corner", () => {
    const node = new AltRectangleNode();
    node.strokes = [blackFill];

    node.cornerRadius = 0;
    node.strokeWeight = 0;
    expect(swiftuiBorder(node)).toEqual("");
    expect(swiftuiShapeStroke(node)).toEqual("");

    node.fills = [blackFill];
    node.strokeWeight = 10;
    expect(swiftuiBorder(node)).toEqual("\n.border(Color.black, width: 10)");
    expect(swiftuiShapeStroke(node)).toEqual("");
  });

  it("border with corner radius", () => {
    const node = new AltRectangleNode();
    node.strokes = [blackFill];

    node.cornerRadius = 0;
    node.strokeWeight = 10;

    expect(swiftuiBorder(node)).toEqual("");
    expect(swiftuiShapeStroke(node)).toEqual(
      "\n.stroke(Color.black, lineWidth: 10)"
    );

    node.topLeftRadius = 0;
    node.cornerRadius = 8;
    node.strokeWeight = 10;

    expect(swiftuiBorder(node)).toEqual(
      "\n.overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.black, lineWidth: 10))"
    );
    expect(swiftuiShapeStroke(node)).toEqual("");

    node.cornerRadius = figma.mixed;
    node.topLeftRadius = 8;
    node.topRightRadius = 6;
    node.bottomLeftRadius = 4;
    node.bottomRightRadius = 2;

    expect(swiftuiBorder(node)).toEqual(
      `\n.overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.black, lineWidth: 10))`
    );
    expect(swiftuiShapeStroke(node)).toEqual("");

    node.fills = [blackFill];
    node.topLeftRadius = 0;
    node.topRightRadius = 0;
    node.bottomLeftRadius = 0;
    node.bottomRightRadius = 0;

    expect(swiftuiBorder(node)).toEqual(`\n.border(Color.black, width: 10)`);
    expect(swiftuiShapeStroke(node)).toEqual("");
  });

  it("Ellipse", () => {
    const node = new AltEllipseNode();
    node.strokes = [blackFill];
    node.strokeWeight = 10;

    expect(swiftuiBorder(node)).toEqual("");
    expect(swiftuiShapeStroke(node)).toEqual(
      "\n.stroke(Color.black, lineWidth: 10)"
    );

    node.fills = [blackFill];

    expect(swiftuiBorder(node)).toEqual(
      "\n.overlay(Ellipse().stroke(Color.black, lineWidth: 10))"
    );
    expect(swiftuiShapeStroke(node)).toEqual("");
  });

  it("border with random fill", () => {
    const node = new AltRectangleNode();
    node.strokes = [
      {
        type: "GRADIENT_LINEAR",
        gradientTransform: [
          [0, 0, 0],
          [0, 0, 0],
        ],
        gradientStops: [],
      },
    ];

    node.cornerRadius = 8;
    node.strokeWeight = 10;

    expect(swiftuiBorder(node)).toEqual(
      "\n.overlay(RoundedRectangle(cornerRadius: 8).stroke(LinearGradient(gradient: Gradient(colors: []), startPoint: .leading, endPoint: .trailing), lineWidth: 10))"
    );
    expect(swiftuiShapeStroke(node)).toEqual("");
  });
});
