import { swiftuiWeightMatcher } from "./../../src/swiftui/builderImpl/swiftuiTextWeight";
import { swiftuiMain } from "../../src/swiftui/swiftuiMain";
import { AltTextNode } from "../../src/altNodes/altMixins";
import { SwiftuiTextBuilder } from "../../src/swiftui/swiftuiTextBuilder";
import { swiftuiFontMatcher } from "../../src/swiftui/builderImpl/swiftuiTextWeight";

describe("SwiftUI Text", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };
  it("textAlignHorizontal and textAlignVertical", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.characters = "";
    node.textAutoResize = "HEIGHT";

    node.textAlignHorizontal = "LEFT";
    node.textAlignVertical = "TOP";
    expect(swiftuiMain([node])).toEqual(`Text("")
.frame(width: 16, height: 16, alignment: .topLeading)`);

    node.textAlignHorizontal = "CENTER";
    node.textAlignVertical = "TOP";
    expect(swiftuiMain([node])).toEqual(`Text("")
.multilineTextAlignment(.center)
.frame(width: 16, height: 16, alignment: .top)`);

    node.textAlignHorizontal = "RIGHT";
    node.textAlignVertical = "BOTTOM";
    expect(swiftuiMain([node])).toEqual(`Text("")
.multilineTextAlignment(.trailing)
.frame(width: 16, height: 16, alignment: .bottomTrailing)`);

    node.textAlignHorizontal = "CENTER";
    node.textAlignVertical = "CENTER";
    expect(swiftuiMain([node])).toEqual(
      `Text("")
.multilineTextAlignment(.center)
.frame(width: 16, height: 16)`
    );
  });

  //   it("fontName", () => {
  //     const node = new AltTextNode();
  //     node.characters = "";
  //     node.width = 16;
  //     node.height = 16;
  //     node.textAutoResize = "WIDTH_AND_HEIGHT";

  //     node.fontName = {
  //       family: "inter",
  //       style: "bold",
  //     };
  //     expect(swiftuiMain([node])).toEqual(`Text("")
  // .fontWeight(.bold)`);

  //     node.fontName = {
  //       family: "inter",
  //       style: "medium italic",
  //     };
  //     expect(swiftuiMain([node])).toEqual('<p class="italic font-medium"></p>');

  //     node.fontName = {
  //       family: "inter",
  //       style: "regular",
  //     };
  //     expect(swiftuiMain([node])).toEqual("<p></p>");
  //   });

  it("letterSpacing/tracking", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.textAutoResize = "WIDTH_AND_HEIGHT";
    node.fontSize = 10;

    node.letterSpacing = {
      value: 110,
      unit: "PERCENT",
    };
    expect(swiftuiMain([node])).toEqual(
      'Text("")\n.font(.caption2)\n.tracking(11)'
    );

    node.letterSpacing = {
      value: 10,
      unit: "PIXELS",
    };
    expect(swiftuiMain([node])).toEqual(
      'Text("")\n.font(.caption2)\n.tracking(10)'
    );
  });

  it("lineHeight/lineSpacing", () => {
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
    expect(swiftuiMain([node])).toEqual(
      'Text("")\n.font(.title)\n.lineSpacing(26.40)'
    );

    node.lineHeight = {
      value: 10,
      unit: "PIXELS",
    };
    expect(swiftuiMain([node])).toEqual(
      'Text("")\n.font(.title)\n.lineSpacing(10)'
    );
  });

  it("textCase", () => {
    const node = new AltTextNode();
    node.characters = "ThInK dIfFeReNt";

    node.textCase = "LOWER";
    expect(swiftuiMain([node])).toEqual('Text("think different")');

    node.textCase = "TITLE";
    // todo solve this
    expect(swiftuiMain([node])).toEqual('Text("ThInK dIfFeReNt")');

    node.textCase = "UPPER";
    expect(swiftuiMain([node])).toEqual('Text("THINK DIFFERENT")');

    node.textCase = "ORIGINAL";
    expect(swiftuiMain([node])).toEqual('Text("ThInK dIfFeReNt")');
  });

  it("textDecoration", () => {
    const node = new AltTextNode();
    node.characters = "";

    node.textDecoration = "NONE";
    expect(swiftuiMain([node])).toEqual('Text("")');

    node.textDecoration = "STRIKETHROUGH";
    expect(swiftuiMain([node])).toEqual(`Text("")\n.strikethrough()`);

    node.textDecoration = "UNDERLINE";
    expect(swiftuiMain([node])).toEqual(`Text("")\n.underline()`);

    node.textDecoration = "NONE";
    node.fontName = {
      family: "inter",
      style: "medium italic",
    };
    expect(swiftuiMain([node])).toEqual(`Text("")\n.italic()`);
  });

  it("more complex examples", () => {
    const node = new AltTextNode();
    node.width = 100;
    node.height = 100;
    node.characters = "";
    node.fontSize = 12;
    node.fontName = {
      family: "inter",
      style: "bold",
    };
    node.textAlignVertical = "CENTER";
    node.textAlignHorizontal = "RIGHT";
    node.textAutoResize = "NONE";

    expect(swiftuiMain([node])).toEqual(`Text("")
.fontWeight(.bold)
.font(.caption)
.multilineTextAlignment(.trailing)
.frame(width: 100, height: 100, alignment: .trailing)`);

    node.textAlignHorizontal = "CENTER";
    node.fontName = figma.mixed;

    expect(swiftuiMain([node])).toEqual(`Text("")
.font(.caption)
.multilineTextAlignment(.center)
.frame(width: 100, height: 100)`);

    node.characters = "a\nb\nc";
    node.textAutoResize = "WIDTH_AND_HEIGHT";
    expect(swiftuiMain([node])).toEqual('Text("a\\nb\\nc")\n.font(.caption)');
  });

  it("swiftuiFontMatcher", () => {
    const node = new AltTextNode();
    node.characters = "";

    node.fontSize = figma.mixed;
    expect(swiftuiFontMatcher(node)).toEqual("");

    node.fontSize = 11;
    expect(swiftuiFontMatcher(node)).toEqual(".caption2");

    node.fontSize = 12;
    expect(swiftuiFontMatcher(node)).toEqual(`.caption`);

    node.fontSize = 13;
    expect(swiftuiFontMatcher(node)).toEqual(`.footnote`);

    node.fontSize = 15;
    expect(swiftuiFontMatcher(node)).toEqual(`.subheadline`);

    node.fontSize = 16;
    expect(swiftuiFontMatcher(node)).toEqual(`.callout`);

    node.fontSize = 17;
    expect(swiftuiFontMatcher(node)).toEqual(`.body`);

    node.fontSize = 20;
    expect(swiftuiFontMatcher(node)).toEqual(`.title3`);

    node.fontSize = 22;
    expect(swiftuiFontMatcher(node)).toEqual(`.title2`);

    node.fontSize = 28;
    expect(swiftuiFontMatcher(node)).toEqual(`.title`);

    node.fontSize = 34;
    expect(swiftuiFontMatcher(node)).toEqual(`.largeTitle`);
  });

  it("swiftuiWeightMatcher", () => {
    expect(swiftuiWeightMatcher("100")).toEqual(".ultraLight");
    expect(swiftuiWeightMatcher("200")).toEqual(".thin");
    expect(swiftuiWeightMatcher("300")).toEqual(".light");
    expect(swiftuiWeightMatcher("400")).toEqual(".regular");
    expect(swiftuiWeightMatcher("500")).toEqual(".medium");
    expect(swiftuiWeightMatcher("600")).toEqual(".semibold");
    expect(swiftuiWeightMatcher("700")).toEqual(".bold");
    expect(swiftuiWeightMatcher("800")).toEqual(".heavy");
    expect(swiftuiWeightMatcher("900")).toEqual(".black");
  });
  it("reset", () => {
    const node = new AltTextNode();
    node.characters = "";

    const builder = new SwiftuiTextBuilder();
    builder.reset();
    expect(builder.build()).toEqual("");
  });
});
