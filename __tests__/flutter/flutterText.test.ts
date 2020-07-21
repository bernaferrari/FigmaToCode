import { FlutterTextBuilder } from "./../../src/flutter/flutterTextBuilder";
import { flutterMain } from "./../../src/flutter/flutterMain";
import { AltTextNode } from "../../src/altNodes/altMixins";

describe("Flutter Text", () => {
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
    expect(flutterMain([node])).toEqual(
      'SizedBox(width: 16, height: 16, child: Text("", ), )'
    );

    node.textAutoResize = "HEIGHT";
    expect(flutterMain([node])).toEqual(
      'SizedBox(width: 16, child: Text("", ), )'
    );

    node.textAutoResize = "WIDTH_AND_HEIGHT";
    expect(flutterMain([node])).toEqual('Text("", ),');
  });

  // it("textAlignHorizontal", () => {
  //   const node = new AltTextNode();
  //   node.characters = "";
  //   node.width = 16;
  //   node.height = 16;

  //   node.textAutoResize = "WIDTH_AND_HEIGHT";
  //   node.textAlignHorizontal = "LEFT";
  //   expect(tailwindMain([node])).toEqual("<p></p>");

  //   node.textAutoResize = "NONE";
  //   node.textAlignHorizontal = "CENTER";
  //   expect(tailwindMain([node])).toEqual('<p class="w-4 h-4 text-center"></p>');

  //   node.textAlignHorizontal = "JUSTIFIED";
  //   expect(tailwindMain([node])).toEqual(
  //     '<p class="w-4 h-4 text-justified"></p>'
  //   );
  // });
  it("fontSize", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.fontSize = 16;
    node.textAutoResize = "WIDTH_AND_HEIGHT";

    expect(flutterMain([node])).toEqual(
      'Text("", style: TextStyle(fontSize: 16, ), ),'
    );
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
    expect(flutterMain([node])).toEqual(
      'Text("", style: TextStyle(fontFamily: "inter", fontWeight: FontWeight.w700, ), ),'
    );

    node.fontName = {
      family: "inter",
      style: "medium italic",
    };
    expect(flutterMain([node])).toEqual(
      'Text("", style: TextStyle(fontStyle: FontStyle.italic, fontFamily: "inter", fontWeight: FontWeight.w400, ), ),'
    );

    node.fontName = {
      family: "inter",
      style: "regular",
    };
    expect(flutterMain([node])).toEqual(
      'Text("", style: TextStyle(fontFamily: "inter", fontWeight: FontWeight.w400, ), ),'
    );
  });

  it("letterSpacing", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.textAutoResize = "WIDTH_AND_HEIGHT";
    node.fontSize = 24;

    node.letterSpacing = {
      value: 110,
      unit: "PERCENT",
    };
    expect(flutterMain([node])).toEqual(
      'Text("", style: TextStyle(fontSize: 24, letterSpacing: 26.40, ), ),'
    );

    node.letterSpacing = {
      value: 10,
      unit: "PIXELS",
    };
    expect(flutterMain([node])).toEqual(
      'Text("", style: TextStyle(fontSize: 24, letterSpacing: 10, ), ),'
    );
  });

  it("lineHeight", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.textAutoResize = "WIDTH_AND_HEIGHT";

    node.lineHeight = {
      value: 110,
      unit: "PERCENT",
    };
    expect(flutterMain([node])).toEqual('Text("", ),');

    node.lineHeight = {
      value: 10,
      unit: "PIXELS",
    };
    expect(flutterMain([node])).toEqual('Text("", ),');
  });

  it("textCase", () => {
    const node = new AltTextNode();
    node.characters = "aA";

    node.textCase = "LOWER";
    expect(flutterMain([node])).toEqual('Text("aa", ),');

    // todo implement it
    // node.textCase = "TITLE";
    // expect(flutterMain([node])).toEqual('Text("Aa", ),');

    node.textCase = "UPPER";
    expect(flutterMain([node])).toEqual('Text("AA", ),');

    node.textCase = "ORIGINAL";
    expect(flutterMain([node])).toEqual('Text("aA", ),');

    node.textAlignHorizontal = "CENTER";
    node.layoutAlign = "MIN";
    expect(flutterMain([node])).toEqual(
      'Text("aA", textAlign: TextAlign.center, ),'
    );

    node.textAlignHorizontal = "JUSTIFIED";
    node.layoutAlign = "MIN";
    expect(flutterMain([node])).toEqual(
      'Text("aA", textAlign: TextAlign.justify, ),'
    );
  });

  it("textDecoration", () => {
    const node = new AltTextNode();
    node.characters = "";

    node.textDecoration = "NONE";
    expect(flutterMain([node])).toEqual('Text("", ),');

    node.textDecoration = "STRIKETHROUGH";
    expect(flutterMain([node])).toEqual('Text("", ),');

    node.textDecoration = "UNDERLINE";
    expect(flutterMain([node])).toEqual(
      'Text("", style: TextStyle(decoration: TextDecoration.underline, ), ),'
    );
  });

  it("reset", () => {
    const node = new AltTextNode();
    node.characters = "";

    const builder = new FlutterTextBuilder("");
    builder.reset();
    expect(builder.child).toEqual("");
  });
});
