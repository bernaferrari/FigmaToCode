import { createFigma } from "figma-api-stub";
import { tailwindMain } from "../../src/tailwind/tailwindMain";
import { convertIntoAltNodes } from "../../src/altNodes/altConversion";
import { htmlMain } from "./../../src/html/htmlMain";
import { AltFrameNode } from "./../../src/altNodes/altMixins";

describe("AltConversions", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  // @ts-expect-error for some reason, need to override this for figma.mixed to work
  global.figma = figma;
  it("Rectangle", () => {
    const rectangle = figma.createRectangle();
    rectangle.resize(20, 20);

    expect(tailwindMain(convertIntoAltNodes([rectangle]))).toEqual(
      '<div class="w-5 h-5"></div>',
    );
  });

  it("Frame", () => {
    const frame = figma.createFrame();
    frame.resize(20, 20);
    frame.x = 0;
    frame.y = 0;
    frame.layoutMode = "HORIZONTAL";
    frame.counterAxisAlignItems = "CENTER";
    frame.primaryAxisAlignItems = "SPACE_BETWEEN";
    frame.counterAxisSizingMode = "FIXED";
    frame.primaryAxisSizingMode = "FIXED";

    const rectangle = figma.createRectangle();
    rectangle.resize(20, 20);
    rectangle.x = 0;
    rectangle.y = 0;
    rectangle.layoutGrow = 0;
    rectangle.layoutAlign = "INHERIT";
    frame.appendChild(rectangle);

    expect(htmlMain(convertIntoAltNodes([frame]))).toEqual(
      `<div style="width: 20px; height: 20px;">
    <div style="width: 20px; height: 20px;"></div>
</div>`,
    );
  });

  // todo understand why it is failing
  // it("Group wrapping single item", () => {
  //   // single Group should disappear
  //   const node = figma.createFrame();
  //   node.resize(20, 20);

  //   const rectangle = figma.createRectangle();
  //   rectangle.resize(20, 20);

  //   figma.group([rectangle], node);

  //   const convert = convertIntoAltNodes([node]);

  //   expect(tailwindMain(convert)).toEqual(`<div class="w-5 h-5"></div>`);
  // });

  // todo understand why it is failing
  //   it("Group wrapping two items", () => {
  //     // single Group should disappear
  //     const node = figma.createFrame();
  //     node.resize(20, 20);
  //     node.primaryAxisAlignItems = "CENTER";
  //     node.counterAxisAlignItems = "CENTER";

  //     const rect1 = figma.createRectangle();
  //     rect1.resize(20, 20);

  //     const rect2 = figma.createRectangle();
  //     rect2.resize(20, 20);

  //     figma.group([rect1, rect2], node);

  //     const convert = convertIntoAltNodes([node]);

  //     expect(tailwindMain(convert)).toEqual(
  //       `<div class="inline-flex flex-col items-center justify-center">
  // <div class="inline-flex flex-col items-center justify-center">
  // <div class="w-5 h-5"></div>
  // <div class="w-5 h-5"></div></div></div>`
  //     );
  //   });

  it("Text", () => {
    const node = figma.createText();

    figma.loadFontAsync({
      family: "Roboto",
      style: "Regular",
    });

    node.fontName = { family: "Roboto", style: "Regular" };
    node.characters = "";

    expect(
      tailwindMain(convertIntoAltNodes([node], new AltFrameNode())),
    ).toEqual(`<p></p>`);
  });

  it("Ellipse", () => {
    // this test requires mocking the full EllipseNode. Figma-api-stub doesn't support VectorNode.
    class EllipseNode {
      readonly type = "ELLIPSE";
    }

    interface EllipseNode
      extends DefaultShapeMixin,
        ConstraintMixin,
        CornerMixin {
      readonly type: "ELLIPSE";
      clone(): EllipseNode;
      arcData: ArcData;
    }

    const node = new EllipseNode();
    // set read-only variables
    Object.defineProperty(node, "width", { value: 20 });
    Object.defineProperty(node, "height", { value: 20 });

    expect(
      tailwindMain(convertIntoAltNodes([node], new AltFrameNode())),
    ).toEqual(`<div class="w-5 h-5 rounded-full"></div>`);
  });

  it("Line", () => {
    // this test requires mocking the full EllipseNode. Figma-api-stub doesn't support VectorNode.
    class LineNode {
      readonly type = "LINE";
    }

    interface LineNode extends DefaultShapeMixin, ConstraintMixin, CornerMixin {
      readonly type: "LINE";
      clone(): LineNode;
    }

    const node = new LineNode();
    // set read-only variables
    Object.defineProperty(node, "width", { value: 20 });

    expect(
      tailwindMain(convertIntoAltNodes([node], new AltFrameNode())),
    ).toEqual(`<div class="w-5 h-0.5"></div>`);
  });

  it("Vector", () => {
    // this test requires mocking the full VectorNode. Figma-api-stub doesn't support VectorNode.
    class VectorNode {
      readonly type = "VECTOR";
    }

    interface VectorNode
      extends DefaultShapeMixin,
        ConstraintMixin,
        CornerMixin {
      readonly type: "VECTOR";
      clone(): VectorNode;
      vectorNetwork: VectorNetwork;
      vectorPaths: VectorPaths;
      handleMirroring: HandleMirroring | PluginAPI["mixed"];
    }

    const node = new VectorNode();
    // set read-only variables
    Object.defineProperty(node, "width", { value: 20 });
    Object.defineProperty(node, "height", { value: 20 });

    expect(
      tailwindMain(convertIntoAltNodes([node], new AltFrameNode())),
    ).toEqual(`<div class="w-5 h-5 bg-pink-900/50 rounded-lg"></div>`);
  });
});
