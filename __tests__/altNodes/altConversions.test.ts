import { tailwindMain } from "../../src/tailwind/tailwindMain";
import { createFigma } from "figma-api-stub";
import { convertIntoAltNodes } from "../../src/altNodes/altConversion";

describe("AltConversions", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;
  it("Rectangle", () => {
    const rectangle = figma.createRectangle();
    rectangle.resize(20, 20);

    expect(tailwindMain(convertIntoAltNodes([rectangle]))).toEqual(
      '<div class="w-5 h-5"></div>'
    );
  });

  it("Frame", () => {
    const frame = figma.createFrame();
    frame.resize(20, 20);

    expect(tailwindMain(convertIntoAltNodes([frame]))).toEqual(
      '<div class="w-5 h-5"></div>'
    );
  });

  it("Group", () => {
    // todo verify if this is working as inteded.
    const node = figma.createFrame();
    node.resize(20, 20);

    const rectangle = figma.createRectangle();
    rectangle.resize(20, 20);

    figma.group([rectangle], node);

    const convert = convertIntoAltNodes([node]);

    expect(tailwindMain(convert)).toEqual(
      `<div class="inline-flex flex-col items-center justify-center">
<div class="w-5 h-5"></div></div>`
    );
  });

  it("Text", () => {
    const node = figma.createText();

    figma.loadFontAsync({ family: "Roboto", style: "Regular" });

    node.fontName = { family: "Roboto", style: "Regular" };
    node.characters = "";

    expect(tailwindMain(convertIntoAltNodes([node]))).toEqual(`<p></p>`);
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

    expect(tailwindMain(convertIntoAltNodes([node]))).toEqual(
      `<div class="w-5 h-5 rounded-full"></div>`
    );
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

    expect(tailwindMain(convertIntoAltNodes([node]))).toEqual(
      `<div class="opacity-50 w-5 h-5"></div>`
    );
  });

  // todo add a test for EllipseNode, but there is no EllipseNode in figma-api-stubs!
});
