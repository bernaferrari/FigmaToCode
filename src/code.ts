import { extractFlutterColors } from "./flutter/extract_colors";
import { tailwindMain } from "./tailwind/tailwind_main";
import { flutterMain } from "./flutter/flutter_main";
import { extractTailwindColors } from "./tailwind/extract_colors";
import { extractTailwindText } from "./tailwind/extract_text";
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
      data: extractTailwindColors(convertedSelection),
    });
  } else if (mode === "flutter") {
    figma.ui.postMessage({
      type: "colors",
      data: extractFlutterColors(convertedSelection),
    });
  }

  if (mode === "tailwind") {
    figma.ui.postMessage({
      type: "text",
      data: extractTailwindText(convertedSelection),
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
  } else if (msg.type === "material-true") {
    if (!material) {
      material = true;
      run();
    }
  } else if (msg.type === "material-false") {
    if (material) {
      material = false;
      run();
    }
  }
};
