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

export const run = (mode: FrameworkTypes) => {
  console.log("run is being run", mode);
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

  if (mode === "Flutter") {
    result = flutterMain(convertedSelection, parentId, material);
  } else if (mode === "Tailwind") {
    result = tailwindMain(convertedSelection, parentId, isJsx, layerName);
  } else if (mode === "SwiftUI") {
    result = swiftuiMain(convertedSelection, parentId);
  } else if (mode === "HTML") {
    result = htmlMain(convertedSelection, parentId, isJsx, layerName);
  }

  console.log(result);

  figma.ui.postMessage({
    type: "code",
    data: result,
  });

  if (
    mode === "Tailwind" ||
    mode === "Flutter" ||
    mode === "HTML" ||
    mode === "SwiftUI"
  ) {
    figma.ui.postMessage({
      type: "colors",
      data: retrieveGenericSolidUIColors(convertedSelection, mode),
    });

    figma.ui.postMessage({
      type: "gradients",
      data: retrieveGenericLinearGradients(convertedSelection, mode),
    });
  }
  if (mode === "Tailwind") {
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
