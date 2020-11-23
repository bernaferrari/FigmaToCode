import { AltEllipseNode, AltTextNode } from "./../../src/altNodes/altMixins";
import { swiftuiMain } from "./../../src/swiftui/swiftuiMain";
import { convertToAutoLayout } from "../../src/altNodes/convertToAutoLayout";
import {
  AltRectangleNode,
  AltFrameNode,
  AltGroupNode,
} from "../../src/altNodes/altMixins";

describe("SwiftUI Main", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };
  it("Standard flow", () => {
    const node = new AltFrameNode();
    node.width = 32;
    node.height = 32;
    node.x = 0;
    node.y = 0;
    node.name = "FRAME";
    node.layoutMode = "NONE";
    node.counterAxisSizingMode = "FIXED";

    const child1 = new AltRectangleNode();
    child1.width = 4;
    child1.height = 4;
    child1.x = 9;
    child1.y = 9;
    child1.name = "RECT1";
    child1.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    const child2 = new AltRectangleNode();
    child2.width = 4;
    child2.height = 4;
    child2.x = 9;
    child2.y = 9;
    child2.name = "RECT2";

    // this works as a test for JSX, but should never happen in reality. In reality Frame would need to have 2 children and be relative.
    node.children = [child1, child2];
    child1.parent = node;
    child2.parent = node;

    expect(swiftuiMain([convertToAutoLayout(node)])).toEqual(`ZStack {
Rectangle()
.fill(Color.white)
.offset(x: -5, y: -5)
.frame(width: 4, height: 4)
Rectangle()
.offset(x: -5, y: -5)
.frame(width: 4, height: 4)
}
.frame(width: 32, height: 32)`);
  });
  it("Group with relative position", () => {
    // this also should neve happen in reality, because Group must have the same size as the children.

    const node = new AltGroupNode();
    node.width = 32;
    node.height = 32;
    node.x = 0;
    node.y = 0;
    node.name = "GROUP";
    node.isRelative = true;

    const child = new AltRectangleNode();
    child.width = 4;
    child.height = 4;
    child.x = 9;
    child.y = 9;
    child.name = "RECT";
    child.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    node.children = [child];
    child.parent = node;
    expect(swiftuiMain([node])).toEqual(`ZStack {
Rectangle()
.fill(Color.white)
.offset(x: -5, y: -5)
.frame(width: 4, height: 4)
}
.frame(width: 32, height: 32)`);
  });

  it("Row and Column with 2 children", () => {
    // this also should neve happen in reality, because Group must have the same size as the children.

    const node = new AltFrameNode();
    node.width = 32;
    node.height = 8;
    node.x = 0;
    node.y = 0;
    node.layoutMode = "VERTICAL";
    node.primaryAxisAlignItems = "MAX";
    node.counterAxisAlignItems = "MAX";
    node.counterAxisSizingMode = "AUTO";
    node.primaryAxisSizingMode = "AUTO";
    node.itemSpacing = 8;

    const child1 = new AltRectangleNode();
    child1.width = 8;
    child1.height = 8;
    child1.x = 0;
    child1.y = 0;
    child1.layoutAlign = "INHERIT";
    child1.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    const child2 = new AltRectangleNode();
    child2.width = 8;
    child2.height = 8;
    child2.x = 16;
    child2.y = 0;
    child2.layoutAlign = "INHERIT";
    child2.fills = [
      {
        type: "SOLID",
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ];

    node.children = [child1, child2];
    child1.parent = node;
    child2.parent = node;

    expect(swiftuiMain([node]))
      .toEqual(`VStack(alignment: .trailing, spacing: 8) {
Rectangle()
.fill(Color.white)
.frame(width: 8, height: 8)
Rectangle()
.fill(Color.black)
.frame(width: 8, height: 8)
}`);

    // variations in layoutAlign for test coverage
    node.primaryAxisAlignItems = "CENTER";
    node.counterAxisAlignItems = "CENTER";
    node.itemSpacing = 16;

    expect(swiftuiMain([node])).toEqual(`VStack() {
Rectangle()
.fill(Color.white)
.frame(width: 8, height: 8)
Rectangle()
.fill(Color.black)
.frame(width: 8, height: 8)
}`);

    // variations in layoutAlign and spacing for coverage
    node.primaryAxisAlignItems = "MIN";
    node.counterAxisAlignItems = "MIN";
    node.itemSpacing = 0;
    node.fills = [
      {
        type: "SOLID",
        color: { r: 0, g: 0, b: 0 },
        opacity: 1,
      },
    ];

    expect(swiftuiMain([node]))
      .toEqual(`VStack(alignment: .leading, spacing: 0) {
Rectangle()
.fill(Color.white)
.frame(width: 8, height: 8)
Rectangle()
.fill(Color.black)
.frame(width: 8, height: 8)
}
.background(Color.black)`);

    // change orientation
    node.layoutMode = "HORIZONTAL";
    node.primaryAxisAlignItems = "MIN";
    node.counterAxisAlignItems = "MIN";

    expect(swiftuiMain([node])).toEqual(`HStack(alignment: .top, spacing: 0) {
Rectangle()
.fill(Color.white)
.frame(width: 8, height: 8)
Rectangle()
.fill(Color.black)
.frame(width: 8, height: 8)
}
.background(Color.black)`);

    node.primaryAxisAlignItems = "CENTER";
    node.counterAxisAlignItems = "CENTER";

    expect(swiftuiMain([node])).toEqual(`HStack(spacing: 0) {
Rectangle()
.fill(Color.white)
.frame(width: 8, height: 8)
Rectangle()
.fill(Color.black)
.frame(width: 8, height: 8)
}
.background(Color.black)`);

    node.primaryAxisAlignItems = "MAX";
    node.counterAxisAlignItems = "MAX";

    expect(swiftuiMain([node]))
      .toEqual(`HStack(alignment: .bottom, spacing: 0) {
Rectangle()
.fill(Color.white)
.frame(width: 8, height: 8)
Rectangle()
.fill(Color.black)
.frame(width: 8, height: 8)
}
.background(Color.black)`);
  });

  it("Row with 1 children", () => {
    // this also should neve happen in reality, because Group must have the same size as the children.

    const node = new AltFrameNode();
    node.width = 32;
    node.height = 8;
    node.x = 0;
    node.y = 0;
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "AUTO";
    node.itemSpacing = 8;
    node.paddingLeft = 8;
    node.paddingRight = 8;
    node.paddingTop = 8;
    node.paddingBottom = 8;

    const child1 = new AltRectangleNode();
    child1.width = 8;
    child1.height = 8;
    child1.x = 0;
    child1.y = 0;
    child1.cornerRadius = 8;
    child1.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    node.children = [child1];
    child1.parent = node;

    expect(swiftuiMain([node])).toEqual(`RoundedRectangle(cornerRadius: 8)
.fill(Color.white)
.frame(width: 8, height: 8)
.padding(8)`);
  });

  it("101 items", () => {
    const parent = new AltFrameNode();
    parent.layoutMode = "NONE";

    const node = new AltRectangleNode();
    node.width = 20;
    node.height = 20;

    parent.children = [];
    for (let i = 0; i < 101; i++) {
      parent.children.push(node);
    }

    const conversion = swiftuiMain([parent]);
    // detect if there are the slashes of the comment that only appears at > 100.
    expect(conversion.match("//") !== null).toBe(true);

    // check the length. It is supposed to be long.
    expect(conversion.length).toBe(4539);

    // todo count the number of "Groups {"
  });

  it("ellipse with no size", () => {
    const node = new AltEllipseNode();

    // undefined (unitialized, only happen on tests)
    expect(swiftuiMain([node])).toEqual("Ellipse()");

    node.width = 0;
    node.height = 10;
    expect(swiftuiMain([node])).toEqual("");

    node.width = 10;
    node.height = 0;
    expect(swiftuiMain([node])).toEqual("");
  });

  it("Frame with round corners", () => {
    const node = new AltFrameNode();
    node.width = 20;
    node.height = 20;
    node.layoutMode = "NONE";
    node.cornerRadius = 20;
    node.fills = [
      {
        type: "SOLID",
        color: {
          r: 0.0,
          g: 0.0,
          b: 0.0,
        },
        opacity: 1.0,
        visible: true,
      },
    ];

    const child = new AltTextNode();
    child.characters = "";
    child.width = 10;
    child.height = 10;
    child.x = 0;
    child.y = 0;
    child.parent = node;

    node.children = [child];

    // undefined (unitialized, only happen on tests)
    expect(swiftuiMain([convertToAutoLayout(node)])).toEqual(`Text("")
.padding(.trailing, 10)
.padding(.bottom, 10)
.frame(width: 20, height: 20)
.background(Color.black)
.cornerRadius(20)`);
  });
});
