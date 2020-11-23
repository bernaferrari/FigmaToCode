import {
  tailwindNearestColor,
  getTailwindColor,
} from "../../src/tailwind/builderImpl/tailwindColor";

describe("Nearest colors", () => {
  it("can it identify nearby colors?", () => {
    expect(tailwindNearestColor("#fff5f5")).toEqual("#fef2f2");
    expect(tailwindNearestColor("#fff5f4")).toEqual("#fef2f2");
    expect(tailwindNearestColor("#fff5f6")).toEqual("#fdf2f8");
  });

  it("can it identify tailwind colors?", () => {
    const tailwindCompare = (color: string | RGB, equals: string) => {
      expect(getTailwindColor(color)).toEqual(equals);
    };

    tailwindCompare({ r: 255, g: 245, b: 244 }, "red-50");

    tailwindCompare("#fed7d6", "red-100");
    tailwindCompare("#fed7d7", "red-100");
    tailwindCompare("#fed7d8", "red-100");

    tailwindCompare("#feb2b1", "red-300");
    tailwindCompare("#feb2b2", "red-300");
    tailwindCompare("#feb2b3", "red-300");

    tailwindCompare("#fc8180", "red-400");
    tailwindCompare("#fc8181", "red-400");
    tailwindCompare("#fc8182", "red-400");
  });
});
