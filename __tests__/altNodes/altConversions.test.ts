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
<div class="inline-flex items-center justify-center">
<div class="w-5 h-5"></div></div></div>`
    );
  });

  it("Text", () => {
    const node = figma.createText();

    figma.loadFontAsync({ family: "Roboto", style: "Regular" });

    node.fontName = { family: "Roboto", style: "Regular" };
    node.characters = "";

    expect(tailwindMain(convertIntoAltNodes([node]))).toEqual(`<p></p>`);
  });

  // todo add a test for EllipseNode, but there is no EllipseNode in figma-api-stubs!
});
