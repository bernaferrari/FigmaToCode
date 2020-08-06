import { AltFrameNode, AltEllipseNode } from "../../src/altNodes/altMixins";
import { AltRectangleNode } from "../../src/altNodes/altMixins";
import { flutterMaterial } from "../../src/flutter/flutterMaterial";

describe("Flutter Material", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("no size", () => {
    const node = new AltRectangleNode();

    // undefined (unitialized, only happen on tests)
    expect(flutterMaterial(node, "")).toEqual(`
Material(color: Colors.transparent, ), `);

    node.width = 0;
    node.height = 10;
    expect(flutterMaterial(node, "")).toEqual("");

    node.width = 10;
    node.height = 0;
    expect(flutterMaterial(node, "")).toEqual("");
  });

  it("padding only", () => {
    const node = new AltRectangleNode();
    node.width = 10;
    node.height = 10;

    const parent = new AltFrameNode();
    parent.layoutMode = "HORIZONTAL";
    parent.width = 30;
    parent.height = 30;
    parent.x = 0;
    parent.y = 0;
    parent.paddingLeft = 10;
    parent.paddingRight = 10;
    parent.paddingTop = 10;
    parent.paddingBottom = 10;

    parent.children = [node];
    node.parent = parent;

    expect(flutterMaterial(parent, "child")).toEqual(`
Material(color: Colors.transparent, child: Padding(padding: const EdgeInsets.all(10), ), child: child), ), `);
  });

  it("standard scenario", () => {
    const node = new AltRectangleNode();
    node.width = 10;
    node.height = 10;
    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    expect(flutterMaterial(node, ""))
      .toEqual(`SizedBox(width: 10, height: 10, child: 
Material(color: Colors.white, ), ), `);

    expect(flutterMaterial(node, "child"))
      .toEqual(`SizedBox(width: 10, height: 10, child: 
Material(color: Colors.white, child: child), ), `);
  });

  it("ellipse", () => {
    const node = new AltEllipseNode();
    node.width = 10;
    node.height = 10;

    expect(flutterMaterial(node, ""))
      .toEqual(`SizedBox(width: 10, height: 10, child: 
Material(color: Colors.transparent, shape: CircleBorder(), ), ), `);
  });

  it("rectangle with border", () => {
    const node = new AltRectangleNode();
    node.width = 10;
    node.height = 10;
    node.strokeWeight = 4;
    node.strokes = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    expect(flutterMaterial(node, ""))
      .toEqual(`SizedBox(width: 10, height: 10, child: 
Material(color: Colors.transparent, shape: RoundedRectangleBorder(side: BorderSide(width: 4, color: Colors.white, ), ),), ), `);
  });

  it("clipping", () => {
    const node = new AltFrameNode();
    node.width = 10;
    node.height = 10;
    node.cornerRadius = 10;
    node.clipsContent = true;

    const child = new AltRectangleNode();
    child.width = 5;
    child.height = 5;
    child.x = 0;
    child.y = 0;

    child.parent = node;
    node.children = [child];

    expect(flutterMaterial(node, "")).toEqual(
      `SizedBox(width: 10, height: 10, child: 
Material(color: Colors.transparent, borderRadius: BorderRadius.circular(10), clipBehavior: Clip.antiAlias, ), ), `
    );
  });
});
