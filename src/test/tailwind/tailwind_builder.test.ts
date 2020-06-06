import { createFigma } from "figma-api-stub";
import { tailwindMain } from "../../tailwind/tailwind_main";
import { tailwindAttributesBuilder } from "../../tailwind/tailwind_builder";

describe("Tailwind Builder", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  const node = figma.createRectangle();
  const parentId = node.parent!.id;

  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;

  const builder = new tailwindAttributesBuilder("", true);
  // .containerPosition(node, parentId)
  // .layoutAlign(node, parentId)
  // .shadow(node)
  // .customColor(node.strokes, "border")
  // .borderWidth(node)
  // .borderRadius(node);

  it("visibility", () => {
    builder.reset();

    node.visible = true;
    builder.visibility(node);
    expect(builder.attributes).toEqual("");
    builder.reset();

    node.visible = false;
    builder.visibility(node);
    expect(builder.attributes).toEqual("invisible ");
    builder.reset();
  });

  it("width", () => {
    builder.reset();

    node.resize(16, 16);
    builder.widthHeight(node);
    expect(builder.attributes).toEqual("w-4 h-4 ");
    builder.reset();

    node.resize(100, 200);
    builder.widthHeight(node);
    expect(builder.attributes).toEqual("w-24 h-48 ");
    builder.reset();

    node.resize(300, 300);
    builder.widthHeight(node);
    expect(builder.attributes).toEqual("w-full h-64 ");
    builder.reset();
  });

  it("opacity", () => {
    builder.reset();

    node.opacity = 0.1;
    builder.opacity(node);
    expect(builder.attributes).toEqual("opacity-0 ");
    builder.reset();

    node.opacity = 0.3;
    builder.opacity(node);
    expect(builder.attributes).toEqual("opacity-25 ");
    builder.reset();

    node.opacity = 0.45;
    builder.opacity(node);
    expect(builder.attributes).toEqual("opacity-50 ");
    builder.reset();

    node.opacity = 0.65;
    builder.opacity(node);
    expect(builder.attributes).toEqual("opacity-75 ");
    builder.reset();

    node.opacity = 0.95;
    builder.opacity(node);
    expect(builder.attributes).toEqual("opacity-75 ");
    builder.reset();
  });

  it("rotation", () => {
    builder.reset();

    node.rotation = 45;
    builder.rotation(node);
    expect(builder.attributes).toEqual("rotate-45 ");
    builder.reset();

    node.rotation = 90;
    builder.rotation(node);
    expect(builder.attributes).toEqual("rotate-90 ");
    builder.reset();

    node.rotation = 180;
    builder.rotation(node);
    expect(builder.attributes).toEqual("rotate-180 ");
    builder.reset();

    node.rotation = -45;
    builder.rotation(node);
    expect(builder.attributes).toEqual("-rotate-45 ");
    builder.reset();

    node.rotation = -90;
    builder.rotation(node);
    expect(builder.attributes).toEqual("-rotate-90 ");
    builder.reset();

    node.rotation = -180;
    builder.rotation(node);
    expect(builder.attributes).toEqual("-rotate-180 ");
    builder.reset();
  });
});
