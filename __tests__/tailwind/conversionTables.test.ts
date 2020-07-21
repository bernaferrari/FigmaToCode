import {
  nearestValue,
  pxToFontSize,
  pxToBorderRadius,
  pxToLayoutSize,
  pxToLetterSpacing,
  pxToLineHeight,
} from "../../src/tailwind/conversionTables";

describe("Tailwind Conversion Table", () => {
  it("test nearestValue", () => {
    expect(nearestValue(1, [0, 2])).toEqual(0);
    expect(nearestValue(1, [0, 3])).toEqual(0);
    expect(nearestValue(2, [0, 3])).toEqual(3);

    expect(nearestValue(0.3, [0, 0.5])).toEqual(0.5);
    expect(nearestValue(0.25, [0, 0.5])).toEqual(0);
    expect(nearestValue(0, [0, 0.01])).toEqual(0);
  });

  it("convert pixels to tailwind values", () => {
    expect(pxToLineHeight(16)).toEqual("none");
    expect(pxToLineHeight(40)).toEqual("10");

    expect(pxToLetterSpacing(-0.4)).toEqual("tight");
    expect(pxToLetterSpacing(0.4)).toEqual("wide");

    expect(pxToFontSize(14)).toEqual("sm");
    expect(pxToFontSize(18)).toEqual("lg");

    expect(pxToBorderRadius(2)).toEqual("-sm");
    expect(pxToBorderRadius(8)).toEqual("-lg");

    expect(pxToLayoutSize(4)).toEqual("1");
    expect(pxToLayoutSize(256)).toEqual("64");
  });
});
