import {
  htmlOpacity,
  htmlRotation,
  htmlVisibility,
} from "./../../../src/html/builderImpl/htmlBlend";
import { AltRectangleNode } from "../../../src/altNodes/altMixins";

describe("HTML Blend", () => {
  const node = new AltRectangleNode();

  it("opacity", () => {
    node.opacity = 0.1;
    expect(htmlOpacity(node, false)).toEqual("opacity: 0.10; ");

    node.opacity = 0.3;
    expect(htmlOpacity(node, true)).toEqual("opacity: 0.30, ");

    node.opacity = 1;
    expect(htmlOpacity(node, false)).toEqual("");
  });

  it("visibility", () => {
    // undefined (unitialized, only happen on tests)
    expect(htmlVisibility(node, false)).toEqual("");

    node.visible = false;
    expect(htmlVisibility(node, false)).toEqual("visibility: hidden; ");

    node.visible = false;
    expect(htmlVisibility(node, true)).toEqual("visibility: 'hidden', ");
  });

  it("rotation", () => {
    // avoid rounding errors
    node.rotation = -7.0167096047110005e-15;
    expect(htmlRotation(node, false)).toEqual("");

    node.rotation = 45;
    expect(htmlRotation(node, false)).toEqual("transform: rotate(45deg); ");

    node.rotation = -90;
    expect(htmlRotation(node, true)).toEqual("transform: 'rotate(-90deg)', ");
  });
});
