import { tailwindMain } from "./tailwind/tailwind_main";
import { flutterMain } from "./flutter/flutter_main";
import { extractTailwindColors } from "./tailwind/colors_extractor";

let parentId: string = "";

figma.showUI(__html__, { width: 300, height: 300 });

// check [ignoreStackParent] description
if (figma.currentPage.selection.length > 0) {
  parentId = figma.currentPage.selection[0].parent?.id ?? "";
}

const isJSX = true;

let mode:
  | "flutter"
  | "swiftui"
  | "html"
  | "tailwind"
  | "bootstrap"
  | "material" = "tailwind";

let result = "";
mode = "tailwind";

// @ts-ignore
if (mode === "flutter") {
  result = flutterMain(parentId, figma.currentPage.selection);
} else if (mode === "tailwind") {
  result = tailwindMain(parentId, figma.currentPage.selection);
}

console.log(result);
figma.ui.onmessage = (msg) => {
  if (msg === "all") {
    // @ts-ignore
    if (mode === "flutter") {
      result = flutterMain(parentId, figma.currentPage.selection);
    } else if (mode === "tailwind") {
      result = tailwindMain(parentId, figma.currentPage.selection);
    }
  } else if (msg === "colors") {
    return extractTailwindColors(figma.currentPage.selection);
  } else {
    figma.closePlugin();
  }
};
