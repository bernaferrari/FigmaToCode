import { tailwindSize } from "./../../../tailwind/builderImpl/tailwindSize";
import { tailwindRotation } from "./../../../tailwind/builderImpl/tailwindBlend";
import { AltRectangleNode } from "../../../common/altMixins";
import { tailwindOpacity } from "../../../tailwind/builderImpl/tailwindBlend";

describe("Tailwind Blend", () => {
  const node = new AltRectangleNode();

  it("size for rectangle", () => {
    node.width = 16;
    node.height = 16;
    expect(tailwindSize(node)).toEqual("w-4 h-4 ");

    node.width = 100;
    node.height = 200;
    expect(tailwindSize(node)).toEqual("w-24 h-48 ");

    node.width = 300;
    node.height = 300;
    expect(tailwindSize(node)).toEqual("w-full h-64 ");
  });

  it("opacity", () => {
    node.opacity = 0.1;
    expect(tailwindOpacity(node)).toEqual("opacity-0 ");

    node.opacity = 0.3;
    expect(tailwindOpacity(node)).toEqual("opacity-25 ");

    node.opacity = 0.45;
    expect(tailwindOpacity(node)).toEqual("opacity-50 ");

    node.opacity = 0.65;
    expect(tailwindOpacity(node)).toEqual("opacity-75 ");

    node.opacity = 0.95;
    expect(tailwindOpacity(node)).toEqual("opacity-75 ");
  });

  it("rotation", () => {
    node.rotation = 45;
    expect(tailwindRotation(node)).toEqual("rotate-45 ");

    node.rotation = 90;
    expect(tailwindRotation(node)).toEqual("rotate-90 ");

    node.rotation = 180;
    expect(tailwindRotation(node)).toEqual("rotate-180 ");

    node.rotation = -45;
    expect(tailwindRotation(node)).toEqual("-rotate-45 ");

    node.rotation = -90;
    expect(tailwindRotation(node)).toEqual("-rotate-90 ");

    node.rotation = -180;
    expect(tailwindRotation(node)).toEqual("-rotate-180 ");
  });
});
