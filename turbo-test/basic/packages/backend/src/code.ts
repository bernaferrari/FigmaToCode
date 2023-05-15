import { convertIntoAltNodes } from "./altNodes/altConversion";
import {
  retrieveGenericSolidUIColors,
  retrieveGenericLinearGradients,
} from "./common/retrieveUI/retrieveColors";
import { flutterMain } from "./flutter/flutterMain";
import { htmlMain } from "./html/htmlMain";
import { swiftuiMain } from "./swiftui/swiftuiMain";
import { retrieveTailwindText } from "./tailwind/retrieveUI/retrieveTexts";
import { tailwindMain } from "./tailwind/tailwindMain";

let parentId: string;
let isJsx = false;
let layerName = false,
  material = true;

export type FrameworkTypes = "Flutter" | "SwiftUI" | "HTML" | "Tailwind";

export const run = (framework: FrameworkTypes) => {
  console.log("run is being run", framework);
  // ignore when nothing was selected
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: "empty",
    });
    return;
  }

  // check [ignoreStackParent] description
  if (figma.currentPage.selection.length > 0) {
    parentId = figma.currentPage.selection[0].parent?.id ?? "";
  }

  let result = "";

  const convertedSelection = convertIntoAltNodes(
    figma.currentPage.selection,
    null
  );

  if (framework === "Flutter") {
    result = flutterMain(convertedSelection, parentId, material);
  } else if (framework === "Tailwind") {
    result = tailwindMain(convertedSelection, parentId, isJsx, layerName);
  } else if (framework === "SwiftUI") {
    result = swiftuiMain(convertedSelection, parentId);
  } else if (framework === "HTML") {
    result = htmlMain(convertedSelection, parentId, isJsx, layerName);
  }

  console.log(result);

  figma.ui.postMessage({
    type: "code",
    framework: framework,
    data: result,
  });

  if (
    framework === "Tailwind" ||
    framework === "Flutter" ||
    framework === "HTML" ||
    framework === "SwiftUI"
  ) {
    figma.ui.postMessage({
      type: "colors",
      data: retrieveGenericSolidUIColors(convertedSelection, framework),
    });

    figma.ui.postMessage({
      type: "gradients",
      data: retrieveGenericLinearGradients(convertedSelection, framework),
    });
  }
  if (framework === "Tailwind") {
    figma.ui.postMessage({
      type: "text",
      data: retrieveTailwindText(convertedSelection),
    });
  }
};

// efficient? No. Works? Yes.
// todo pass data instead of relying in types
// figma.ui.onmessage = (msg) => {
//   if (
//     msg.type === "tailwind" ||
//     msg.type === "flutter" ||
//     msg.type === "swiftui" ||
//     msg.type === "html"
//   ) {
//     mode = msg.type;
//     run();
//   } else if (msg.type === "jsx" && msg.data !== isJsx) {
//     isJsx = msg.data;
//     run();
//   } else if (msg.type === "layerName" && msg.data !== layerName) {
//     layerName = msg.data;
//     run();
//   } else if (msg.type === "material" && msg.data !== material) {
//     material = msg.data;
//     run();
//   }
// };
