import { AltFrameNode, AltEllipseNode } from "./../../src/altNodes/altMixins";
import { AltRectangleNode } from "../../src/altNodes/altMixins";
import { flutterContainer } from "../../src/flutter/flutterContainer";

describe("Flutter Container", () => {
  it("no size", () => {
    const node = new AltRectangleNode();

    // undefined (unitialized, only happen on tests)
    expect(flutterContainer(node, "")).toEqual("");

    node.width = 0;
    node.height = 10;
    expect(flutterContainer(node, "")).toEqual("");

    node.width = 10;
    node.height = 0;
    expect(flutterContainer(node, "")).toEqual("");
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

    expect(flutterContainer(parent, "")).toEqual(`Padding(
    padding: const EdgeInsets.all(10),
),`);

    node.layoutGrow = 1;
    node.layoutAlign = "STRETCH";

    parent.primaryAxisSizingMode = "FIXED";
    parent.counterAxisSizingMode = "FIXED";

    expect(flutterContainer(node, "")).toEqual(`Expanded(
    child: Container(
        height: double.infinity,
    ),
),`);
  });

  it("standard scenario", () => {
    const node = new AltRectangleNode();
    node.width = 10;
    node.height = 10;

    expect(flutterContainer(node, "")).toEqual(`Container(
    width: 10,
    height: 10,
),`);

    expect(flutterContainer(node, "child")).toEqual(`Container(
    width: 10,
    height: 10,
    child: child
),`);
  });

  it("ellipse", () => {
    const node = new AltEllipseNode();
    node.width = 10;
    node.height = 10;

    expect(flutterContainer(node, "")).toEqual(`Container(
    width: 10,
    height: 10,
    decoration: BoxDecoration(
        shape: BoxShape.circle,
    ),
),`);
  });
});
