import {
  tailwindNearestColor,
  getTailwindColor,
} from "../../tailwind/colors";

describe("Nearest colors", () => {
  it("can it identify nearby colors?", () => {
    expect(tailwindNearestColor("#fff5f5")).toEqual("#fff5f5");
    expect(tailwindNearestColor("#fff5f4")).toEqual("#fff5f5");
    expect(tailwindNearestColor("#fff5f6")).toEqual("#fff5f5");
  });

  it("can it identify tailwind colors?", () => {
    const tailwindCompare = (color: string, equals: string) => {
      expect(getTailwindColor(color)).toEqual(equals);
    };

    tailwindCompare("#fff5f4", "red-100");
    tailwindCompare("#fff5f5", "red-100");
    tailwindCompare("#fff5f6", "red-100");

    tailwindCompare("#fed7d6", "red-200");
    tailwindCompare("#fed7d7", "red-200");
    tailwindCompare("#fed7d8", "red-200");

    tailwindCompare("#feb2b1", "red-300");
    tailwindCompare("#feb2b2", "red-300");
    tailwindCompare("#feb2b3", "red-300");

    tailwindCompare("#fc8180", "red-400");
    tailwindCompare("#fc8181", "red-400");
    tailwindCompare("#fc8182", "red-400");
  });
});
