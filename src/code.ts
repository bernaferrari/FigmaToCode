import { flutterMain } from "./flutter/flutter_main";
let parentId: string = "";

// check [ignoreStackParent] description
if (figma.currentPage.selection.length > 0) {
  parentId = figma.currentPage.selection[0].parent?.id ?? "";
}

const result = flutterMain(parentId, figma.currentPage.selection);
console.log(result);
figma.closePlugin();

// figma.ui.onmessage = (msg) => {
//   recur(figma.currentPage.selection);
//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
// };
