import { tailwindMain } from "../../src/tailwind/tailwindMain";
import { AltRectangleNode } from "../../src/altNodes/altMixins";
import { htmlGradient } from "../../src/html/builderImpl/htmlColor";

describe("HTML Gradient", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  const fills: ReadonlyArray<Paint> = [
    {
      type: "GRADIENT_LINEAR",
      visible: true,
      opacity: 1,
      blendMode: "NORMAL",
      gradientStops: [
        {
          color: {
            r: 0.9490196108818054,
            g: 0.6000000238418579,
            b: 0.29019609093666077,
            a: 1,
          },
          position: 0,
        },
        {
          color: {
            r: 0.25882354378700256,
            g: 0.5215686559677124,
            b: 0.95686274766922,
            a: 1,
          },
          position: 0.51273132,
        },
        {
          color: {
            r: 0.239215686917305,
            g: 0.8588235378265381,
            b: 0.5215686559677124,
            a: 1,
          },
          position: 1,
        },
      ],
      gradientTransform: [
        [2, -1.621208589597245e-8, -1],
        [1.6653345369377348e-15, 1.8089882135391235, -1.3089882135391235],
      ],
    },
  ];
  it("test the gradient for inline CSS and JSX", () => {
    expect(htmlGradient(fills)).toEqual(
      "linear-gradient(90deg, rgba(242,153,74,1), rgba(66,133,244,1) 51%, rgba(61,219,133,1))"
    );

    // const node = new AltRectangleNode();
    // node.width = 16;
    // node.height = 16;
    // node.fills = fills;
    // expect(tailwindMain([node])).toEqual(
    //   '<div class="w-4 h-4" style="background: linear-gradient(90deg, rgba(242,153,74,1), rgba(66,133,244,1) 51%, rgba(61,219,133,1));"></div>'
    // );
  });
});
