import { FlutterTextBuilder } from "./../../src/flutter/flutterTextBuilder";
import { flutterMain } from "./../../src/flutter/flutterMain";
import { AltFrameNode, AltTextNode } from "../../src/altNodes/altMixins";

describe("Flutter Text", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("inside AutoLayout", () => {
    const node = new AltFrameNode();
    node.width = 32;
    node.height = 8;
    node.x = 0;
    node.y = 0;
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "FIXED";
    node.primaryAxisSizingMode = "FIXED";
    node.primaryAxisAlignItems = "MIN";
    node.counterAxisAlignItems = "MIN";
    node.itemSpacing = 8;

    const textNode = new AltTextNode();
    textNode.characters = "";
    textNode.width = 16;
    textNode.height = 16;
    textNode.layoutAlign = "STRETCH";
    textNode.layoutGrow = 1;

    node.children = [textNode];
    textNode.parent = node;

    textNode.textAutoResize = "NONE";
    expect(flutterMain([node])).toEqual(
      `Container(
    width: 32,
    height: 8,
    child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children:[
            Expanded(
                child: SizedBox(
                    height: double.infinity,
                    child: Text(
                        "",
                    ),
                ),
            ),
        ],
    ),
)`
    );
  });
  it("textAutoResize", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.textAutoResize = "NONE";
    expect(flutterMain([node])).toEqual(
      `SizedBox(
    width: 16,
    height: 16,
    child: Text(
        "",
    ),
)`
    );

    node.textAutoResize = "HEIGHT";
    expect(flutterMain([node])).toEqual(
      `SizedBox(
    width: 16,
    child: Text(
        "",
    ),
)`
    );

    node.textAutoResize = "WIDTH_AND_HEIGHT";
    expect(flutterMain([node])).toEqual(`Text(
    "",
)`);
  });

  it("textAlignHorizontal", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;

    node.textAutoResize = "WIDTH_AND_HEIGHT";
    node.textAlignHorizontal = "LEFT";
    expect(flutterMain([node])).toEqual(`Text(
    "",
)`);

    node.textAutoResize = "NONE";
    node.textAlignHorizontal = "CENTER";
    expect(flutterMain([node])).toEqual(
      `SizedBox(
    width: 16,
    height: 16,
    child: Text(
        "",
        textAlign: TextAlign.center,
    ),
)`
    );

    node.textAlignHorizontal = "JUSTIFIED";
    expect(flutterMain([node])).toEqual(
      `SizedBox(
    width: 16,
    height: 16,
    child: Text(
        "",
        textAlign: TextAlign.justify,
    ),
)`
    );
  });
  it("fontSize", () => {
    const node = new AltTextNode();
    node.characters = "";
    node.width = 16;
    node.height = 16;
    node.fontSize = 16;
    node.textAutoResize = "WIDTH_AND_HEIGHT";

    expect(flutterMain([node])).toEqual(
      `Text(
    "",
    style: TextStyle(
        fontSize: 16,
    ),
)`
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
    expect(flutterMain([node])).toEqual(`Text(
    "",
    style: TextStyle(
        fontFamily: "inter",
        fontWeight: FontWeight.w700,
    ),
)`);

    node.fontName = {
      family: "inter",
      style: "medium italic",
    };
    expect(flutterMain([node])).toEqual(`Text(
    "",
    style: TextStyle(
        fontStyle: FontStyle.italic,
        fontFamily: "inter",
        fontWeight: FontWeight.w500,
    ),
)`);

    node.fontName = {
      family: "inter",
      style: "regular",
    };
    expect(flutterMain([node])).toEqual(`Text(
    "",
)`);

    node.fontName = {
      family: "inter",
      style: "doesn't exist",
    };
    expect(flutterMain([node])).toEqual(`Text(
    "",
)`);
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
      `Text(
    "",
    style: TextStyle(
        fontSize: 24,
        letterSpacing: 26.40,
    ),
)`
    );

    node.letterSpacing = {
      value: 10,
      unit: "PIXELS",
    };
    expect(flutterMain([node])).toEqual(
      `Text(
    "",
    style: TextStyle(
        fontSize: 24,
        letterSpacing: 10,
    ),
)`
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
    expect(flutterMain([node])).toEqual(`Text(
    "",
)`);

    node.lineHeight = {
      value: 10,
      unit: "PIXELS",
    };

    expect(flutterMain([node])).toEqual(`Text(
    "",
)`);
  });

  it("textCase", () => {
    const node = new AltTextNode();
    node.characters = "aA";

    node.textCase = "LOWER";
    expect(flutterMain([node])).toEqual(`Text(
    "aa",
)`);

    // todo implement it
    // node.textCase = "TITLE";
    // expect(flutterMain([node])).toEqual('Text("Aa", ),');

    node.textCase = "UPPER";
    expect(flutterMain([node])).toEqual(`Text(
    "AA",
)`);

    node.textCase = "ORIGINAL";
    expect(flutterMain([node])).toEqual(`Text(
    "aA",
)`);

    node.textAlignHorizontal = "CENTER";
    node.layoutAlign = "INHERIT";
    expect(flutterMain([node])).toEqual(`Text(
    "aA",
    textAlign: TextAlign.center,
)`);

    node.textAlignHorizontal = "JUSTIFIED";
    node.layoutAlign = "INHERIT";
    expect(flutterMain([node])).toEqual(`Text(
    "aA",
    textAlign: TextAlign.justify,
)`);
  });

  it("textDecoration", () => {
    const node = new AltTextNode();
    node.characters = "";

    node.textDecoration = "NONE";
    expect(flutterMain([node])).toEqual(`Text(
    "",
)`);

    node.textDecoration = "STRIKETHROUGH";
    expect(flutterMain([node])).toEqual(`Text(
    "",
)`);

    node.textDecoration = "UNDERLINE";
    expect(flutterMain([node])).toEqual(
      `Text(
    "",
    style: TextStyle(
        decoration: TextDecoration.underline,
    ),
)`
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
