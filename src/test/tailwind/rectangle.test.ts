import { createFigma } from "figma-api-stub";
import { tailwindMain } from "../../tailwind/tailwind_main";

describe("Tailwind Rectangle", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  const node = figma.createRectangle();
  const parentId = node.parent!.id;

  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;

  const executeMain = () => tailwindMain(parentId, [node]);

  it("small size", () => {
    node.resize(16, 16);
    expect(executeMain()).toEqual('\n<div className="w-4 h-4"></div>');
  });

  it("medium size", () => {
    node.resize(100, 200);
    expect(executeMain()).toEqual('\n<div className="w-24 h-48"></div>');
  });

  it("large size", () => {
    node.resize(300, 300);
    expect(executeMain()).toEqual('\n<div className="w-full h-64"></div>');
  });

  it("color orange", () => {
    node.fills = [
      {
        type: "SOLID",
        color: { r: 1, g: 0.5, b: 0 },
      },
    ];
    expect(executeMain()).toEqual(
      '\n<div className="w-full h-64 bg-orange-600"></div>'
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
      '\n<div className="w-full h-64 bg-gray-800"></div>'
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
      '\n<div className="w-full h-64 bg-gray-800"></div>'
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
      '\n<div className="w-full h-64 border-gray-800 border-4"></div>'
    );
  });

  it("corner radius", () => {
    node.fills = figma.mixed;
    node.strokes = [];
    node.cornerRadius = 8;
    expect(executeMain()).toEqual(
      '\n<div className="w-full h-64 rounded-lg"></div>'
    );
  });

  it("opacity", () => {
    node.cornerRadius = figma.mixed;
    node.opacity = 0.4;
    expect(executeMain()).toEqual(
      '\n<div className="w-full h-64 opacity-50"></div>'
    );
  });

  it("visible", () => {
    node.opacity = 1;
    node.visible = false;
    expect(executeMain()).toEqual("");
  });
});
