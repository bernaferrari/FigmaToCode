import { nearestColorFrom } from "../../nearest-color/nearestColor";

// the own developer didn't test it, but I'm testing.
describe("Nearest color", () => {
  it("3 hex", () => {
    const nearest = nearestColorFrom(["fff", "000"]);
    expect(nearest("ff0")).toEqual("fff");
    expect(nearest("0f0")).toEqual("000");
  });

  it("objects", () => {
    const nearest = nearestColorFrom(["fff", "000"]);
    expect(nearest({ r: 0, g: 0, b: 100 })).toEqual("000");
    expect(nearest({ r: 250, g: 220, b: 180 })).toEqual("fff");
  });

  it("invalid", () => {
    const nearest = nearestColorFrom(["fff", "000"]);
    expect(() => nearest("ff111111111")).toThrow();
  });
});
