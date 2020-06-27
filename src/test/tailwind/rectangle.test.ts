import { AltRectangleNode } from "./../../common/altMixins";
import { createFigma } from "figma-api-stub";
import { tailwindMain } from "../../tailwind/tailwindMain";

describe("Tailwind Rectangle", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  const node = new AltRectangleNode();
  node.width = 300;
  node.height = 300;

  const parentId = node.parent?.id ?? "";

  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;

  const executeMain = () => {
    return tailwindMain(parentId, [node], true, false);
  };

  it("small size", () => {
    node.width = 16;
    node.height = 16;
    expect(executeMain()).toEqual('<div className="w-4 h-4"></div>');
  });

  it("medium size", () => {
    node.width = 100;
    node.height = 200;

    expect(executeMain()).toEqual('<div className="w-24 h-48"></div>');
  });

  it("large size", () => {
    node.width = 300;
    node.height = 300;
    expect(executeMain()).toEqual('<div className="w-full h-64"></div>');
  });

  it("color orange", () => {
    node.visible = true;
    node.fills = [
      {
        type: "SOLID",
        color: { r: 1, g: 0.5, b: 0 },
      },
    ];
    expect(executeMain()).toEqual(
      '<div className="w-full h-64 bg-orange-600"></div>'
    );
  });

  it("color gray", () => {
    node.fills = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];
    expect(executeMain()).toEqual(
      '<div className="w-full h-64 bg-gray-800"></div>'
    );
  });

  it("color gray", () => {
    node.fills = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];
    expect(executeMain()).toEqual(
      '<div className="w-full h-64 bg-gray-800"></div>'
    );
  });

  it("stroke", () => {
    node.fills = figma.mixed;
    node.strokeWeight = 4;
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];
    expect(executeMain()).toEqual(
      '<div className="w-full h-64 border-4 border-gray-800"></div>'
    );
  });

  it("corner radius", () => {
    node.fills = figma.mixed;
    node.strokes = [];
    node.cornerRadius = 8;
    expect(executeMain()).toEqual(
      '<div className="w-full h-64 rounded-lg"></div>'
    );
  });

  it("opacity", () => {
    node.cornerRadius = figma.mixed;
    node.opacity = 0.4;
    expect(executeMain()).toEqual(
      '<div className="opacity-50 w-full h-64"></div>'
    );
  });

  it("visible", () => {
    node.opacity = 1;
    node.visible = false;
    expect(executeMain()).toEqual(
      '<div className="invisible w-full h-64"></div>'
    );
  });
});
