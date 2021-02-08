import { swiftuiMain } from "./../../swiftui/swiftuiMain";
import { tailwindMain } from "./../../tailwind/tailwindMain";
import { htmlBuilder, htmlMain } from "./../../html/htmlMain";
import { flutterMain } from "./../../flutter/flutterMain";
import { AltSceneNode } from "../../altNodes/altMixins";
import { retrieveTopFill } from "../retrieveFill";
import { calculateContrastRatio, deepFlatten } from "./commonUI";

type exportFramework = "flutter" | "swiftui" | "html" | "tailwind";

export const retrieveGenericUIText = (
  sceneNode: Array<AltSceneNode>,
  framework: exportFramework
): Array<namedText> => {
  // convert to AltNode and then flatten it. Conversion is necessary because of [tailwindText]
  const selectedText = deepFlatten(sceneNode);

  const textStr: Array<namedText> = [];

  selectedText.forEach((node) => {
    if (node.type === "TEXT") {
      let code = "";
      if (framework === "flutter") {
        code = flutterMain([node]);
      } else if (framework === "html") {
        code = htmlMain([node]);
      } else if (framework === "tailwind") {
        code = tailwindMain([node]);
      } else if (framework === "swiftui") {
        code = swiftuiMain([node]);
      }

      let style;
      if (framework === "tailwind") {
        const [builder] = htmlBuilder(node, false);
        style = builder.build();
      } else {
        const [builder] = htmlBuilder(node, false, true);
        style = builder.build();
      }

      const black = {
        r: 0,
        g: 0,
        b: 0,
      };

      let contrastBlack = 21;

      const fill = retrieveTopFill(node.fills);

      if (fill?.type === "SOLID") {
        contrastBlack = calculateContrastRatio(fill.color, black);
      }

      textStr.push({
        name: node.name,
        style: style,
        code: code,
        contrastBlack: contrastBlack,
      });
    }
  });

  // retrieve only unique texts (attr + name)
  // from https://stackoverflow.com/a/18923480/4418073
  const unique: Record<string, boolean> = {};
  const distinct: Array<namedText> = [];
  textStr.forEach(function (x) {
    if (!unique[x.code + x.name]) {
      distinct.push(x);
      unique[x.code + x.name] = true;
    }
  });

  return distinct;
};

type namedText = {
  name: string;
  code: string;
  style: string;
  contrastBlack: number;
};
