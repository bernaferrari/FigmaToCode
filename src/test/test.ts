import { expect } from "chai";
import { nearestColor, getTailwindColor } from "../tailwind/tailwind_helpers";

describe("Nearest colors", () => {
  it("can it identify nearby colors?", () => {
    expect(nearestColor("#fff5f5")).to.equal("#fff5f5");
    expect(nearestColor("#fff5f4")).to.equal("#fff5f5");
    expect(nearestColor("#fff5f6")).to.equal("#fff5f5");
  });

  it("can it identify tailwind colors?", () => {
    const tailwindCompare = (color: string, equals: string) => {
      expect(getTailwindColor(color)).to.equal(equals);
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
