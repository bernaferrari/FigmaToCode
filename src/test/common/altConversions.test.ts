import { tailwindMain } from "../../tailwind/tailwindMain";
import { createFigma } from "figma-api-stub";
import { convertIntoAltNodes } from "../../common/altConversion";

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

    expect(
      tailwindMain(
        "",
        convertIntoAltNodes([rectangle], undefined),
        false,
        false
      )
    ).toEqual('<div class="w-5 h-5"></div>');
  });

  it("Frame", () => {
    const frame = figma.createFrame();
    frame.resize(20, 20);

    expect(
      tailwindMain("", convertIntoAltNodes([frame], undefined), false, false)
    ).toEqual('<div class="w-5 h-5"></div>');
  });
  // todo Ellipse. There is no Ellipse in figma stubs.

  it("Group", () => {
    const node = figma.createFrame();
    node.resize(20, 20);

    figma.group([figma.createRectangle()], node);

    expect(
      tailwindMain("", convertIntoAltNodes([node], undefined), false, false)
    ).toEqual(
      `<div class="w-5 h-5">
<div class="inline-flex items-center justify-center"></div></div>`
    );
  });
});
