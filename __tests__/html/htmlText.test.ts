import { htmlMain } from "./../../src/html/htmlMain";
import { AltTextNode } from "../../src/altNodes/altMixins";

describe("HTML Text", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };
  it("textAutoResize", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.textAutoResize = "NONE";
    expect(htmlMain([node])).toEqual(
      '<p style="width: 16px; height: 16px;"></p>'
    );

    node.textAutoResize = "HEIGHT";
    expect(htmlMain([node])).toEqual('<p style="width: 16px;"></p>');

    node.textAutoResize = "WIDTH_AND_HEIGHT";
    expect(htmlMain([node])).toEqual("<p></p>");
  });

  it("textAlignHorizontal", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.textAutoResize = "WIDTH_AND_HEIGHT";
    node.textAlignHorizontal = "LEFT";
    expect(htmlMain([node])).toEqual("<p></p>");

    node.textAutoResize = "NONE";
    node.textAlignHorizontal = "CENTER";
    expect(htmlMain([node])).toEqual(
      '<p style="width: 16px; height: 16px; text-align: center;"></p>'
    );

    node.textAutoResize = "NONE";
    node.textAlignHorizontal = "RIGHT";
    expect(htmlMain([node])).toEqual(
      '<p style="width: 16px; height: 16px; text-align: right;"></p>'
    );

    node.textAlignHorizontal = "JUSTIFIED";
    expect(htmlMain([node])).toEqual(
      '<p style="width: 16px; height: 16px; text-align: justify;"></p>'
    );
  });
  it("fontSize", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.fontSize = 16;
    node.textAutoResize = "WIDTH_AND_HEIGHT";

    expect(htmlMain([node])).toEqual('<p style="font-size: 16px;"></p>');
  });

  it("fontName", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.textAutoResize = "WIDTH_AND_HEIGHT";

    node.fontName = {
      family: "inter",
      style: "bold",
    };
    expect(htmlMain([node])).toEqual('<p style="font-weight: 700;"></p>');

    node.fontName = {
      family: "inter",
      style: "medium italic",
    };
    expect(htmlMain([node])).toEqual(
      '<p style="font-style: italic; font-weight: 500;"></p>'
    );

    node.fontName = {
      family: "inter",
      style: "regular",
    };
    expect(htmlMain([node])).toEqual("<p></p>");

    node.fontName = {
      family: "inter",
      style: "doesn't exist",
    };
    expect(htmlMain([node])).toEqual("<p></p>");
  });

  it("letterSpacing", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.fontSize = 24;
    node.textAutoResize = "WIDTH_AND_HEIGHT";

    node.letterSpacing = {
      value: 110,
      unit: "PERCENT",
    };
    expect(htmlMain([node])).toEqual(
      '<p style="font-size: 24px; letter-spacing: 26.40px;"></p>'
    );

    node.letterSpacing = {
      value: 10,
      unit: "PIXELS",
    };
    expect(htmlMain([node])).toEqual(
      '<p style="font-size: 24px; letter-spacing: 10px;"></p>'
    );
  });

  it("lineHeight", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.textAutoResize = "WIDTH_AND_HEIGHT";
    node.fontSize = 24;

    node.lineHeight = {
      value: 110,
      unit: "PERCENT",
    };
    expect(htmlMain([node])).toEqual(
      '<p style="font-size: 24px; line-height: 26.40px;"></p>'
    );

    node.lineHeight = {
      value: 10,
      unit: "PIXELS",
    };
    expect(htmlMain([node])).toEqual(
      '<p style="font-size: 24px; line-height: 10px;"></p>'
    );
  });

  it("textCase", () => {
    const node = new AltTextNode();
    node.characters = "";

    node.textCase = "LOWER";
    expect(htmlMain([node])).toEqual(
      '<p style="text-transform: lowercase;"></p>'
    );

    node.textCase = "TITLE";
    expect(htmlMain([node])).toEqual(
      '<p style="text-transform: capitalize;"></p>'
    );

    node.textCase = "UPPER";
    expect(htmlMain([node])).toEqual(
      '<p style="text-transform: uppercase;"></p>'
    );

    node.textCase = "ORIGINAL";
    expect(htmlMain([node])).toEqual("<p></p>");
  });

  it("textDecoration", () => {
    const node = new AltTextNode();
    node.characters = "";

    node.textDecoration = "NONE";
    expect(htmlMain([node])).toEqual("<p></p>");

    node.textDecoration = "STRIKETHROUGH";
    expect(htmlMain([node])).toEqual(
      '<p style="text-decoration: line-through;"></p>'
    );

    node.textDecoration = "UNDERLINE";
    expect(htmlMain([node])).toEqual(
      '<p style="text-decoration: underline;"></p>'
    );
  });
});
