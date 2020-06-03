import _ from "lodash";

import { tailwindMain } from "./tailwind/tailwind_main";
import { flutterMain } from "./flutter/flutter_main";
let parentId: string = "";

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
figma.closePlugin();

// figma.ui.onmessage = (msg) => {
//   recur(figma.currentPage.selection);
//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
// };
