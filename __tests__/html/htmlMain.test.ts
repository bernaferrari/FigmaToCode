import { htmlMain } from "./../../src/html/htmlMain";
import { AltEllipseNode, AltTextNode } from "../../src/altNodes/altMixins";
import { convertToAutoLayout } from "../../src/altNodes/convertToAutoLayout";
import {
  AltRectangleNode,
  AltFrameNode,
  AltGroupNode,
} from "../../src/altNodes/altMixins";
import { TailwindDefaultBuilder } from "../../src/tailwind/tailwindDefaultBuilder";
import { tailwindMain } from "../../src/tailwind/tailwindMain";

describe("HTML Main", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("children is larger than 256", () => {
    const node = new AltFrameNode();
    node.width = 320;
    node.height = 320;
    node.name = "FRAME";
    node.layoutMode = "NONE";
    node.counterAxisSizingMode = "FIXED";

    const child1 = new AltRectangleNode();
    child1.width = 385;
    child1.height = 8;
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
    child2.width = 8;
    child2.height = 385;
    child2.x = 9;
    child2.y = 9;
    child2.name = "RECT2";

    // this works as a test for JSX, but should never happen in reality. In reality Frame would need to have 2 children and be relative.
    node.children = [child1, child2];
    child1.parent = node;
    child2.parent = node;

    expect(htmlMain([convertToAutoLayout(node)]))
      .toEqual(`<div style="width: 320px; height: 320px; position: relative;">
    <div style="width: 385px; height: 8px; left: 9px; top: 9px; position: absolute; background-color: white;"></div>
    <div style="width: 8px; height: 385px; left: 9px; top: 9px; position: absolute;"></div>
</div>`);
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
    expect(htmlMain([node], "", true, true))
      .toEqual(`<div className="GROUP" style={{width: 32, height: 32, position: 'relative',}}>
    <div className="RECT" style={{width: 4, height: 4, left: 9, top: 9, position: 'absolute', backgroundColor: 'white',}} />
</div>`);
  });

  it("ellipse with no size", () => {
    const node = new AltEllipseNode();

    // undefined (unitialized, only happen on tests)
    expect(htmlMain([node])).toEqual(
      '<div style="border-radius: 9999px;"></div>'
    );
    // todo verify if it is working properly.
    node.x = 0;
    node.y = 0;

    node.width = 0;
    node.height = 10;
    expect(htmlMain([node])).toEqual("");

    node.width = 10;
    node.height = 0;
    expect(htmlMain([node])).toEqual("");
  });

  it("input", () => {
    const textNode = new AltTextNode();
    textNode.characters = "username";
    textNode.fontSize = 26;
    textNode.x = 0;
    textNode.y = 0;

    const frameNode = new AltFrameNode();
    frameNode.layoutMode = "HORIZONTAL";
    frameNode.width = 100;
    frameNode.height = 40;
    frameNode.counterAxisSizingMode = "AUTO";
    frameNode.primaryAxisSizingMode = "AUTO";

    frameNode.primaryAxisAlignItems = "SPACE_BETWEEN";
    frameNode.counterAxisAlignItems = "CENTER";

    frameNode.children = [textNode];
    textNode.parent = frameNode;

    // In real life, justify-between would be converted to justify-center in the altConversion.
    expect(tailwindMain([frameNode])).toEqual(
      `<div class="inline-flex items-center justify-between">
    <p class="text-2xl">username</p>
</div>`
    );

    frameNode.name = "this is the InPuT";
    expect(htmlMain([frameNode])).toEqual(
      '<input style="font-size: 26px;" placeholder="username"></input>'
    );
  });

  it("JSX", () => {
    const node = new AltRectangleNode();
    node.name = "RECT";

    const builder = new TailwindDefaultBuilder(node, true, true);

    expect(builder.build()).toEqual(' className="RECT"');

    builder.reset();
    expect(builder.attributes).toEqual("");
  });

  it("JSX with relative position", () => {
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

    expect(htmlMain([convertToAutoLayout(node)], "", true, true))
      .toEqual(`<div className="FRAME" style={{width: 32, height: 32, position: 'relative',}}>
    <div className="RECT1" style={{width: 4, height: 4, left: 9, top: 9, position: 'absolute', backgroundColor: 'white',}} />
    <div className="RECT2" style={{width: 4, height: 4, left: 9, top: 9, position: 'absolute',}} />
</div>`);
  });

  it("AutoLayout", () => {
    const node = new AltFrameNode();
    node.width = 32;
    node.height = 32;
    node.x = 0;
    node.y = 0;
    node.name = "FRAME";
    node.layoutMode = "HORIZONTAL";
    node.itemSpacing = 4;
    node.primaryAxisAlignItems = "MIN";
    node.counterAxisAlignItems = "MIN";
    node.counterAxisSizingMode = "FIXED";
    node.primaryAxisSizingMode = "FIXED";

    const child1 = new AltRectangleNode();
    child1.width = 4;
    child1.height = 4;
    child1.x = 0;
    child1.y = 0;
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

    const child2 = new AltFrameNode();
    child2.width = 4;
    child2.height = 4;
    child2.x = 8;
    child2.y = 0;
    child2.name = "RECT2";
    child2.counterAxisSizingMode = "FIXED";
    child2.primaryAxisSizingMode = "FIXED";
    child2.primaryAxisAlignItems = "CENTER";
    child2.counterAxisAlignItems = "CENTER";
    child2.layoutGrow = 0;
    child2.layoutAlign = "INHERIT";
    child2.children = [];

    // this works as a test for JSX, but should never happen in reality. In reality Frame would need to have 2 children and be relative.
    node.children = [child1, child2];
    child1.parent = node;
    child2.parent = node;

    expect(htmlMain([node], "", false, true))
      .toEqual(`<div class="FRAME" style="width: 32px; height: 32px; display: inline-flex; flex-direction: row; align-items: flex-start; justify-content: flex-start;">
    <div class="RECT1" style="width: 4px; height: 4px; background-color: white;"></div>
    <div style="width: 4px;"></div>
    <div class="RECT2" style="width: 4px; height: 4px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center;"></div>
</div>`);

    node.primaryAxisAlignItems = "MAX";
    node.counterAxisAlignItems = "MAX";

    child2.primaryAxisAlignItems = "SPACE_BETWEEN";
    child2.counterAxisAlignItems = "CENTER";

    expect(htmlMain([node], "", false, true))
      .toEqual(`<div class="FRAME" style="width: 32px; height: 32px; display: inline-flex; flex-direction: row; align-items: flex-end; justify-content: flex-end;">
    <div class="RECT1" style="width: 4px; height: 4px; background-color: white;"></div>
    <div style="width: 4px;"></div>
    <div class="RECT2" style="width: 4px; height: 4px; display: inline-flex; flex-direction: column; align-items: center; justify-content: space-between;"></div>
</div>`);
  });

  it("Gradient Background with Gradient Text", () => {
    const gradientFill: GradientPaint = {
      type: "GRADIENT_LINEAR",
      gradientTransform: [
        [0.8038461208343506, 0.7035384774208069, -0.2932307720184326],
        [1.3402682542800903, -1.4652644395828247, 0.5407097935676575],
      ],
      gradientStops: [
        {
          position: 0,
          color: {
            r: 0,
            g: 0,
            b: 1,
            a: 1,
          },
        },
        {
          position: 1,
          color: {
            r: 1,
            g: 0,
            b: 0,
            a: 1,
          },
        },
      ],
    };

    const node = new AltFrameNode();
    node.width = 32;
    node.height = 32;
    node.x = 0;
    node.y = 0;
    node.name = "FRAME";
    node.layoutMode = "HORIZONTAL";
    node.itemSpacing = 4;
    node.primaryAxisAlignItems = "MIN";
    node.counterAxisAlignItems = "MIN";
    node.counterAxisSizingMode = "FIXED";
    node.primaryAxisSizingMode = "FIXED";
    node.fills = [gradientFill];
    node.effects = [
      {
        blendMode: "NORMAL",
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        type: "DROP_SHADOW",
        visible: true,
      },
    ];
    node.cornerRadius = 8;

    const text = new AltTextNode();
    text.width = 20;
    text.height = 4;
    text.x = 0;
    text.y = 0;
    text.name = "TEXT";
    text.fills = [gradientFill];
    text.characters = "gradient";

    // this works as a test for JSX, but should never happen in reality. In reality Frame would need to have 2 children and be relative.
    node.children = [text];
    text.parent = node;

    expect(htmlMain([node], "", false, true))
      .toEqual(`<div class="FRAME" style="width: 32px; height: 32px; background-image: linear-gradient(131deg, rgba(0, 0, 255, 1), rgba(255, 0, 0, 1)); box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border-radius: 8px; display: inline-flex; flex-direction: row; align-items: flex-start; justify-content: flex-start;">
    <p class="TEXT" style="width: 20px; background: linear-gradient(131deg, rgba(0, 0, 255, 1), rgba(255, 0, 0, 1)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">gradient</p>
</div>`);
  });
});
