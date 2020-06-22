import { tailwindMain } from "./tailwind/tailwindMain";
import { flutterMain } from "./flutter/flutter_main";
import { retrieveFlutterColors } from "./flutter/retrieveUI/retrieveColors";
import { retrieveTailwindColors } from "./tailwind/retrieveUI/retrieveColors";
import { retrieveTailwindText } from "./tailwind/retrieveUI/retrieveTexts";
import { convertIntoAltNodes } from "./common/altConversion";

let parentId: string = "";
let isJsx = false;
let layerName = false;
let material = true;

let mode:
  | "flutter"
  | "swiftui"
  | "html"
  | "tailwind"
  | "bootstrap"
  | "material";

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
    undefined
  );

  // @ts-ignore
  if (mode === "flutter") {
    result = flutterMain(parentId, convertedSelection, material);
  } else if (mode === "tailwind") {
    result = tailwindMain(parentId, convertedSelection, isJsx, layerName);
  }

  console.log(result);

  figma.ui.postMessage({
    type: "result",
    data: result,
  });

  if (mode === "tailwind") {
    figma.ui.postMessage({
      type: "colors",
      data: retrieveTailwindColors(convertedSelection),
    });
  } else if (mode === "flutter") {
    figma.ui.postMessage({
      type: "colors",
      data: retrieveFlutterColors(convertedSelection),
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
  if (msg.type === "tailwind") {
    mode = "tailwind";
    run();
  } else if (msg.type === "flutter") {
    mode = "flutter";
    run();
  } else if (msg.type === "jsx-true") {
    if (!isJsx) {
      isJsx = true;
      run();
    }
  } else if (msg.type === "jsx-false") {
    if (isJsx) {
      isJsx = false;
      run();
    }
  } else if (msg.type === "layerName-true") {
    if (!layerName) {
      layerName = true;
      run();
    }
  } else if (msg.type === "layerName-false") {
    if (layerName) {
      layerName = false;
      run();
    }
  } else if (msg.type === "material") {
    console.log("data is ", msg.data);
    if (msg.data === true && !material) {
      material = true;
      run();
    } else if (msg.data === false && material) {
      material = false;
      run();
    }
  }
};
