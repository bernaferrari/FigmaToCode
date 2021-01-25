import { retrieveTailwindText } from "./tailwind/retrieveUI/retrieveTexts";
import {
  retrieveGenericLinearGradients,
  retrieveGenericSolidUIColors,
} from "./common/retrieveUI/retrieveColors";
import { htmlMain } from "./html/htmlMain";
import { swiftuiMain } from "./swiftui/swiftuiMain";
import { tailwindMain } from "./tailwind/tailwindMain";
import { flutterMain } from "./flutter/flutterMain";
import { convertIntoAltNodes } from "./altNodes/altConversion";

let parentId: string;
let isJsx = false;
let layerName = false;
let material = true;

let mode: "flutter" | "swiftui" | "html" | "tailwind";

figma.showUI(__html__, { width: 450, height: 550 });

const run = () => {
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

  // @ts-ignore
  if (mode === "flutter") {
    result = flutterMain(convertedSelection, parentId, material);
  } else if (mode === "tailwind") {
    result = tailwindMain(convertedSelection, parentId, isJsx, layerName);
  } else if (mode === "swiftui") {
    result = swiftuiMain(convertedSelection, parentId);
  } else if (mode === "html") {
    result = htmlMain(convertedSelection, parentId, isJsx, layerName);
  }

  console.log(result);

  figma.ui.postMessage({
    type: "result",
    data: result,
  });

  if (
    mode === "tailwind" ||
    mode === "flutter" ||
    mode === "html" ||
    mode === "swiftui"
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
  if (mode === "tailwind") {
    figma.ui.postMessage({
      type: "text",
      data: retrieveTailwindText(convertedSelection),
    });
  }
};

figma.on("selectionchange", () => {
  run();
});

// efficient? No. Works? Yes.
// todo pass data instead of relying in types
figma.ui.onmessage = (msg) => {
  if (
    msg.type === "tailwind" ||
    msg.type === "flutter" ||
    msg.type === "swiftui" ||
    msg.type === "html"
  ) {
    mode = msg.type;
    run();
  } else if (msg.type === "jsx" && msg.data !== isJsx) {
    isJsx = msg.data;
    run();
  } else if (msg.type === "layerName" && msg.data !== layerName) {
    layerName = msg.data;
    run();
  } else if (msg.type === "material" && msg.data !== material) {
    material = msg.data;
    run();
  }
};
