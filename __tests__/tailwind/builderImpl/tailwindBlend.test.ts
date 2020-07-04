import { tailwindVisibility } from "../../../src/tailwind/builderImpl/tailwindBlend";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";

import {
  tailwindOpacity,
  tailwindRotation,
} from "../../../src/tailwind/builderImpl/tailwindBlend";

describe("Tailwind Blend", () => {
  const node = new AltRectangleNode();

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

  it("visibility", () => {
    // undefined (unitialized, only happen on tests)
    expect(tailwindVisibility(node)).toEqual("");

    node.visible = false;
    expect(tailwindVisibility(node)).toEqual("invisible ");

    node.visible = true;
    expect(tailwindVisibility(node)).toEqual("");
  });

  it("rotation", () => {
    // avoid rounding errors
    node.rotation = -7.0167096047110005e-15;
    expect(tailwindRotation(node)).toEqual("");

    node.rotation = 45;
    expect(tailwindRotation(node)).toEqual("rotate-45 ");

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
