import { tailwindMain } from "./tailwind/tailwind_main";
import { flutterMain } from "./flutter/flutter_main";
import { extractTailwindColors } from "./tailwind/extract_colors";
import { extractTailwindText } from "./tailwind/extract_text";
import { convertIntoAltNodes } from "./common/altConversion";

let parentId: string = "";
let isJsx = false;

figma.showUI(__html__, { width: 500, height: 400 });

const run = (
  mode: "flutter" | "swiftui" | "html" | "tailwind" | "bootstrap" | "material",
  isJSX: boolean = false
) => {
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
    result = flutterMain(parentId, figma.currentPage.selection);
  } else if (mode === "tailwind") {
    result = tailwindMain(parentId, convertedSelection, isJSX);
  }

  console.log(result);

  figma.ui.postMessage({
    type: "result",
    data: result,
  });

  figma.ui.postMessage({
    type: "colors",
    data: extractTailwindColors(convertedSelection),
  });

  figma.ui.postMessage({
    type: "text",
    data: extractTailwindText(convertedSelection),
  });

  // figma.ui.onmessage = (msg) => {
  //   console.log("onMessage: ", msg);
  //   console.log(msg);
  //   if (msg === "all") {
  //     // @ts-ignore
  //     if (mode === "flutter") {
  //       result = flutterMain(parentId, figma.currentPage.selection);
  //     } else if (mode === "tailwind") {
  //       result = tailwindMain(parentId, figma.currentPage.selection);
  //     }
  //   } else if (msg === "colors") {
  //     figma.ui.postMessage({
  //       type: "colors",
  //       data: extractTailwindColors(figma.currentPage.selection),
  //     });
  //   } else {
  //     figma.closePlugin();
  //   }
  // };
};

figma.ui.onmessage = (msg) => {
  console.log("onMessage: ", msg);
  console.log(msg);
  run(msg, isJsx);
};

figma.on("selectionchange", () => {
  run("tailwind", isJsx);
});

// first run
run("tailwind", isJsx);
