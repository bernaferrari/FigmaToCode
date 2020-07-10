import { tailwindMain } from "../../src/tailwind/tailwindMain";
import { AltGroupNode, AltRectangleNode } from "../../src/altNodes/altMixins";
import { convertGroupToFrame } from "../../src/altNodes/convertGroupToFrame";
import { convertToAutoLayout } from "../../src/altNodes/convertToAutoLayout";

describe("Convert Group to Frame", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("Simple conversion", () => {
    const rectangle = new AltRectangleNode();
    rectangle.x = 20;
    rectangle.y = 20;
    rectangle.width = 20;
    rectangle.height = 20;

    const group = new AltGroupNode();
    group.x = 20;
    group.y = 20;
    group.width = 20;
    group.height = 20;
    group.children = [rectangle];

    const converted = convertToAutoLayout(convertGroupToFrame(group));
    expect(tailwindMain([converted])).toEqual(`<div class="w-5">
<div class="w-full h-5"></div></div>`);
  });

  it("Correctly position the children", () => {
    const rect0 = new AltRectangleNode();
    rect0.x = 200;
    rect0.y = 200;
    rect0.width = 20;
    rect0.height = 20;

    const rect1 = new AltRectangleNode();
    rect1.x = 220;
    rect1.y = 220;
    rect1.width = 20;
    rect1.height = 20;

    const rect2 = new AltRectangleNode();
    rect2.x = 240;
    rect2.y = 240;
    rect2.width = 20;
    rect2.height = 20;

    const group = new AltGroupNode();
    group.x = 200;
    group.y = 200;
    group.width = 260;
    group.height = 260;
    group.children = [rect0, rect1, rect2];

    const newFrame = convertGroupToFrame(group);

    expect(newFrame.children[0].x).toEqual(0);
    expect(newFrame.children[0].y).toEqual(0);

    expect(newFrame.children[1].x).toEqual(20);
    expect(newFrame.children[1].x).toEqual(20);

    expect(newFrame.children[2].x).toEqual(40);
    expect(newFrame.children[2].x).toEqual(40);
  });
});
