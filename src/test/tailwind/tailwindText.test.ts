import { tailwindTextNodeBuilder } from "./../../tailwind/builderText";
import { tailwindMain } from "./../../tailwind/tailwindMain";
import { flutterMain } from "./../../flutter/flutterMain";
import { AltTextNode } from "./../../common/altMixins";
import { convertSingleNodeToAlt } from "../../common/altConversion";
import { tailwindPosition } from "../../tailwind/builderImpl/tailwindPosition";
import { AltGroupNode, AltFrameNode } from "../../common/altMixins";
import { createFigma } from "figma-api-stub";

describe("AltText", () => {
  const figma = createFigma({
    simulateErrors: true,
    isWithoutTimeout: false,
  });
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = figma;
  it("textAutoResize", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.textAutoResize = "NONE";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="h-4 w-4"></p>'
    );

    node.textAutoResize = "HEIGHT";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="w-4"></p>'
    );

    node.textAutoResize = "WIDTH_AND_HEIGHT";
    expect(tailwindMain("", [node], false, false)).toEqual('<p></p>');
  });

  it("textAlignHorizontal", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.textAutoResize = "WIDTH_AND_HEIGHT";
    node.textAlignHorizontal = "LEFT";
    expect(tailwindMain("", [node], false, false)).toEqual('<p></p>');

    node.textAutoResize = "NONE";
    node.textAlignHorizontal = "CENTER";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="h-4 w-4 text-center"></p>'
    );

    node.textAlignHorizontal = "JUSTIFIED";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="h-4 w-4 text-justified"></p>'
    );
  });

  it("textAlignHorizontal", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.textAutoResize = "WIDTH_AND_HEIGHT";
    node.textAlignHorizontal = "LEFT";
    expect(tailwindMain("", [node], false, false)).toEqual('<p></p>');

    node.textAutoResize = "NONE";
    node.textAlignHorizontal = "CENTER";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="h-4 w-4 text-center"></p>'
    );

    node.textAlignHorizontal = "JUSTIFIED";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="h-4 w-4 text-justified"></p>'
    );
  });

  it("fontSize", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.fontSize = 16;

    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="text-base"></p>'
    );
  });

  it("fontName", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.fontName = {
      family: "inter",
      style: "bold",
    };
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="font-bold"></p>'
    );

    node.fontName = {
      family: "inter",
      style: "medium italic",
    };
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="italic font-medium"></p>'
    );

    node.fontName = {
      family: "inter",
      style: "regular",
    };
    expect(tailwindMain("", [node], false, false)).toEqual('<p></p>');
  });

  it("letterSpacing", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.letterSpacing = {
      value: 110,
      unit: "PERCENT",
    };
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="tracking-widest"></p>'
    );

    node.letterSpacing = {
      value: 10,
      unit: "PIXELS",
    };
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="tracking-widest"></p>'
    );
  });

  it("lineHeight", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.lineHeight = {
      value: 110,
      unit: "PERCENT",
    };
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="leading-none"></p>'
    );

    node.lineHeight = {
      value: 10,
      unit: "PIXELS",
    };
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="leading-3"></p>'
    );
  });

  it("textCase", () => {
    const node = new AltTextNode();
    node.characters = "";

    node.textCase = "LOWER";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="lowercase"></p>'
    );

    node.textCase = "TITLE";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="capitalize"></p>'
    );

    node.textCase = "UPPER";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="uppercase"></p>'
    );

    node.textCase = "ORIGINAL";
    expect(tailwindMain("", [node], false, false)).toEqual('<p></p>');
  });

  it("lineHeight", () => {
    const node = new AltTextNode();
    node.characters = "";

    node.textDecoration = "NONE";
    expect(tailwindMain("", [node], false, false)).toEqual('<p></p>');

    node.textDecoration = "STRIKETHROUGH";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="line-through"></p>'
    );

    node.textDecoration = "UNDERLINE";
    expect(tailwindMain("", [node], false, false)).toEqual(
      '<p class="underline"></p>'
    );
  });

  it("reset", () => {
    const node = new AltTextNode();
    node.characters = "";

    const builder = new tailwindTextNodeBuilder(false, node, false);
    builder.reset();
    expect(builder.build()).toEqual("");
  });
});
